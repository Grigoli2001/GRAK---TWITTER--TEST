const express = require('express');
const router = express.Router();
const userServices = require('../services/user.service')

router.get('/users', userServices.getAllUsers);
router.get('/user/:username', userServices.getUserById);
router.get('/followers', userServices.getAllFollowers);
router.get('/following', userServices.getAllFollowing);

module.exports = router;
