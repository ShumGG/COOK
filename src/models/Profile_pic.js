const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Profile_pic = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
    profile_pic: Buffer, 
    mimetype: String
});

module.exports = mongoose.model("Profile_pic", Profile_pic);