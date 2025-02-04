import { PrismaClient } from "@prisma/client/extension";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "../auth/[...nextauth]";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorised" })
    }

    const { type, cv, jobDescription } = req.body

    if (!type || (type === "enhance_cv" && !cv) || (type === "cover_letter" && !jobDescription)) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    let prompt = ""

    // enhance cv
    if (type === "enhance_cv") {
      prompt = `You are an expert CV writer. Improve the following CV to make it more professional, concise, and impactful. Focus on achievements, action verbs, and clarity.\n\nCV:\n${cv}`
    }

    // generate cover letter (auto fetch cv)
    if (type === "cover_letter") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { resume: true }
      })

      if (!user?.resume) {
        return res.status(400).json({error: "No saved resume found. Please add your resume in the dashboard."})
      }

      prompt = `You are a professional cover letter writer. Based on the following CV and job description, write a standout, personalized cover letter. Highlight key skills, achievements, and explain why this candidate is a great fit.\n\nCV:\n${user.resume}\n\nJob Description:\n${jobDescription}`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{role: "user", content: prompt }]
    })

    res.status(200).json({ result: completion.choices[0].message.content })

  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ error: "Failed to generate content."})
  }
}
