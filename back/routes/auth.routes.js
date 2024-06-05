const express = require("express");
const router = express.Router();
const multer = require("multer");

const authServices = require("../services/auth.service");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../front/public/uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now() + ".jpg");
//   },
// });
// const upload = multer({ storage: storage }).single("profile_pic");

router.post("/login", authServices.login);
router.post("/check", authServices.checkExistingUser);
router.post("/signup", authServices.signup);
router.get("/logout", authServices.logout);
router.post("/sendOTP", authServices.sendOTP);
router.post("/change_password", authServices.changePassword);
router.post("/user_preferences", authServices.userPreferences);

module.exports = router;