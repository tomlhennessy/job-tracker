import { PrismaClient } from "@prisma/client/extension";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";


const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const { email, password, name } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" })
    }

    const existingUser = await prisma.user.findUnique({ where: { email }})
    if (existingUser) {
        return res.status(400).json({ message: "Email already registered"})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            name,
            hashedPassword
        }
    })

    return res.status(201).json(user)
}
