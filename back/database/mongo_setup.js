const mongoose = require("mongoose");
const logger = require("../middleware/winston");


const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  logger.error("Mongo URI is not provided");
  process.exit(1);
}

const connectToMongo = async () => {
    mongoose
      .connect(MONGO_URI)
      .then(() => logger.info("MongoDB connected successfully"))
      .catch((err) => logger.error("MongoDB connection error: ", err));
  };

module.exports = {
    connectToMongo
}