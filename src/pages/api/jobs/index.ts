import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import redis from "@/lib/redis";
import { allowCors } from "@/lib/cors";

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // ✅ Use NextAuth's session handler instead of manually verifying JWTs
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user || !session.user.id) {
            console.log("❌ No valid session found");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = session.user.id; // ✅ Get user ID from NextAuth session
        const cacheKey = `jobs:${userId}`;

        if (req.method === "GET") {
            try {
                // Check Redis Cache
                const cachedJobs = await redis.get(cacheKey);
                if (cachedJobs) {
                    console.log("✅ Returning cached jobs from Redis");
                    return res.status(200).json(JSON.parse(cachedJobs));
                }

                console.log("📡 Fetching jobs from database");
                const jobs = await prisma.job.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                });

                // Store jobs in Redis cache for 10 minutes (600 seconds)
                await redis.setex(cacheKey, 600, JSON.stringify(jobs));

                return res.status(200).json(jobs);
            } catch (error) {
                console.error("❌ Error fetching jobs:", error);
                return res.status(500).json({ error: "Failed to fetch jobs" });
            }
        }

        if (req.method === "POST") {
            try {
                const { company, position, status, jobDescription, coverLetter } = req.body;

                if (!company || !position) {
                    return res.status(400).json({ error: "Company and position are required" });
                }

                const job = await prisma.job.create({
                    data: {
                        userId,
                        company,
                        position,
                        status: status || "applied",
                        jobDescription: jobDescription || "",
                        coverLetter: coverLetter || "",
                    },
                });

                // Invalidate Redis cache
                await redis.del(cacheKey);

                return res.status(201).json(job);
            } catch (error) {
                console.log("❌ Error adding job:", error);
                return res.status(500).json({ error: "Failed to add job" });
            }
        }

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

                // Invalidate Redis cache
                await redis.del(cacheKey);

                return res.status(200).json(updatedJob);
            } catch (error) {
                console.error("❌ Error updating job:", error);
                return res.status(500).json({ error: "Failed to update job" });
            }
        }

        if (req.method === "DELETE") {
            try {
                const { id } = req.query;

                if (typeof id !== "string" || !id) {
                    return res.status(400).json({ error: "Invalid or missing job ID" });
                }

                const job = await prisma.job.delete({
                    where: { id, userId },
                });

                // Invalidate Redis cache
                await redis.del(cacheKey);

                return res.status(200).json({ message: "Job deleted", job });
            } catch (error) {
                console.log("❌ Error deleting job:", error);
                return res.status(500).json({ error: "Failed to delete job" });
            }
        }

        return res.status(405).json({ message: "Method not allowed" });

    } catch (error) {
        console.error("❌ Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default allowCors(handler);
