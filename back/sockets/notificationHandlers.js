const logger = require("../middleware/winston");
const notificationService = require("../services/notification.service");
const statusCodes = require("../constants/statusCode");
const tweetModel = require("../models/tweetModel");

module.exports = (io, socket) => {
  socket.on("notification:new", async (data) => {
    // find author of the tweet by tweet id
    try {

      if (data.tweetId) {
        const tweet = await tweetModel.findOne({ _id: data.tweetId });
        const author = tweet?._doc?.userId;
        data.userId = author;
      }
      logger.info("notification:new", data);
      // Simulate minimal req and res objects
      const req = { body: data };
      const res = {
        status: (statusCode) => ({
          json: (response) => {
            logger.info("Notification created");
            io.to(author).emit("notification:created", response.notification);
            console.log("author  ", author, "  emitted");
          },
        }),
      };

      // Create notification
      const notification = await notificationService.createNotification(
        req,
        res
      );

      socket.to(author).emit("notification:created", notification);
    } catch (err) {
      logger.error("Error in handler" + err);
    }
  });
};
