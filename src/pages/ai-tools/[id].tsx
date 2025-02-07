import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import redis from "@/lib/redis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type, cv, jobDescription } = req.body;

    if (!type || (type === "enhance_cv" && !cv) || (type === "cover_letter" && (!cv || !jobDescription))) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let prompt = "";
    let cacheKey = "";

    // Enhance CV (This is now handled separately in `/api/resume`)
    if (type === "enhance_cv") {
      prompt = `You are a professional resume writer. Format the CV below into a clean, modern layout with the following structure:
      - **Name** (Bold, large font)
      - **Contact Information** (Email, phone, LinkedIn)
      - **Professional Summary** (Short paragraph)
      - **Work Experience** (Company, Role, Dates, Achievements in bullet points)
      - **Education** (Degree, Institution, Dates)
      - **Skills** (Bullet points)
      Return the content in Markdown format for easy styling.
      CV: ${cv}`;
    }

    // Generate Cover Letter
    if (type === "cover_letter") {
      cacheKey = `coverLetter:${cv}:${jobDescription}`;

      // Check Redis cache first
      const cachedCoverLetter = await redis.get(cacheKey);
      if (cachedCoverLetter) {
        console.log("Returning cached Cover Letter");
        return res.status(200).json({ result: JSON.parse(cachedCoverLetter) });
      }

      console.log("Generating Cover Letter with OpenAI...");
      prompt = `You are an expert cover letter writer focused on creating ATS-friendly cover letters.
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
        model: "gpt-4o", // Using GPT-4o for better performance and cost-efficiency
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800, // Limiting tokens to control cost
      });

      const result = completion.choices[0].message.content;

      // Cache the cover letter in Redis for 24 hours
      await redis.setex(cacheKey, 86400, JSON.stringify(result));

      return res.status(200).json({ result });
    }

    return res.status(405).json({ message: "Method not allowed." });

  } catch (error: unknown) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "An unexpected error occurred." });
  }
}
