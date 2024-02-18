const mongoose = require('mongoose');
const { Schema } = mongoose;

const TweetSchema = new Schema({
    tweetType: {
        type: String,
        required: [true, "tweet_type is required"],
        enum: ['tweet','retweet', 'reply', 'quote']
    },
    tweetText: {
        type: String,
    },
    userId: {
        type: Number,
        required: [true, "user_id is required"],
    },
    poll: {
        type: Schema.Types.ObjectId,
        ref: 'Poll',
    },
    tweetMedia: {
        data: Buffer,
        contentType: String,
    },
    reference_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Tweet' 
    },

    // So that user data can be populated when fetching tweets
    user: {
        type: Object,
    },
    }, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: {
            default: null
        }
    }
    
});

module.exports = mongoose.model('Tweet', TweetSchema);