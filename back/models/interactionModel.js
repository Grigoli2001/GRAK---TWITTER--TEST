const mongoose = require('mongoose');

const interactionModel = new mongoose.Schema({
    interactionType: {
      type: String,
      required: [true, "interaction_type is required"],
      enum: ['like', 'bookmark', 'vote']
    },
    tweet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
      required: [true, "tweet_id is required"],
    },
    userId: {
      type: String,
      required: [true, "user_id is required"],
    },
    pollOption: {
      type: Number,
      validate: {
        validator: function(value) {
          if (this.interactionType === 'vote') {
            return typeof value === 'number';
          }
          return true;
        },
        message: 'pollOption is required when interactionType is vote'
      }
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
