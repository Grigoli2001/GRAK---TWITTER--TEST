require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const logger = require("../middleware/winston");
const notFound = require("../middleware/notFound");
const initSockets = require("../sockets/sockets");
const veridyToken = require("../middleware/verifyToken");

// routes
const tweetRoutes = require("../routes/tweet.routes");
const authRoutes = require("../routes/auth.routes");
const messageRoutes = require("../routes/messages.routes");
const profileRoutes = require("../routes/profile.routes");

const app = express();
const PORT = process.env.PORT;
const followRoutes = require("../routes/follow.routes");

// connect to the database
const connectToDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => logger.info("MongoDB connected successfully"))
    .catch((err) => console.log(err));
};

const registerCoreMiddleWare = async () => {
  try {
    app.use(
      session({
        secret: process.env.APP_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
        },
      })
    );

    app.use(morgan("combined", { stream: logger.stream }));
    app.use(express.json());
    app.use(cors({}));
    app.use(helmet());

    app.use("/tweets", tweetRoutes);
    app.use("/auth", authRoutes);
    app.use(veridyToken);
    app.use("/messages", messageRoutes);
    app.use("/profile", profileRoutes);    
    app.use("/user", followRoutes);
    app.use(notFound);
  } catch (err) {
    logger.error("Error thrown while executing registerCoreMiddleWare", err);
    process.exit(1);
  }
};

// handling uncaught exceptions
const handleError = () => {
  process.on("uncaughtException", (err) => {
    logger.error(`UNCAUGHT_EXCEPTION OCCURED : ${JSON.stringify(err.stack)}`);
  });
};

// start applicatoin
const startApp = async () => {
  try {
    await registerCoreMiddleWare();
    await connectToDB();
    initSockets(app);

    app.listen(PORT, () => {
      logger.info("Listening on 127.0.0.1:" + PORT);
    });

    handleError();
  } catch (err) {
    logger.error(
      `startup :: Error while booting the applicaiton ${JSON.stringify(
        err,
        undefined,
        2
      )}`
    );
    throw err;
  }
};

module.exports = startApp;
