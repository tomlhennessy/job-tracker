import type { NextApiRequest, NextApiResponse } from "next";
import redis from "@/utils/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await redis.set("testKey", "Hello from Redis!")
        const value = await redis.get("testKey")
        res.status(200).json({ message: value })
    } catch (error) {
        console.log("error:", error)
        res.status(500).json({ error: "Redis connection failed" })
    }
}
