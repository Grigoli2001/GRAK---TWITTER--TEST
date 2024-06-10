const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message_id: {
        type: String,
        required: [true, "message_id is required"],
        unique: true,
    },
    sender_id: {
        type: String,
        required: [true, "sender_id is required"],
    },
    // used to get active chats
    receiver_id: {
        type: String,
        required: [true, "receiver_id is required"],
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

    is_deleted_for_everyone: {
        type: Boolean,
        default: false,
    },
    // is_room_deleted_for: {
    //     type: Array,
    //     default: [],
    // },
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;

