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

    // POST /api/jobs (Add a job)
    if (req.method === "POST") {
        try {
            const { company, position, status } = req.body;

            const job = await prisma.job.create({
                data: {
                    userId: session.user.id,
                    company,
                    position,
                    status: status || "applied",
                },
            });

            return res.status(201).json(job);
        } catch (error) {
            console.error("Error adding job:", error);
            return res.status(500).json({ error: "Failed to add job" });
        }
    }

    // GET /api/jobs (Fetch user jobs)
    if (req.method === "GET") {
        try {
            const jobs = await prisma.job.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
            });

            return res.status(200).json(jobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            return res.status(500).json({ error: "Failed to fetch jobs" });
        }
    }

    // DELETE /api/jobs/:id (Delete a job)
    if (req.method === "DELETE") {
        try {
            const { id } = req.query;

            const job = await prisma.job.delete({
                where: {
                    id: String(id),
                    userId: session.user.id,
                },
            });

            return res.status(200).json({ message: "Job deleted", job });
        } catch (error) {
            console.error("Error deleting job:", error);
            return res.status(500).json({ error: "Failed to delete job" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
