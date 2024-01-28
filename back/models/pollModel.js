const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    poll_id: {
        type: Number,
        required: [true, "poll_id is required"],
    },
    tweet_id: {
        type: Number,
        required: [true, "tweet_id is required"],
    },
    poll_options: {
        option1: {
            type: String,
            required: [true, "option1 is required"],
        },
        option2: {
            type: String,
            required: [true, "option2 is required"],
        },
    },
    poll_votes: {
        votesForOption1: {
            type: Number,
            min: 0,
            required: false,
        },
        votesForOption2: {
            type: Number,
            min: 0,
            required: false,
        },
    },
    poll_end: {
        type: Date,
        required: false,
    },
});