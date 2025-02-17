import Redis from "ioredis";

// Connect to Redis inside the same Elastic Beanstalk environment
const redis = new Redis({
  host: process.env.REDIS_HOST || "redis", // "redis" refers to the container name
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on("error", (err: Error) => {
  console.error("❌ Redis Client Error:", err);
});

export default redis;
