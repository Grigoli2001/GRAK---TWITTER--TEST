const mongoose = require('mongoose');
const { Schema } = mongoose;

const PollSchema = new Schema({
    tweet_id: {
        type: Schema.ObjectId,
        ref: 'Tweet',
        required: [true, "tweet_id is required"],
    },

    options: {
        type: [{
            _id: false,
            id: {
                type: Number,
                required: [true, "id is required"]
            },
            text: {
                type: String,
                required: [true, "text is required"],
                validate: {
                    validator: function(value) {
                        return value.length > 0 && value.length <= 25;
                    },
                    message: 'text must have at least 1 character and at most 25 characters'
                }
            }, 
            votes: {
                type: Number,
                default: 0
            }
    }],
    required: [true, "options is required"],
    validate: {
        validator: function(value) {
            return value.length > 1 && value.length <= 4;
        },
        message: 'options must have at least 2 options and at most 4 options'
    }   

},

    poll_end: {
        type: Date,
        required: true,
    },
},

    // {
    //     toJSON: { virtuals: true },
    //     toObject: { virtuals: true }
    // }

);

// PollSchema.virtual('totalVotes', {
//     ref: 'Interaction',
//     localField: 'tweet_id',
//     foreignField: 'tweet_id',
//     match: { interactionType: 'vote' },
//     count: true
// });

// PollSchema.virtual('userVote', {
//     ref: 'Interaction',
//     localField: 'tweet_id',
//     foreignField: 'tweet_id',
//     count: true
// });

module.exports = mongoose.model('Poll', PollSchema);