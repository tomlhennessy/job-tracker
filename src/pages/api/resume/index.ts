import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";
import OpenAI from "openai";
import redis from "@/lib/redis"; // Import Redis
import { allowCors } from "@/lib/cors";
import { getTokenFromRequest } from "@/lib/auth"; // Import helper for extracting JWT

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Extract JWT token from request (either cookie or Authorization header)
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify JWT and extract user ID
        const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as { id: string; email: string };
        const userId = decoded.id;

        // Ensure user is authenticated
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const cacheKey = `resume:${userId}`;

        if (req.method === "GET") {
            try {
                // Check Redis Cache First
                const cachedResume = await redis.get(cacheKey);
                if (cachedResume) {
                    console.log("Returning cached resume");
                    return res.status(200).json(JSON.parse(cachedResume));
                }

                // If no cache, fetch from PostgreSQL
                console.log("Fetching resume from database");
                const resume = await prisma.resume.findFirst({
                    where: { userId, isLatest: true },
                    orderBy: { version: "desc" },
                });

                if (!resume) {
                    return res.status(404).json({ error: "No resume found" });
                }

                // Cache result for 1 hour (3600 seconds)
                await redis.setex(cacheKey, 3600, JSON.stringify(resume));

                return res.status(200).json(resume);
            } catch (error) {
                console.error("Error fetching resume:", error);
                return res.status(500).json({ error: "Failed to retrieve resume" });
            }
        }

        if (req.method === "POST" && req.body.type === "ai_generate") {
            try {
                const { rawCV } = req.body;

                if (!rawCV) {
                    return res.status(400).json({ error: "Missing CV content" });
                }

                // Mark previous versions as not latest
                await prisma.resume.updateMany({
                    where: { userId },
                    data: { isLatest: false },
                });

                console.log("🤖 Generating Resume with OpenAI...");
                const prompt = `
                You are an ATS-optimized resume writer. Your task is to take the provided raw CV content and format it into a structured JSON format that fits within a resume template.

                ### Output Format (Must be JSON)
                {
                    "name": "Full Name",
                    "contact": {
                        "email": "Email",
                        "phone": "Phone Number",
                        "location": "City, Country",
                        "linkedin": "LinkedIn URL (optional)",
                        "github": "GitHub URL (optional)",
                        "portfolio": "Portfolio URL (optional)"
                    },
                    "summary": "A strong 2-3 sentence professional summary highlighting key skills and experience.",
                    "experience": [
                        {
                            "company": "Company Name",
                            "role": "Job Title",
                            "dates": "Start Date - End Date",
                            "location": "City, Country",
                            "achievements": [
                                "Key achievement 1",
                                "Key achievement 2",
                                "Key achievement 3"
                            ]
                        }
                    ],
                    "education": [
                        {
                            "degree": "Degree Name",
                            "institution": "University Name",
                            "dates": "Start Date - End Date"
                        }
                    ],
                    "skills": ["Skill 1", "Skill 2", "Skill 3"]
                }

                ### Raw CV:
                ${rawCV}
                `;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 800,
                });

                let structuredData;
                try {
                    structuredData = JSON.parse(completion.choices[0].message.content || "{}");
                } catch (error) {
                    console.error("Error parsing AI response:", error);
                    return res.status(500).json({ error: "Invalid AI-generated response" });
                }

                // Find latest version number
                const latestResume = await prisma.resume.findFirst({
                    where: { userId },
                    orderBy: { version: "desc" },
                });

                const newVersion = latestResume ? latestResume.version + 1 : 1;

                // Save AI-generated resume
                const aiResume = await prisma.resume.create({
                    data: {
                        userId,
                        version: newVersion,
                        content: JSON.stringify(structuredData),
                        isAiGenerated: true,
                        isLatest: true,
                    },
                });

                // ✅ Update Redis Cache
                await redis.setex(cacheKey, 3600, JSON.stringify(aiResume));

                return res.status(200).json({ resume: aiResume });
            } catch (error) {
                console.error("Error generating AI resume:", error);
                return res.status(500).json({ error: "Failed to generate resume" });
            }
        }

        return res.status(405).json({ message: "Method not allowed." });
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
}

export default allowCors(handler);
