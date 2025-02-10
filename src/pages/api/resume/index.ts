import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import OpenAI from "openai";
import redis from "@/lib/redis";
import { Resume } from "@/types/resume";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id as string;
    const cacheKey = `resumes:${userId}`;

    try {
        if (req.method === "GET") {
            // Check Redis cache first
            const cachedResumes = await redis.get(cacheKey);
            if (cachedResumes) {
                return res.status(200).json(JSON.parse(cachedResumes));
            }

            // Fetch from PostgreSQL
            const resumes = await prisma.resume.findMany({
                where: { userId },
                orderBy: { version: "desc" },
            });

            // Convert Date to string to prevent TypeScript errors
            const formattedResumes = resumes.map((resume) => ({
                ...resume,
                createdAt: resume.createdAt.toISOString(),
            }));

            // Cache for 10 minutes
            await redis.setex(cacheKey, 600, JSON.stringify(formattedResumes));

            return res.status(200).json(formattedResumes as Resume[]);
        }

        if (req.method === "POST" && req.body.type === "ai_generate") {
            const { rawCV } = req.body;

            // Check if cached AI resume exists
            const cachedResume = await redis.get(cacheKey);
            if (cachedResume) {
                return res.status(200).json({ resume: JSON.parse(cachedResume) });
            }

            console.log("🤖 Generating Resume with OpenAI...");
            const prompt = `You are a professional resume writer and ATS optimization expert.
            Your task is to transform the following raw CV text into a **structured, ATS-friendly** JSON resume.

            ### **Guidelines**
            - **Summarize work experience** into **concise, impact-driven bullet points**.
            - Extract **keywords from job descriptions** to enhance ATS ranking.
            - If a section is **missing**, intelligently infer information from experience.
            - Maintain **professional tone** with clear formatting.

            ### **Resume JSON Structure**
            {
            "name": "Full Name",
            "contact": {
                "email": "Email",
                "phone": "Phone Number",
                "location": "Location",
                "linkedin": "LinkedIn URL"
            },
            "summary": "A strong, 2-3 sentence professional summary.",
            "experience": [
                {
                "company": "Company Name",
                "role": "Job Title",
                "dates": "Start - End",
                "location": "Location",
                "achievements": [
                    "Achievement 1 (quantifiable impact, e.g., increased revenue by 20%)",
                    "Achievement 2",
                    "Achievement 3"
                ]
                }
            ],
            "education": [
                {
                "degree": "Degree Name",
                "institution": "University Name",
                "dates": "Start - End"
                }
            ],
            "skills": ["Skill 1", "Skill 2", "Skill 3"]
            }

            ### **Raw CV Input**
            ${rawCV}

            ⚡ **Ensure the output follows the JSON structure above!**`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800,
            });

            const structuredData = JSON.parse(completion.choices[0].message.content || "{}");

            // Save AI-generated resume in database as a new version
            const latestResume = await prisma.resume.findFirst({
                where: { userId },
                orderBy: { version: "desc" },
            });

            const newVersion = latestResume ? latestResume.version + 1 : 1;

            const aiResume = await prisma.resume.create({
                data: {
                    userId,
                    version: newVersion,
                    content: JSON.stringify(structuredData),
                    isAiGenerated: true
                },
            });

            // Convert createdAt to string before caching
            const formattedAiResume = {
                ...aiResume,
                createdAt: aiResume.createdAt.toISOString(),
            };

            // Cache AI-generated resume for 24 hours
            await redis.setex(cacheKey, 86400, JSON.stringify(formattedAiResume));

            return res.status(200).json({ resume: formattedAiResume });
        }

        return res.status(405).json({ message: "Method not allowed." });
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
}
