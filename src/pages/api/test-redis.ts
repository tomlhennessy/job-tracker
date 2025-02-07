import { NextApiRequest, NextApiResponse } from "next";
import redis from "@/lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pong = await redis.ping();
    res.status(200).json({ success: true, message: pong });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "An unknown error occurred" });
    }
  }
}
