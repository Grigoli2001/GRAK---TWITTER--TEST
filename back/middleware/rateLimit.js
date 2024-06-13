const{ redisClient } = require("../database/redis_setup");
const logger = require("./winston");
const statusCodes = require("../constants/statusCode");

module.exports = (expireSeconds, maxRequests) => {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate-limit:${req.path}:${ip}`;
    try {
        const count = await redisClient.incr(key);
        if (count === 1) {
          redisClient.expire(key, expireSeconds);
        }
        if (count > maxRequests) {
          return res.status(statusCodes.tooManyRequests).json({message: "Too many requests. Try again later."});
        }
        next();

    }catch(err){
        logger.error("Rate limit error: ", err);
        return res.status(statusCodes.serverError).send("Internal server error");
    }
  }
}