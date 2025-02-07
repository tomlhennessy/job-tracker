import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  tls: {
    rejectUnauthorized: false, // ✅ Disable TLS verification
  },
});

export default redis;
