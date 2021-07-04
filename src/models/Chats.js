const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Chats = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
    }, 
    chats: [{
        user_to_talk: {
            type: Schema.Types.ObjectId,
            ref: "Users",
        },
        chat: Object,
        seen: {
            type: Number,
            default: 0,
        },
    }],
    notification_message: {
        type: Boolean,
        default: false, 
    }
});

module.exports = mongoose.model("Chats", Chats);