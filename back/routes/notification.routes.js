const express = require("express");
const router = express.Router();
const notificationService = require("../services/notification.service");

router.post("/create", notificationService.createNotification);
router.get("/:userId", notificationService.getNotifications);
router.put("/update/:notificationId", notificationService.updateNotification);
router.delete(
  "/delete/:notificationId",
  notificationService.deleteNotification
);
module.exports = router;
