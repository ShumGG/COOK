const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
    email: String, 
    name: String, 
    user: String, 
    password: String, 
    profile_pic: {
        type: String, 
        default: null,
    },
    status: {
        type: String, 
        default: "No status",
    },
    location: {
        type: String, 
        default: "No Location"
    },
    social_media: [{
        Twitter: {
            type: String
        },
        Instagram: {
            type: String 
        }
    }],
    followers: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users", 
        }
    }],
    following_users: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users", 
        }
    }],
    notifications: [{
        user : {
            type: Schema.Types.ObjectId,
            ref: "Users", 
        },
        notification: {
            type: String,
        },
        date: {
            type: String,
        }, 
        seen: {
            type: Boolean,
            default: false,
        },
        type: {
            type: Object,
        }
    }],
    number_notifications: {
        type: Number,
        default: 0,
    }
})

module.exports = mongoose.model("Users", User); //first name of the collection, second the new object to be inserted