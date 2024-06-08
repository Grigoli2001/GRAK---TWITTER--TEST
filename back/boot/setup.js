require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const logger = require("../middleware/winston");
const notFound = require("../middleware/notFound");

// database
const { connectToMongo }= require("../database/mongo_setup");
const { connectToRedis, redisClient, RedisStore } = require("../database/redis_setup");
const { connectToNeo4j }= require("../database/neo4j_setup");

// sockets
const initSockets = require("../sockets/sockets");

// middleware
const verifyToken = require("../middleware/verifyToken");

// routes
const tweetRoutes = require("../routes/tweet.routes");
const authRoutes = require("../routes/auth.routes");
const messageRoutes = require("../routes/messages.routes");
const profileRoutes = require("../routes/profile.routes");
const userRoutes = require("../routes/user.routes");
const tokenRoutes = require("../routes/token.routes");
const notificationRoutes = require("../routes/notification.routes");

// app setup
const app = express();
const PORT = process.env.PORT;

const registerCoreMiddleWare = async () => {
  const redisStore = new RedisStore({ client: redisClient });
  try {

    // middleware
    app.use(morgan("combined", { stream: logger.stream }));
    app.use(express.json());
    app.use(cors({}));
    app.use(helmet());
    app.use(
      session({
        secret: process.env.APP_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 , // 1 day
        },
        store: redisStore
      })
    );


    // routes
    app.use("/auth", authRoutes);
    app.use("/token", tokenRoutes);
    app.use(verifyToken);
    app.use("/users", userRoutes);
    app.use("/tweets", tweetRoutes);
    app.use("/messages", messageRoutes);
    app.use("/profile", profileRoutes);
    app.use("/notifications", notificationRoutes);
    
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
    await connectToMongo();
    await connectToRedis();
    await connectToNeo4j();
    initSockets(app);

    app.listen(PORT, () => {
      logger.info("Application Listening on 127.0.0.1:" + PORT);
    });

    handleError();
  } catch (err) {
    console.log(err);
    // logger.error(
    //   `startup :: Error while booting the applicaiton ${JSON.stringify(
    //     err,
    //     undefined,
    //     2
    //   )}`
    // );
    // throw err;
  }
};

module.exports = startApp;
