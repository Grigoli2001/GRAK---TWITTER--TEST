const mongoose = require("mongoose");
const logger = require("../middleware/winston");


const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  logger.error("Mongo URI is not provided");
  process.exit(1);
}

console.log("MONGO_URI", MONGO_URI);

const connectToMongo = async () => {
    mongoose
      .connect(MONGO_URI)
      .then(() => logger.info("MongoDB connected successfully"))
      .catch((err) => {throw new Error(err)});
  };

module.exports = {
    connectToMongo
}