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
      prompt = `You are an expert resume writer specializing in optimizing resumes for Applicant Tracking Systems (ATS).

      Your goal is to:
      - Optimize the following resume to be ATS-friendly.
      - Improve formatting, remove unnecessary graphics or complex layouts.
      - Incorporate keywords from the job description naturally.
      - Use strong action verbs, quantify achievements, and ensure clarity.

      **Job Description:**
      ${jobDescription}

      **Resume:**
      ${cv}

      Return the improved, ATS-optimized resume.`;
    }

    // 📝 Generate Cover Letter
    if (type === "cover_letter") {
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
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // ✅ Using GPT-4o for better performance and cost-efficiency
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800, // ✅ Limiting tokens to control cost
    });

    const result = completion.choices[0].message.content;

    // ✅ Guard Clause for Usage Tracking
    const usage = completion.usage;
    if (usage) {
      console.log("Tokens Used:", usage);

      // 🚨 Cost Estimation (adjust based on OpenAI pricing)
      const inputCost = (usage.prompt_tokens / 1000) * 0.0005;
      const outputCost = (usage.completion_tokens / 1000) * 0.0015;
      const totalCost = (inputCost + outputCost).toFixed(6); // 6 decimal places for small amounts

      console.log(`Estimated Cost: $${totalCost}`);

      // ✅ Safety Check: Prevent costly requests
      if (usage.total_tokens > 1500) {
        throw new Error("Token limit exceeded. Please shorten your input.");
      }

      return res.status(200).json({ result, cost: totalCost });
    } else {
      console.warn("Token usage data is unavailable.");
    }

    return res.status(200).json({ result });

  } catch (error: unknown) {
    console.error("OpenAI API Error:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
}
