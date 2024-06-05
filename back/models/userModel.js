const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
    },
    bookMarks: [{
        tweetId: String,
    }],
    retweets: [{
        tweetId: String,
    }],
});

module.exports = mongoose.model('User', UserSchema);
