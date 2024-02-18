const express = require('express');
const router = express.Router();
const userServices = require('../services/user.service');
const { route } = require('./tweet.routes');

router.get('/all', userServices.getAllUsers);
router.post('/', userServices.getUser);
router.post('/update', userServices.updateUser);
router.post("/follow", userServices.addFollower);
router.post("/unfollow", userServices.removeFollower);
router.get("/followers", userServices.getFollowers);
router.get("/following", userServices.getFollowing);

module.exports = router;
