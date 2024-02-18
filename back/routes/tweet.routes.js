const express = require('express');
const router = express.Router();
const tweetService = require('../services/tweet.service')

router.get('/', tweetService.getAllTweets);
router.get('/:id', tweetService.getTweetById);
router.get('/category/:category', tweetService.getTweetsByCategory);
router.post('/create', tweetService.createTweet);
router.get('/replies/:id', tweetService.getReplies);
// router.put('/:id', tweetService.updateTweet);
router.post('/like', tweetService.likeTweet);
// router.post('/retweet', tweetService.retweetTweet);
router.post('/bookmark', tweetService.bookmarkTweet);
// yet to implement replyTweet
// router.post('/reply', tweetService.replyTweet);
router.delete('/:id', tweetService.deleteTweet);

module.exports = router;
