const logger = require("./winston");
const { badRequest } = require("../constants/statusCode");

const validator = (req, res, next) => {

  try {
    for (let [key, value] of Object.entries(req.body)) {
      if (value === "") {
        value = null;
        req.body[key] = value;
        continue;
      }
    }

    next();
  } catch (error) {
    logger.error(error);
    res.status(badRequest).json({ error: "Bad request" });
  }
};

module.exports = validator;