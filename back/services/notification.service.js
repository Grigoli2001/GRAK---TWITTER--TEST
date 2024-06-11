const notificationModel = require("../models/notificationModel");
const statusCode = require("../constants/statusCode");
const logger = require("../middleware/winston");
const mongoose = require("mongoose");
const { getUserById } = require("../utils/notification.utils");

const { ObjectId } = mongoose.Types;
// sockets

const createNotification = async (req, res) => {
  const { userId, tweetId, triggeredByUserId, notificationType, fromTwitter } =
    req.body;
  if (!userId || !triggeredByUserId || !notificationType) {
    console.error("missing required fields");
    return res
      .status(statusCode.badRequest)
      .json({ message: "Missing required fields" });
  }
  if (userId === triggeredByUserId) {
    console.error("userId and triggeredByUserId cannot be the same");
    return res;
  }
  try {
    const newNotification = new notificationModel({
      userId,
      tweetId,
      triggeredByUserId,
      notificationType,
      fromTwitter,
    });
    const savedNotification = await newNotification.save();
    logger.info("Notification created");
    return res
      .status(statusCode.success)
      .json({ notification: savedNotification });
  } catch (err) {
    logger.error("Error creating notification: ", err);
    return res
      .status(statusCode.serverError)
      .json({ message: "Error creating notification" });
  }
};

const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await notificationModel
      .find({ userId: userId })
      .populate("tweetId")
      .sort({ createdAt: -1 })
      .lean();

    for (let i = 0; i < notifications.length; i++) {
      const user = await getUserById(notifications[i].triggeredByUserId);

      notifications[i].triggeredByUser = user;
    }
    return res.status(statusCode.success).json({ notifications });
  } catch (err) {
    logger.error("the error is " + err);
    return res
      .status(statusCode.serverError)
      .json({ message: "Error fetching notifications" });
  }
};

const updateNotification = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await notificationModel.findByIdAndUpdate(
      notificationId,
      { seen: true }
    );
    return res.status(statusCode.success).json({ notification });
  } catch (err) {
    logger.error("error updating notifications", err);
    return res
      .status(statusCode.serverError)
      .json({ message: "Error updating notification" });
  }
};

const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await notificationModel.findByIdAndDelete(
      notificationId
    );
    return res.status(statusCode.success).json({ notification });
  } catch (err) {
    logger.error("error while deleting notifications", err);
    return res
      .status(statusCode.serverError)
      .json({ message: "Error deleting notification" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
};
