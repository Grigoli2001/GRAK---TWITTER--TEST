const express = require("express");
const router = express.Router();
const firebaseService = require("../services/firebase.service");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post("/upload-image", upload.fields([{
    name: "image",
    maxCount: 1,
}]), firebaseService.uploadImage);

module.exports = router;
