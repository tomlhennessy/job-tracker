import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    // Add a Job
    if (req.method === "POST") {
        try {
            const { company, position, status, jobDescription, coverLetter } = req.body;

            if (!company || !position) {
                return res.status(400).json({ error: "Company and position are required" });
            }

            const job = await prisma.job.create({
                data: {
                    userId: session.user.id,
                    company,
                    position,
                    status: status || "applied",
                    jobDescription,
                    coverLetter,
                },
            });

            return res.status(201).json(job);
        } catch (error) {
            console.log("Error: ", error)
            return res.status(500).json({ error: "Failed to add job" });
        }
    }

    // Get All Jobs
    if (req.method === "GET") {
        try {
            const jobs = await prisma.job.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    company: true,
                    position: true,
                    status: true,
                    createdAt: true,
                    jobDescription: true,  // ✅ Include in response
                    coverLetter: true,     // ✅ Include in response
                  },
            });

            return res.status(200).json(jobs);
        } catch (error) {
            console.log("Error: ", error)
            return res.status(500).json({ error: "Failed to fetch jobs" });
        }
    }

    // Delete a Job
    if (req.method === "DELETE") {
        try {
            const { id } = req.query;

            if (typeof id !== "string" || !id) {
                return res.status(400).json({ error: "Invalid or missing job ID" });
            }

            const job = await prisma.job.delete({
                where: {
                    id: id,
                    userId: session.user.id,
                },
            });

            return res.status(200).json({ message: "Job deleted", job });
        } catch (error) {
            console.log("Error: ", error)
            return res.status(500).json({ error: "Failed to delete job" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
