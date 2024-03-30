const express = require('express');
const router = express.Router();
const messagesService = require('../services/message.service')

router.delete('/delete-message', messagesService.deleteMessage);
router.get('/active-chats', messagesService.getActiveChats);
router.delete('/delete-room', messagesService.deleteRoom);
router.get('/:room', messagesService.getAllMessages);

module.exports = router;
