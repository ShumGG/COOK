const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../models/Users");
const Profile_pic = require("../models/Profile_pic");
const router = express.Router();

router.post("/login_user", async (request, response) => {
    try {
        const {email, password} = request.body;
        const email_exist = await Users.findOne({email: email}).populate(["followers.user", "following_users.user"]).exec();
        if (email_exist != null) {
            const password_compare = await bcrypt.compare(password, email_exist.password);
            if (password_compare) {
                const {password, ...user} = email_exist._doc;
                response.status(200).json(user);
            }else {
            response.json("Incorrect password");
            }
        }else {
            response.json(404);
        }
    }catch(error){
        response.status(400).json(error);
    }
});


router.post("/logout", (request, response) => {
    if (request.session.user) {
        const connected_users = request.app.settings.ids;
        const log_out = connected_users.filter((user) => user.user != request.session.user.user);
        request.app.set("ids", log_out);
        request.session.destroy();
        response.sendStatus(200);
    }else {
        response.send(404);
    }
});

router.get("/verify_session", (request, response) => {
    if (request.session.user != undefined) {
        response.json(200);
    }else {
        response.json(404);
    }
})

module.exports = router;