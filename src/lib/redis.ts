import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  tls: {}, // Add this to use TLS (recommended for AWS ElastiCache)
});

export default redis;
