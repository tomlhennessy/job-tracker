import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { allowCors } from "@/lib/cors";
import { getTokenFromRequest } from "@/lib/auth"; // Import helper for extracting JWT

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Extract JWT token from request (either cookie or Authorization header)
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify JWT and extract user ID
        const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as { id: string; email: string };
        const userId = decoded.id;

        // Ensure user is authenticated
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { id } = req.query;

        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid job ID" });
        }

        try {
            if (req.method === "GET") {
                const job = await prisma.job.findUnique({
                    where: { id, userId },
                });

                if (!job) {
                    return res.status(404).json({ error: "Job not found" });
                }

                return res.status(200).json(job);
            }

            if (req.method === "PUT") {
                const { jobDescription, coverLetter, followUpDate } = req.body;

                const updatedJob = await prisma.job.update({
                    where: { id, userId },
                    data: {
                        jobDescription: jobDescription || undefined,
                        coverLetter: coverLetter || undefined,
                        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
                    },
                });

                return res.status(200).json(updatedJob);
            }

            if (req.method === "DELETE") {
                await prisma.job.delete({ where: { id, userId } });
                return res.status(200).json({ message: "Job deleted" });
            }

            return res.status(405).json({ error: "Method Not Allowed" });
        } catch (error) {
            console.error("Error handling job:", error);
            return res.status(500).json({ error: "Server error" });
        }
    } catch (error) {
        console.error("❌ Authentication Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default allowCors(handler);
