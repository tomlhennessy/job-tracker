import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id;

    try {
        if (req.method === "GET") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { resume: true }
            });
            return res.status(200).json(user?.resume);
        }

        if (req.method === "PUT") {
            const { resume } = req.body;

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { resume },
            });

            return res.status(200).json(updatedUser);
        }

        if (req.method === "POST") {
            const { resume: cv } = req.body;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o", // ✅ Using GPT-4o
                messages: [
                    {
                        role: "user",
                        content: `You are an expert CV writer. Improve the following CV to make it more professional, concise, and impactful. Focus on achievements, action verbs, and clarity.\n\nCV:\n${cv}`
                    }
                ],
                max_tokens: 800 // ✅ Limit to 800 tokens for output control
            });

            const enhancedResume = completion.choices[0].message.content;

            // ✅ Guard clause for usage
            const usage = completion.usage;
            if (usage) {
                console.log("Tokens Used:", usage);

                // 🚨 Cost Estimation (adjust based on current OpenAI pricing)
                const inputCost = (usage.prompt_tokens / 1000) * 0.0005;
                const outputCost = (usage.completion_tokens / 1000) * 0.0015;
                const totalCost = (inputCost + outputCost).toFixed(6); // 6 decimal places for small amounts

                console.log(`Estimated Cost: $${totalCost}`);

                // ✅ Safety Check: Prevent costly requests
                if (usage.total_tokens > 1500) {
                    throw new Error("Token limit exceeded. Please shorten your resume.");
                }

                await prisma.user.update({
                    where: { id: userId },
                    data: { resume: enhancedResume }
                });

                return res.status(200).json({ resume: enhancedResume, cost: totalCost });
            } else {
                console.warn("Token usage data is unavailable.");
            }

            return res.status(200).json({ resume: enhancedResume });
        }

        res.status(405).json({ message: "Method not allowed." });

    } catch (error: unknown) {
        console.error("OpenAI API Error:", error);

        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        } else {
            return res.status(500).json({ error: "An unexpected error occurred." });
        }
    }
}
