const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
    tweet_id: {
        type: Number,
        autoIncrement: true,
        required: [true, "tweet_id is required"],
    },
    tweet_type: {
        type: String,
        required: [true, "tweet_type is required"],
    },
    user_id: {
        type: Number,
        required: [true, "user_id is required"],
    },
    tweet_text: {
        type: String,
        required: [true, "tweet_text is required"],
    },
    tweet_schedule: {
        type: Date,
        default: Date.now,
    },
    tweet_likes: [{
        user_id: Number,
    }],
    tweet_media: {
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
    // tweet_retweets: {
    //     type: [],
    //     required: false,
    // },
});

module.exports = mongoose.model('Tweet', TweetSchema);