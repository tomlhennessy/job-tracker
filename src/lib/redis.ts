import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  tls: process.env.REDIS_HOST === "localhost" ? undefined : { rejectUnauthorized: false }, // Disable TLS verification for SSH tunnel
});

export default redis;
