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

    const userId = session.user.id as string; // Ensure userId is always a string
    const cacheKey = `resume:${userId}`;

    try {
        if (req.method === "GET") {
            // Check cache first
            const cachedResume = await redis.get(cacheKey);
            if (cachedResume) {
                console.log("🚀 Returning cached resume");
                return res.status(200).json(JSON.parse(cachedResume));
            }

            // If no cache, fetch from database
            console.log("🔄 Fetching resume from database");
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { resume: true },
            });

            if (user?.resume) {
                // Cache the result for 1 hour (3600 seconds)
                await redis.setex(cacheKey, 3600, JSON.stringify(user.resume));
            }

            return res.status(200).json(user?.resume);
        }

        if (req.method === "PUT") {
            const { resume } = req.body;

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { resume },
            });

            // Invalidate cache when updating
            await redis.del(cacheKey);

            return res.status(200).json(updatedUser);
        }

        if (req.method === "POST") {
            const { resume: rawCV } = req.body;

            // Check if cached resume already exists (to avoid redundant API calls)
            const cachedResume = await redis.get(cacheKey);
            if (cachedResume) {
                console.log("✅ Returning cached AI-generated resume");
                return res.status(200).json({ resume: JSON.parse(cachedResume) });
            }

            console.log("🤖 Generating CV with OpenAI...");
            const prompt = `You are an expert CV writer. Create a professional, ATS-optimized CV based on the following raw text. Structure the output in JSON with:
            - Full Name
            - Contact Info (email, phone, location, LinkedIn)
            - Professional Summary
            - Work Experience (company, role, dates, location, achievements)
            - Education (degree, institution, dates)
            - Skills (list)

            Raw CV: ${rawCV}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800,
            });

            const responseContent = completion.choices[0].message.content;
            const structuredData = JSON.parse(responseContent || "{}");

            // Store the generated CV in the database
            await prisma.user.update({
                where: { id: userId },
                data: { resume: structuredData },
            });

            // Cache the AI-generated CV for 24 hours (86400 seconds)
            await redis.setex(cacheKey, 86400, JSON.stringify(structuredData));

            return res.status(200).json({ resume: structuredData });
        }

        return res.status(405).json({ message: "Method not allowed." });
    } catch (error: unknown) {
        console.error("API Error:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
}
