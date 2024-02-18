const express = require('express');
const router = express.Router();
const multer = require('multer')
const tweetService = require('../services/tweet.service')

const storage = multer.memoryStorage();
// check file size should not be more than 1GB
const upload = multer({ 
                    storage : storage , 
                    limits: { fileSize: 1 * 1024 * 1024 * 1024 },
                });

router.get('/', tweetService.getAllTweets);
router.get('/:id', tweetService.getTweetById);
router.get('/category/:category', tweetService.getTweetsByCategory);
router.post('/create', upload.single('tweetMedia'), tweetService.createTweet);
router.get('/replies/:id', tweetService.getReplies);
// router.put('/:id', tweetService.updateTweet);
router.post('/like', tweetService.likeTweet);
// router.post('/retweet', tweetService.retweetTweet);
router.post('/bookmark', tweetService.bookmarkTweet);
// yet to implement replyTweet
// router.post('/reply', tweetService.replyTweet);
router.delete('/:id', tweetService.deleteTweet);

module.exports = router;
