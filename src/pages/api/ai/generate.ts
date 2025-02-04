import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { type, cv, jobDescription } = req.body;

    if (!type || (type === "enhance_cv" && !cv) || (type === "cover_letter" && (!cv || !jobDescription))) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let prompt = "";

    // ✨ Enhance CV
    if (type === "enhance_cv") {
      prompt = `You are an expert CV writer. Improve the following CV to make it more professional, concise, and impactful. Focus on achievements, action verbs, and clarity.\n\nCV:\n${cv}`;
    }

    // 📝 Generate Cover Letter
    if (type === "cover_letter") {
      prompt = `You are a professional cover letter writer. Based on the following CV and job description, write a standout, personalized cover letter. Highlight key skills, achievements, and explain why this candidate is a great fit.\n\nCV:\n${cv}\n\nJob Description:\n${jobDescription}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
}
