const express = require('express');
const router = express.Router();
const tweetService = require('../services/tweet.service')

router.get('/', tweetService.getAllTweets);
router.get('/:id', tweetService.getTweetById);
router.post('/', tweetService.createTweet);
router.put('/:id', tweetService.updateTweet);
router.delete('/:id', tweetService.deleteTweet);

module.exports = router;
