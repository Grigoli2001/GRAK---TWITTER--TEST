const express = require('express');
const router = express.Router();
const tweetService = require('../services/tweet.service')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', tweetService.getAllTweets);
router.get('/category/:category', tweetService.getTweetsByCategory);
router.post('/create',upload.fields([
    { name: 'tweetMedia', maxCount: 1 },
 ]) , tweetService.createTweet);
router.get('/replies/:id', tweetService.getReplies);
router.get('/trending', tweetService.getTrendingTags);
router.get('/tags', tweetService.getTags)
router.get('/explore/tags', tweetService.getTweetsByTag);
// router.put('/:id', tweetService.updateTweet);
router.post('/like', tweetService.likeTweet);
router.post('/highlight', tweetService.highlightTweet);
// router.post('/retweet', tweetService.retweetTweet);
router.post('/bookmark', tweetService.bookmarkTweet);
// yet to implement replyTweet
// router.post('/reply', tweetService.replyTweet);
router.get('/:id', tweetService.getTweetById);
router.delete('/:id', tweetService.deleteTweet);
router.patch('/edit', tweetService.updateTweet);

module.exports = router;
