const express = require('express');
const router = express.Router();
const userServices = require('../services/user.service');

router.get('/explore-users', userServices.getExploreUsers);
router.get('', userServices.getUsers);
router.get('/username/:username', userServices.getUserByUsername);
router.get('/user', userServices.getUserSimple);
router.get('/follow-data', userServices.getFollowData);

router.patch('/update', userServices.updateUser);
router.post("/follow", userServices.addFollower);
router.post("/unfollow", userServices.removeFollower);

module.exports = router;
