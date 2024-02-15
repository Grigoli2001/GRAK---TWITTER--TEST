const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender_id: {
        type: Number,
        required: [true, "sender_id is required"],
    },
    // room to allow for private messaging and group messaging
    room_id: {
        type: String,
        required: [true, "receiver_id is required"],
    },
    message: {
        type: String,
        required: [true, "message is required"],
    },
    date: {
        type: Date,
        required: [true, "date is required"],
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    is_deleted_for: {
        type: Array,
        default: [],
    },
    is_room_deleted_for: {
        type: Array,
        default: [],
    },
});

module.exports = mongoose.model('Message', MessageSchema);
