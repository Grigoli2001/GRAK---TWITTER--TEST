const mongoose = require('mongoose');

const interactionModel = new mongoose.Schema({
    interactionType: {
      type: String,
      required: [true, "interaction_type is required"],
      enum: ['like', 'bookmark']
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
      required: [true, "tweet_id is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user_id is required"],
    },
    is_deleted :{
      type: Boolean,
      default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

module.exports = mongoose.model('Interaction', interactionModel);
