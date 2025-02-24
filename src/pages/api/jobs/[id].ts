import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { allowCors } from "@/lib/cors";

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // ✅ Use NextAuth session instead of manual JWT verification
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user || !session.user.id) {
            console.log("❌ No valid session found");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = session.user.id; // ✅ Get authenticated user ID
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
            console.error("❌ Error handling job:", error);
            return res.status(500).json({ error: "Server error" });
        }
    } catch (error) {
        console.error("❌ Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default allowCors(handler);
