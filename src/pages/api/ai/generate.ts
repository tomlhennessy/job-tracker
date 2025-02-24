import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { allowCors } from "@/lib/cors";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ Use NextAuth session instead of manual JWT verification
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.id) {
      console.log("❌ No valid session found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id; // ✅ Get authenticated user ID
    const { jobId, cv, jobDescription } = req.body;

    if (!jobId || !cv || !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure the job belongs to the authenticated user
    const job = await prisma.job.findUnique({
      where: { id: jobId, userId }, // Ensure job is linked to the requesting user
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found or unauthorized" });
    }

    const prompt = `
      You are an expert cover letter writer focused on creating ATS-friendly cover letters.

      Your task is to:
      - Write a professional cover letter based on the provided resume and job description.
      - Naturally integrate relevant keywords from the job description.
      - Keep the language concise, formal, and results-driven.
      - Emphasize the candidate's key achievements, skills, and why they’re a strong fit.

      **Job Description:**
      ${jobDescription}

      **Resume:**
      ${cv}

      Return an ATS-optimized cover letter in a professional tone.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });

    const result = completion.choices[0].message.content;

    // Save the cover letter to Prisma
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { coverLetter: result },
    });

    return res.status(200).json({ result, updatedJob });

  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    return res.status(500).json({ error: "Failed to generate cover letter" });
  }
}

export default allowCors(handler);
