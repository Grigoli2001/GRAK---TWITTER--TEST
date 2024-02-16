const express = require('express');
const router = express.Router();
const messagesService = require('../services/message.service')

router.get('/:room', messagesService.getAllMessages);
router.delete('/delete-message', messagesService.deleteMessage);
router.delete('/delete-room', messagesService.deleteRoom);

module.exports = router;
