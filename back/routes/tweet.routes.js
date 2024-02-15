const express = require('express');
const router = express.Router();
const multer = require('multer')
const tweetService = require('../services/tweet.service')

const storage = multer.memoryStorage();
const upload = multer({ storage : storage });

router.get('/', tweetService.getAllTweets);
router.get('/:id', tweetService.getTweetById);
router.post('/create', upload.single('tweetMedia'), tweetService.createTweet);
// router.put('/:id', tweetService.updateTweet);
router.post('/like', tweetService.likeTweet);
router.post('/retweet', tweetService.retweetTweet);
router.post('/bookmark', tweetService.bookmarkTweet);
// yet to implement replyTweet
router.post('/reply', tweetService.replyTweet);
router.delete('/:id', tweetService.deleteTweet);

module.exports = router;
