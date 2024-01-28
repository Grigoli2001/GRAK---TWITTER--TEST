const express = require("express");
const router = express.Router();

const authServices = require("../services/auth.service");

router.post("/login", authServices.login);
router.post("/check", authServices.checkExistingUser);
router.post("/signup", authServices.signup);
router.get("/logout", authServices.logout);

module.exports = router;