const express = require('express');
const router = express.Router();
const tweetService = require('../services/tweet.service')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { getExcludeUsers } = require('../middleware/user.middleware');

router.get('/', tweetService.getAllTweets);
router.get('/category/:category', getExcludeUsers, tweetService.getTweetsByCategory); 
router.post('/create',upload.fields([
    { name: 'tweetMedia', maxCount: 1 },
 ]) , tweetService.createTweet);
router.get('/replies/:id', getExcludeUsers, tweetService.getReplies);
router.get('/trending', tweetService.getTrendingTags);
router.get('/tags', tweetService.getTags)
router.get('/explore/tags',  getExcludeUsers, tweetService.getTweetsByTag);
// router.put('/:id', tweetService.updateTweet);
router.post('/like', getExcludeUsers, tweetService.likeTweet);
router.post('/highlight', getExcludeUsers, tweetService.highlightTweet);
// router.post('/retweet', tweetService.retweetTweet);
router.post('/bookmark', getExcludeUsers, tweetService.bookmarkTweet);
// yet to implement replyTweet
// router.post('/reply', tweetService.replyTweet);
router.get('/:id', getExcludeUsers, tweetService.getTweetById);
router.delete('/:id', getExcludeUsers, tweetService.deleteTweet);
router.patch('/edit', tweetService.updateTweet);

module.exports = router;
