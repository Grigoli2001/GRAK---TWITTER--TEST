const redis = require("redis");

// Redis connection details
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;

// Create Redis client
const redisClient = redis.createClient({
  port: REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
});

// Check if Redis connection is successful
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Check for Redis connection errors
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisClient;
