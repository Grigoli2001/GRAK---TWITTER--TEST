const mongoose = require('mongoose');
const { Schema } = mongoose;

const TweetSchema = new Schema({
    tweetType: {
        type: String,
        required: [true, "tweet_type is required"],
        enum: ['tweet','retweet', 'reply', 'quote', 'deleted']
    },
    tweetText: {
        type: String,
    },
    userId: {
        type: String,
        required: [true, "user_id is required"],
    },
    poll: {
        type: Schema.Types.ObjectId,
        ref: 'Poll',
    },
    tweetMedia: {
        src: {
            type: String,
            required: function() {
                return this.mimeType;
            }
        },
        mimeType: {
            type: String,
            validate: {
                validator: function(val) {
                    return val?.startsWith('image') || val?.startsWith('video');
                }
            }
        },
        thumbnail: {
            type: String,
        },
    },
    reference_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Tweet' 
    },

    is_deleted :{
        type: Boolean,
        default: false
    },

    is_highlighted: {
        type: Boolean,
        default: false
    },

    is_edited: {
        type: Boolean,
        default: false
    },

    tags: {
        type: [{
            type: String,
            maxlength: 25,
            minlength: 1
        }],
        validate: {
            validator: function(value) {
                return value.length <= 5;
            },
            message: 'tags must have at most 5 tags'
        }
    },
    }, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
    
});



module.exports = mongoose.model('Tweet', TweetSchema);