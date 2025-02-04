import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import OpenAI from "openai"

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorised"})
    }

    const userId = session.user.id

    if (req.method === "GET") {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { resume: true } })
        return res.status(200).json(user?.resume)
    }

    if (req.method === "PUT") {
        const { resume } = req.body

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { resume },
        })

        return res.status(200).json(updatedUser)
    }

    if (req.method === "POST") {
        const { resume: cv } = req.body

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `You are an expert CV writer. Improve the following CV to make it more professional, concise, and impactful. Focus on achievements, action verbs, and clarity.\n\nCV:\n${cv}`
                }
            ]
        })

        const enhancedResume = completion.choices[0].message.content

        await prisma.user.update({
            where: { id: userId },
            data: { resume: enhancedResume}
        })

        return res.status(200).json({ resume: enhancedResume })
    }

    res.status(405).json({ message: "Method not allowed."})
}
