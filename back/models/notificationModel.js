const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: {
      type: Number,
      required: [true, "user_id is required"],
    },
    tweetId: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      //   not required because it's not necessary for all notification types
      required: false,
    },
    triggeredByUserId: {
      type: Number,
      required: [true, "triggered_by_user_id is required"],
    },
    notificationType: {
      type: String,
      required: [true, "notification_type is required"],
      enum: [
        "like",
        "retweet",
        "reply",
        "quote",
        "follow",
        "mention",
        "comment",
        "message",
      ],
    },
    seen: {
      type: Boolean,
      default: false,
    },

    fromTwitter: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
