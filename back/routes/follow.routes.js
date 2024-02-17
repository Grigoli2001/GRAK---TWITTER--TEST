const express = require("express");
const router = express.Router();

const followServices = require("../services/follow.service");

router.post("/follow", followServices.addFollower);
router.post("/unfollow", followServices.removeFollower);
router.get("/followers", followServices.getFollowers);
router.get("/following", followServices.getFollowing);

module.exports = router;