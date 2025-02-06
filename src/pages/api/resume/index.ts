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
                select: { resume: true },
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
            const { resume: rawCV } = req.body;

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

            await prisma.user.update({
                where: { id: userId },
                data: { resume: structuredData },
            });

            return res.status(200).json({ resume: structuredData });
        }

        res.status(405).json({ message: "Method not allowed." });
    } catch (error: unknown) {
        console.error("API Error:", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
}
