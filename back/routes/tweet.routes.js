const express = require('express');
const router = express.Router();
const multer = require('multer')
const tweetService = require('../services/tweet.service')

const upload = multer();

router.get('/', tweetService.getAllTweets);
router.get('/:id', tweetService.getTweetById);
router.post('/', upload.single('tweet_media'), tweetService.createTweet);
router.put('/:id', tweetService.updateTweet);
router.delete('/:id', tweetService.deleteTweet);

module.exports = router;
