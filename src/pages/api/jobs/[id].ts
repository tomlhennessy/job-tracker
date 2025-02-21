import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { allowCors } from "@/lib/cors";

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;

    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid job ID" });
    }

    try {
        if (req.method === "GET") {
            const job = await prisma.job.findUnique({
                where: { id, userId: session.user.id },
            });

            if (!job) {
                return res.status(404).json({ error: "Job not found" });
            }

            return res.status(200).json(job);
        }

        if (req.method === "PUT") {
            const { jobDescription, coverLetter, followUpDate } = req.body;

            const updatedJob = await prisma.job.update({
                where: { id, userId: session.user.id },
                data: {
                    jobDescription: jobDescription || undefined,
                    coverLetter: coverLetter || undefined,
                    followUpDate: followUpDate ? new Date(followUpDate) : undefined,
                },
            });

            return res.status(200).json(updatedJob);
        }

        if (req.method === "DELETE") {
            await prisma.job.delete({ where: { id, userId: session.user.id } });
            return res.status(200).json({ message: "Job deleted" });
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
        console.error("Error handling job:", error);
        return res.status(500).json({ error: "Server error" });
    }
}

export default allowCors(handler)
