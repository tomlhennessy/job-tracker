import { NextApiRequest, NextApiResponse } from "next";
import Redis from "ioredis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            tls: process.env.REDIS_HOST?.includes("amazonaws") ? {} : undefined, // Use TLS only if connecting to AWS
        });

        await redis.set("test", "Hello, Redis!");
        const result = await redis.get("test");

        res.status(200).json({ success: true, message: result });
    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ success: false, error: error.message});
    }
}
