const express = require('express');
const router = express.Router();
const messagesService = require('../services/message.service')
const { getExcludeUsers, checkBlocked } = require('../middleware/user.middleware');

router.delete('/delete-message', messagesService.deleteMessage);
router.get('/active-chats',getExcludeUsers,  messagesService.getActiveChats);
router.delete('/delete-room', messagesService.deleteRoom);
router.get('/:room', messagesService.getAllMessages);

module.exports = router;
