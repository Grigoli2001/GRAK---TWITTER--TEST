const express = require('express');
const router = express.Router();
const tokenServices = require('../services/token.service');

router.post('/refresh', tokenServices.refreshToken);

module.exports = router;
