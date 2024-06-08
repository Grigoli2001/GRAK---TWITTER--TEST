const express = require("express");
const router = express.Router();
const firebaseService = require("../services/firebase.service");

router.post("/upload-image", firebaseService.uploadImage);

module.exports = router;
