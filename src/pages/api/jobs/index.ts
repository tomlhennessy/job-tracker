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

    const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!existingUser) {
        return res.status(404).json({ error: "User not found. Please re-login." });
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
                    jobDescription: jobDescription || "",  
                    coverLetter: coverLetter || "",
                },
            });

            return res.status(201).json(job);
        } catch (error) {
            console.log("Error adding job:", error);
            return res.status(500).json({ error: "Failed to add job" });
        }
    }

    // Update a Job
    if (req.method === "PUT") {
        try {
            const { id, coverLetter, followUpDate } = req.body;

            const updatedJob = await prisma.job.update({
                where: { id },
                data: {
                    coverLetter,
                    followUpDate: followUpDate ? new Date(followUpDate) : undefined,
                },
            });

            return res.status(200).json(updatedJob);
        } catch (error) {
            console.error("Error updating job:", error);
            return res.status(500).json({ error: "Failed to update job" });
        }
    }

    // Get Jobs (All Jobs or a Specific Job by ID)
    if (req.method === "GET") {
        try {
            const { id } = req.query;

            if (id) {
                // ✅ Fetch a specific job by ID
                const job = await prisma.job.findUnique({
                    where: { id: id as string },
                    select: {
                        id: true,
                        company: true,
                        position: true,
                        status: true,
                        createdAt: true,
                        jobDescription: true,
                        coverLetter: true,
                        followUpDate: true,
                    },
                });

                if (!job) {
                    return res.status(404).json({ error: "Job not found" });
                }

                return res.status(200).json(job);
            } else {
                // ✅ Fetch all jobs
                const jobs = await prisma.job.findMany({
                    where: { userId: session.user.id },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        company: true,
                        position: true,
                        status: true,
                        createdAt: true,
                        jobDescription: true,
                        coverLetter: true,
                        followUpDate: true,
                    },
                });

                return res.status(200).json(jobs);
            }
        } catch (error) {
            console.log("Error: ", error);
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
            console.log("Error: ", error);
            return res.status(500).json({ error: "Failed to delete job" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
