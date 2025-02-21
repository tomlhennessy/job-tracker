import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { allowCors } from "@/lib/cors";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { jobId, cv, jobDescription } = req.body;

    if (!jobId || !cv || !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
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
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ error: "Failed to generate cover letter" });
  }
}

export default allowCors(handler);
