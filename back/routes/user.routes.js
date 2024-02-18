const express = require('express');
const router = express.Router();
const userServices = require('../services/user.service')

router.get('/', userServices.getAllUsers);
router.post('/', userServices.getUser);
router.get('/followers', userServices.getAllFollowers);
router.get('/following', userServices.getAllFollowing);

module.exports = router;
