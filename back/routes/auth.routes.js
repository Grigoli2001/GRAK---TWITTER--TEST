const express = require("express");
const router = express.Router();
const authServices = require("../services/auth.service");
const  rateLimit  = require("../middleware/rateLimit");

router.post("/login", rateLimit(60, 10), authServices.login);
router.post("/check", rateLimit(60, 20), authServices.checkExistingUser);
router.post("/signup", rateLimit(60, 10), authServices.signup);
router.get("/logout", authServices.logout);
router.post("/sendotp",rateLimit(60, 10), authServices.sendOTP);
router.post("/change-password", rateLimit(60, 10), authServices.changePassword);
router.post("/user-preferences", authServices.userPreferences);
module.exports = router;
