const express = require("express");
const router = express.Router();
const profileService = require("../services/profile.service");
const multer = require("multer");
const { upload } = require("../multer/multer");

router.post("/changeFollowStatus", profileService.changeFollowStatus);
router.post("/changeUsername", profileService.changeUsername);
router.post("/changePassword", profileService.changePassword);
router.post("/changeEmail", profileService.changeEmail);
router.post("/changeBio", profileService.changeBio);

module.exports = router;
