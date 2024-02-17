const express = require("express");
const router = express.Router();
const profileService = require("../services/profile.service");
const multer = require("multer");
const { upload } = require("../multer/multer");

router.post("/changeFollowStatus", profileService.changeFollowStatus);
router.post("/changeUsername", profileService.changeUsername);
module.exports = router;
