const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    tweet_id: {
        type: String,
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
        option3: {
            type: String,
            required: false,
        },
        option4: {
            type: String,
            required: false,
        },
    },
    poll_votes: {
        votesForOption1: {
            type: Number,
            min: 0,
            required: true,
        },
        votesForOption2: {
            type: Number,
            min: 0,
            required: true,
        },
        votesForOption3: {
            type: Number,
            min: 0,
            required: false,
        },
        votesForOption4: {
            type: Number,
            min: 0,
            required: false,
        },
    },
    poll_end: {
        type: Date,
        required: true,
    },
});