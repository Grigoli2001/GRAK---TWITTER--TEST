const express = require('express');
const router = express.Router();
const userServices = require('../services/user.service');
const { route } = require('./tweet.routes');

router.get('/all', userServices.getAllUsers);
router.post('/', userServices.getUser);
router.post('/update', userServices.updateUser);

module.exports = router;
