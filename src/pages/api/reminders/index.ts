import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import sgMail from '@sendgrid/mail'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorised"})
    }

    try {
        const upcomingJobs = await prisma.job.findMany({
            where: {
                userId: session.user.id,
                followUpDate: {
                    gte: new Date(),
                    lte: new Date(new Date().setDate(new Date().getDate() + 1))
                }
            }
        })

        for (const job of upcomingJobs) {
            const msg = {
                to: session.user.email!,
                from: "noreply@Appli.sh",
                subject: `⏰ Follow-Up Reminder for ${job.company}`,
                text: `Don't forget to follow up on your application for the ${job.position} role at ${job.company}`
            }

            await sgMail.send(msg)
        }

        res.status(200).json({ message: "Reminders sent!"})
    } catch (error) {
        console.error("Error sending reminders:", error)
        res.status(500).json({ message: "Failed to send reminders"})
    }
}
