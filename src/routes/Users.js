const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const SALT = require("../salt/salt");
const BCRYPT_SALT = 12;
const User = require("../models/Users");
const Chats = require("../models/Chats");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const https = require("https");

router.get("/get_user", async (request, response) => {
    try {
        const {user} = request.query;
        const user_info = await User.findOne({user: {$regex: new RegExp(user, "i")}}).populate(["followers.user", "following_users.user", "notifications.user"]).exec();
        if (user_info != null) {
            response.status(200).json(user_info);
        }else {
            response.status(400).send();
        }
    }catch(error) {
        response.status(400).json("User doenst exist" + error);
    }
});

router.post("/verify_session", async (request, response) => {
    if (request.session.user) {
        const user = await User.findById(request.session.user._id).populate(["followers.user", "following_users.user"]).exec();
        response.json(user);
    }else {
        response.json(false);
    }
});

router.post("/search_user", async(request, response) => {
    try {
        const {email, user} = request.body;
        if (email && !user) {
            const result = await User.find({email: {$regex: new RegExp(email, "i")}});
            response.json(result);
        }else {
            const result = await User.find({user: {$regex: new RegExp(user, "i")}});
            response.json(result);
        }
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post ("/register", async (request, response) => {
    try {
        const {email, name, user} = request.body;
        let {user_password} = request.body;
        if (email && name && user && user_password) {
            const same_email_username = await User.find({$or: [{email: {$regex: new RegExp(email, "i")}}, {user: {$regex: new RegExp(user, "i")}}]});
            if (same_email_username.length >= 1) {
                response.status(409).json("Data exists."); // 409 conflict in the request
            }else {
                const password = await bcrypt.hash(user_password, BCRYPT_SALT);
                const new_user = new User({email, name, user, password});
                const result = await new_user.save();
                response.status(200).json(result);
            }
        }else {
            response.status(400).json("Insert data");
        }
    }catch(error) {
        response.status(404).send(error);
    }
});

router.post("/update_profile", async (request, response) => {
    try {
        const {basic_update} = request.body;
        if (basic_update) {
            const {id, name, user, status} = request.body;
            const result = await User.findByIdAndUpdate(
                {_id: id}, {$set: {name: name, user: user,status: (status != "") ? status : "No status"}
            }, {new: true});
            const {password, ...updated_user} = result._doc;
            request.session.user = {
                user: updated_user, 
            }
            response.status(200);
        }
    }catch(error) {
        response.status(400).send(error);
    }
});

router.post("/follow_user", async (request, response) => {
    if (!request.session.user) {
        response.json(false);
    }else {
        try {
            const {user_to_follow, user_follower} = request.body;
            const result = await User.bulkWrite([
                {
                    updateOne: {
                        filter: {
                            _id: user_to_follow
                        },
                        update: {
                            $push: {
                                followers: {user: user_follower}
                            }
                        }
                    }
                },
                {
                    updateOne: {
                        filter: {
                            _id: user_follower
                        },
                        update: {
                            $push: {
                                following_users: {user: user_to_follow},
                            }
                        }
                    }
                }
            ]);
            if (result.ok === 1) {
                const result = await User.find({_id: {$in: [user_follower, user_to_follow]}}).populate(["followers.user", "following_users.user"]).exec();
                const user = result.find(user => user._id == user_follower);
                const follower = result.find(user => user._id == user_to_follow);
                response.status(200).send({user: user, follower: follower});
            }else {
                response.status(400).send();
            }
        }catch(error) {
            response.status(400).send(error);
        }
    }
});

router.post("/unfollow_user", async (request, response) => {
    if (!request.session.user) {
        response.json(false);
    }else {
        try {
            const {user_to_unfollow, user_follower} = request.body;
            const result = await User.bulkWrite([
                {
                    updateOne: {
                        filter: {
                            _id: user_to_unfollow
                        },
                        update: {
                            $pull: {
                                followers: {user: user_follower}
                            }
                        }
                    }
                },
                {
                    updateOne: {
                        filter: {
                            _id: user_follower
                        },
                        update: {
                            $pull: {
                                following_users: {user: user_to_unfollow},
                            }
                        }
                    }
                }
            ]);
            if (result.ok === 1) {
                const result = await User.find({_id: {$in: [user_follower, user_to_unfollow]}}).populate(["followers.user", "following_users.user"]).exec();
                const user = result.find(user => user._id == user_follower);
                const followers = result.find(user => user._id == user_to_unfollow);
                response.status(200).send({user: user, followers: followers.followers});
            }else {
                response.status(400).send();
            }
        }catch(error) {
            response.status(400).send(error);
        }
    }
});

router.post('/upload_profile_pic', (request, response) => {
    try {
        const storage = multer.diskStorage({
            destination: path.join(__dirname, "../public/images"),
            filename: function (request, file, cb) { //name of the file when save 
                cb(null,file.originalname);
            }
        });

        const upload = multer({
            storage: storage,
        }).single("new_profile_pic");

        upload(request, response, async (error) => {
            try {
                if (error) {
                    response.status(400).json(error);
                }else {
                    if (request.body.actual_profile_pic != null) {
                        await User.updateOne({_id: request.body.user_id}, {$set: {profile_pic: request.file.originalname}});
                        const path_ = path.join(__dirname, `../public/images/${request.body.actual_profile_pic}`);
                        fs.unlinkSync(path_);
                        response.status(200).json({profile_pic: request.file.originalname});
                    }else {
                        await User.updateOne({_id: request.body.user_id}, {$set: {profile_pic: request.file.originalname}});
                        response.status(200).json({profile_pic: request.file.originalname});
                    }
                }
            }catch(error) {
                response.status(400).json(error);
            }
        });
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post("/send_notifications", async(request, response) => {
    try {
        const data = request.body.message;
        const id = request.body.user_id;
        const notification = request.body.notification;
        const user_number_notifications = request.body.number_notifications;
        const {user, number_notifications, notifications} = await User.findOneAndUpdate({_id: id}, {$push: {notifications: notification}, $set: {number_notifications: user_number_notifications + 1}}, {new: true}).populate(["notifications.user"]).exec();
        response.status(200).json({user: user, number_notifications: number_notifications,});
    
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic M2VmZjZlYzQtMTMwZS00ZDJiLWIzODgtOTY2OTkyMjM3M2Ni"
        };
        
        const options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };
        
        const req = https.request(options);
        req.on('error', function(e) {
            response.send(404).json(e);
        });
        req.write(JSON.stringify(data));
        req.end();
    }catch(error) {
        response.send(404).json(error);
    }
});

router.post("/get_notifications", async (request, response) => {
    try {
        if (request.session.user) {
            const {_id} = request.session.user;
            const result = await User.findOne({_id: _id});
            if (result.notifications.length >= 1) {
                const {number_notifications, notifications} = await User.findOne({_id: _id}).populate("notifications.user").exec();
                response.send({number_notifications, notifications});
            }else {
                response.send([]);
            }
        }else {
            return;
        }
    }catch(error) {
        response.send(400).json(error);
    }
});

router.post("/get_messages", async(request, response) => {
    try {
        if (request.session.user) {
            const {_id} = request.session.user;
            const result = await Chats.findOne({"user": _id});
            if (result) {
                if (!result.notification_message) {
                    response.send(result);
                }else {
                    response.send([]);
                }
            }else {
                response.send([]);
            }
        }else {
            return;
        }
    }catch(error) {
        response.json(error);
    }
});

router.post("/update_notifications", async (request, response) => {
    try {
        const user_id = request.body.user_id;
        const notification_id = request.body.id;
        if (user_id && notification_id) {
            const result = await User.updateOne({_id: user_id, "notifications._id": notification_id}, {$set: {"notifications.$.seen": true}});
            response.send(200);
        }else {
            const {number_notifications} = await User.findByIdAndUpdate({_id: user_id}, {$set: {number_notifications: 0}}, {new: true});
            response.send(200).json(number_notifications);
        }
    }catch(error) {
        response.json(error);
    }
});

router.post("/update_messages", async (request, response) => {
    try {
        const {user_id, chat_id} = request.body;
        if (user_id && chat_id) {
            const result = await Chats.findOneAndUpdate({"user": user_id, "chats.user_to_talk": chat_id}, {$set: {"chats.$.seen": 0}});
            response.sendStatus(200);
        }else {
            const result = await Chats.findOneAndUpdate({"user": user_id}, {$set: {notification_message: true}});
            response.sendStatus(200);
        }
    }catch(error) {
        response.json(error);
    }
})
router.post("/save_chat", async (request, response) => {
    try {
        const {type, user, user_to_talk, chat, receiver, message} = request.body;
        let result;
        switch(type) {
            case "send":
                const connected_users = request.app.settings.ids;
                const is_receiver_connected = connected_users.filter((user) => user.user.toUpperCase() === receiver.toUpperCase());
                if (is_receiver_connected.length >= 1) {
                    result = await Chats.findOneAndUpdate({"user": user , "chats.user_to_talk": user_to_talk}, {$set: {"chats.$.chat": chat}}, {new: true}).populate(["user", "chats.user_to_talk"]).exec();
                    if (result === null) {
                        result = await Chats.findOneAndUpdate({"user": user}, {$push: {"chats": {user_to_talk: user_to_talk, chat: chat}}}, {new: true}).populate(["user", "chats.user_to_talk"]).exec();
                        response.json(result);
                    }else {
                        response.json(result);
                    }
                }else {
                    const receiver_message = {type: "recive", message: message}
                    const {chats} = await Chats.findOne({"user": user_to_talk});
                    const new_chat = chats.map((chat) => {
                        if (chat.user_to_talk == user) {
                            const parsed_chat = JSON.parse(chat.chat);
                            parsed_chat.push(receiver_message);
                            chat.chat = JSON.stringify(parsed_chat);
                            return chat.chat;
                        }else {
                            return;
                        }
                    }).filter(obj => obj != null);
                    result = await Chats.bulkWrite([
                        {
                            updateOne: {
                                filter: {
                                    user: user,
                                    "chats.user_to_talk": user_to_talk
                                },
                                update: {
                                    $set: {
                                        "chats.$.chat": chat,
                                    }
                                }
                            }
                        },
                        {
                            updateOne: {
                                filter: {
                                    user: user_to_talk,
                                    "chats.user_to_talk": user
                                },
                                update: {
                                    $inc: {
                                        "chats.$.seen": 1
                                    },
                                    $set: {
                                        "chats.$.chat": new_chat,
                                        notification_message: false, 
                                    }
                                }
                            }
                        }
                    ])
                }
                if (result.ok === 1) {
                    result = await Chats.findOne({"user": user}).populate(["user", "chats.user_to_talk"]).exec();
                    response.json(result);
                }else {
                    response.sendStatus(400);
                }
                break;
            case "another":
                result = await Chats.findOneAndUpdate({"user": user , "chats.user_to_talk": user_to_talk}, {$set: {"chats.$.chat": chat}, $inc: {"chats.$.seen": 1}}, {new: true}).populate(["user", "chats.user_to_talk"]).exec();
                response.json(result);
                break;
            case "new":
                result = await Chats.findOneAndUpdate({"user": user}, {$push: {"chats": {user_to_talk: user_to_talk, chat: chat, seen: 1}}}, {new: true}).populate(["user", "chats.user_to_talk"]).exec();
                response.json(result);
                break;
            case "same": 
                result = await Chats.findOneAndUpdate({"user": user , "chats.user_to_talk": user_to_talk}, {$set: {"chats.$.chat": chat}}, {new: true}).populate(["user", "chats.user_to_talk"]).exec();
                response.json(result);
                break;
        }
    }catch(error) {
        response.sendStatus(400).json(error);
    }
});

router.post("/get_chats", async (request, response) => {
    try {
        const {user} = request.body;
        const chats = await Chats.find({"user": user}).populate(["user", "chats.user_to_talk"]).exec();
        if (chats.length >= 1) {
            response.json(chats[0]._doc);
        }else {
            response.json([]);
        }
    }catch(error) {
        response.sendStatus(400).json(error);
    }
});

router.post("/see_chat", async (request, response) => {
    try {
        const {user, chat_id} = request.body;
        const result = await Chats.findOneAndUpdate({"user": user , "chats.user_to_talk": chat_id}, {$set: {"chats.$.seen": 0}}, {new: true}).populate(["user", "chats.user_to_talk"]).exec();
        response.json(result);
    }catch(error) {
        response.sendStatus(400).json(error);
    }
});

module.exports = router;