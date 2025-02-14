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

    try {
        if (req.method === "GET") {
            try {
                const { userId } = req.query; // Accept userId as a query param

                if (!userId || typeof userId !== "string") {
                    return res.status(400).json({ error: "Missing or invalid userId" });
                }

                const resumes = await prisma.resume.findMany({
                    where: { userId },
                    orderBy: { version: "desc" }, // Return versions in descending order
                });

                return res.status(200).json(resumes);
            } catch (error) {
                console.error("Error fetching resumes:", error);
                return res.status(500).json({ error: "Failed to retrieve resumes" });
            }
        }


        if (req.method === "POST" && req.body.type === "ai_generate") {
            try {
                const { userId, rawCV } = req.body;

                if (!userId || !rawCV) {
                    return res.status(400).json({ error: "Missing required fields" });
                }

                // Mark previous versions as not latest
                await prisma.resume.updateMany({
                    where: { userId },
                    data: { isLatest: false },
                });

                console.log("🤖 Generating Resume with OpenAI...");
                const prompt = `
                You are an ATS-optimized resume writer. Your task is to take the provided raw CV content and format it into a structured JSON format that fits within a resume template. Make sure to structure it clearly.

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
                                "Key achievement 1 (quantifiable impact, e.g., increased revenue by 20%)",
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

                ### Guidelines:
                - Use clear, structured JSON format.
                - **DO NOT** return freeform text. Only return **valid JSON**.
                - If some data is missing, intelligently infer based on the provided CV.

                ### Raw CV:
                ${rawCV}
                `;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 800,
                });

                // Ensure AI output is valid JSON
                let structuredData;
                try {
                    structuredData = JSON.parse(completion.choices[0].message.content || "{}");
                } catch (error) {
                    console.error("Error parsing AI response:", error);
                    return res.status(500).json({ error: "Invalid AI-generated response" });
                }

                // Find the latest version number
                const latestResume = await prisma.resume.findFirst({
                    where: { userId },
                    orderBy: { version: "desc" },
                });

                const newVersion = latestResume ? latestResume.version + 1 : 1;

                // Save AI-generated resume as the latest version
                const aiResume = await prisma.resume.create({
                    data: {
                        userId,
                        version: newVersion,
                        content: JSON.stringify(structuredData),
                        isAiGenerated: true,
                        isLatest: true,
                    },
                });

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
