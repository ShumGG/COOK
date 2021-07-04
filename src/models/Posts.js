const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Posts = new Schema({
    title: String, 
    content: String, 
    author: {
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
    post_date: String,
    description: String,
    likes: {
        type: Number,
        default: 0,
    }, 
    comments:[{
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
        },
        comment: {
            type: String,
        }, 
        comment_date: {
            type: String,
        },
        users_liked: [{
            type: Schema.Types.ObjectId,
            ref: "Users"
        }],
    }],
    users_liked_post: {
        type: Array,
    }, 
    tags: {
        type: Array,
    },
    images: {
        type: Array,
    }
});

module.exports = mongoose.model("Posts", Posts);