const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
    tweetType: {
        type: String,
        required: [true, "tweet_type is required"],
    },
    tweetText: {
        type: String,
    },
    userId: {
        type: Number,
        required: [true, "user_id is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tweet_likes: [{
        userId: Number,
    }],
    tweetMedia: {
        data: Buffer, // Buffer is a built in object in nodejs to store binary data for the image
        contentType: String,
    },
    tweet_comments: [{
        user_id: Number,
        comment_text: String,
        comment_date: {
            type: Date,
            default: Date.now,
        },
    }],
    tweet_retweets: [{
        userId: Number,
    }],
    tweet_bookmarks: [{
        userId: Number,
    }],
});

module.exports = mongoose.model('Tweet', TweetSchema);