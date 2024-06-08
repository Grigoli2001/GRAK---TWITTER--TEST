const redis = require("redis");
const RedisStore = require("connect-redis").default;
const logger = require("../middleware/winston");

const REDIS_URI = process.env.REDIS_URI;
if (!REDIS_URI) {
  logger.error("Redis URI is not provided");
  process.exit(1);
}
const redisClient = redis.createClient({
    url: REDIS_URI
});

const connectToRedis = async () => {
   

  redisClient.on("error", (err) => {
    logger.error("Redis error: ", err);
    throw new Error("Redis connection error");
  });

  redisClient.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  await redisClient.connect();
  
}


module.exports = {
    RedisStore,
    connectToRedis,
    redisClient,
}