import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();


export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔹 Received API request:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    const token = jwt.sign(
      {id: user.id, email: user.email},
      process.env.NEXTAUTH_SECRET!,
      {expiresIn: "7d"}
    )
    console.log("User registered and token generated")

    return res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    })

  } catch (error) {
    // TypeScript error handling:
    if (error instanceof Error) {
      console.log("Stack Trace:", error.stack);
      return res.status(500).json({ message: error.message });
    } else {
      console.log("Unknown Error:", error);
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}
