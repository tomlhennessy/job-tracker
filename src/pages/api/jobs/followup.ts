import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import OpenAI from "openai";
import redis from "@/lib/redis";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id;
    const cacheKey = `followup:${userId}`;

    try {
        if (req.method === "GET") {
            // Check Redis Cache first
            const cachedFollowUp = await redis.get(cacheKey);
            if (cachedFollowUp) {
                return res.status(200).json(JSON.parse(cachedFollowUp));
            }

            // Fetch user jobs
            const jobs = await prisma.job.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });

            // Generate AI follow-up suggestions
            const jobDescriptions = jobs.map(job => job.jobDescription).join("\n\n");
            const prompt = `Based on the following job applications, suggest optimal follow-up dates:\n${jobDescriptions}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
            });

            const suggestedDates = completion.choices?.[0]?.message?.content?.split("\n") || [];

            // Store AI recommendations in Redis (cache for 24h)
            await redis.setex(cacheKey, 86400, JSON.stringify(suggestedDates));

            return res.status(200).json({ suggestedDates });
        }

        return res.status(405).json({ message: "Method not allowed." });
    } catch (error) {
        console.error("AI Follow-Up Error:", error);
        return res.status(500).json({ error: "Failed to generate AI follow-up dates." });
    }
}
