import { createClient } from "redis";

const redis = createClient({
    url: process.env.REDIS_URL || `rediss://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    socket: {
        tls: true,
    },
});

redis.on("error", (err: Error) => {
    console.error("❌ Redis Client Error:", err);
});

export default redis;
