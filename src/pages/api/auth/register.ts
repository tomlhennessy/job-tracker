import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// ✅ Ensure Next.js body parser is enabled
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
    console.log("📌 DEBUG - Received Request Body:", req.body);

    // ✅ Ensure request body exists and is a valid object
    if (!req.body || typeof req.body !== "object") {
      console.log("❌ ERROR: Request body is missing or not an object");
      return res.status(400).json({ message: "Invalid request body format" });
    }

    const { email, password, name } = req.body;

    // ✅ Validate required fields
    if (!email || !password || !name) {
      console.log("❌ ERROR: Missing required fields");
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    console.log("✅ Email:", email);
    console.log("✅ Password:", password);
    console.log("✅ Name:", name);

    // ✅ Check if user already exists
    console.log("🔍 Checking if user exists...");
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      console.log("❌ ERROR: Email already registered", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Validate password before hashing
    if (typeof password !== "string" || password.trim().length === 0) {
      console.log("❌ ERROR: Invalid password format");
      return res.status(400).json({ message: "Invalid password format" });
    }

    console.log("🔒 Hashing password with bcrypt...");
    let hashedPassword;
    try {
      const saltRounds = 10; // Standard bcrypt salt rounds
      hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("✅ Hashed password:", hashedPassword);
    } catch (error) {
      console.log("❌ ERROR: Password hashing failed", error);
      return res.status(500).json({ message: "Internal error: Password hashing failed", error });
    }

    if (!hashedPassword) {
      console.log("❌ ERROR: Hashed password is NULL!");
      return res.status(500).json({ message: "Internal error: hashed password is null" });
    }

    console.log("📌 Saving user with Prisma...");
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    console.log("✅ User created:", user);
    return res.status(201).json({ message: "User registered successfully", user });

  } catch (error) {
    console.log("❌ ERROR: Unexpected error occurred");

    // 🔥 Improved TypeScript error handling:
    if (error instanceof Error) {
      console.log("Stack Trace:", error.stack);
      return res.status(500).json({ message: error.message });
    } else {
      console.log("Unknown Error:", error);
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}
