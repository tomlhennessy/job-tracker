import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            },
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: { id: user.id, email: user.email, name: user.name },
        });

    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Registration Error:", error.message);
        return res.status(500).json({ message: error.message });
      }

      return res.status(500).json({ message: "Internal Server Error" });
    }
}
