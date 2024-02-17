const mongoose = require('mongoose');
const { Types } = mongoose;

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
        data: Buffer,
        contentType: String,
    },
    referencing_by: {
        reference_type: String,
        reference_id: Types.ObjectId
    },

    // So that user data can be populated when fetching tweets
    user: {
        type: Object,
    }
});

module.exports = mongoose.model('Tweet', TweetSchema);