const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

router.get("/latest_posts", async (request, response) => {
    try {
        const latest_posts = await Posts.find().populate(["author", "comments.user", "comments.users_liked.liked_user"]).exec();
        response.json(latest_posts.reverse());
    }catch(error) {
        response.status(400).json(error);
    }
});

router.get("/get_post", async (request, response) => {
    try {
        const posts = await Posts.find().populate(["author", "comments.user", "comments.users_liked.liked_user"]).exec();
        const {post_title} = request.query;
        const result = posts.filter(post => post.title.includes(post_title) || post.content.includes(post_title));
        (result.length >= 1) 
        ? response.status(200).json(result)
        : response.status(400).json("Post doesnt exist.");
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post("/current_post", async (request, response) => {
    try {
        const regex = /^[\.a-zA-Z0-9,!? ]*$/; //only characters, numbers and ,!?
        const {search_post_author, search_post_title} = request.body;

        if (search_post_author.match(regex) && search_post_title.match(regex)) {
            const result = await Posts.find({title: {$regex: new RegExp(search_post_title, "i")}}).populate(["author", "comments.user", "comments.users_liked.liked_user"]).exec().then((result) => {
                const post = result.find(post => post.author.user.toUpperCase() === search_post_author.toUpperCase() && post.title.toUpperCase() === search_post_title.toUpperCase());
                if (post) {
                    return post;
                }else {
                    response.send(404);
                }
            });
            response.status(200).json(result);
        }else {
            const result = await Posts.find({title: search_post_title}).populate(["author", "comments.user", "comments.users_liked.liked_user"]).exec().then((result) => {
                const post = result.find(post => post.author.user.toUpperCase() === search_post_author.toUpperCase() && post.title.toUpperCase() === search_post_title.toUpperCase());
                if (post) {
                    return post;
                }else {
                    response.send(404);
                }
            });
            response.status(200).json(result);
        }
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post("/get_comments", async(request, response) => {
    try {
        const {post_id} = request.body;
        const comments = await Posts.findById(post_id).populate(["comments.user", "comments.users_liked.user"]).exec();
        response.json(comments);
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post("/post_recipe", async (request, response) => {
    try {
        const storage = multer.diskStorage({
            destination: path.join(__dirname, "../public/post_images"),
            filename: function (request, file, cb) { //name of the file when save 
                cb(null,file.originalname);
            }
        });
        
        const upload = multer({
            storage: storage,
        }).array("images");

        upload(request, response, async(error) => {
            try {
                if (error) {
                    response.status(400).json(error);
                }else {
                    const {title, content, author, post_date, tags, images} = JSON.parse(request.body.post);
                    const new_post = new Posts({title, content, author, post_date, tags, images});
                    new_post.save();
                    response.status(200).send();
                }
            }catch(error) {
                response.status(400).json(error);
            }
        })
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post("/like_post", async(request, response) => {
    try {
        if (request.session.user === undefined) {
            response.send(404);
        }else {
            const {id_post, likes, path} = request.body;
            const user = request.session.user;
            if (path === "/users/profile/:user_to_search?") {
                const result = await Posts.findByIdAndUpdate({_id: id_post}, {$push: {users_liked_post: user._id}, $set: {likes: likes + 1}}, {new: true}).populate("author").exec();
                response.send(200);
            }else {
                const result = await Posts.findByIdAndUpdate({_id: id_post}, {$push: {users_liked_post: user._id}, $set: {likes: likes + 1}}, {new: true}).populate("author").exec();
                response.status(200).json(result);
            }
        }
    }catch(error) {
        response.status(400).json(error);    
    }
});

router.post("/unlike_post", async(request, response) => {
    try {
        if (request.session.user === undefined) {
            response.send(404);
        }else {
            const {id_post, likes, path} = request.body;
            const user = request.session.user;
            if (path === "/users/profile/:user_to_search?") {
                const result = await Posts.findByIdAndUpdate({_id: id_post}, {$pull: {users_liked_post: user._id}, $set: {likes: likes - 1}}, {new: true}).populate("author").exec();
                response.send(200);
            }else {
                const result = await Posts.findByIdAndUpdate({_id: id_post}, {$pull: {users_liked_post: user._id}, $set: {likes: likes - 1}}, {new: true}).populate("author").exec();
                response.status(200).json(result);
            }
        }
    }catch(error) {
       response.status(400).json(error);
    }
});

router.post("/post_comment", async(request, response) => {
    try {
        if (request.session.user) {
            const {comment, post_id} = request.body;
            const {comments} = await Posts.findByIdAndUpdate({_id: post_id},
            {$push: {comments: comment}}, {new: true}).populate("comments.user").exec();
            response.status(200).json(comments);
        }else {
            response.send(400);
        }
    }catch(error) {
        response.status(400).json(error);
    }
});

router.post("/like_comment", async (request, response) => {
    try {
        if (request.session.user) {
            const {user_id, post_id, comment_id} = request.body;
            const result = await Posts.findOneAndUpdate({_id: post_id, "comments._id": comment_id}, 
            {$push: {"comments.$.users_liked": user_id}}, 
            {new: true}).populate(["comments.user", "comments.users_liked"]).exec();
            response.status(200).json(result);
        }else {
            response.send(400);
        }
    }catch(error) {
        response.send(404).json(error);
    }
});

router.post("/unlike_comment", async (request, response) => {
    try {
        if (request.session.user) {
            const {user_id, post_id, comment_id} = request.body;
            const result = await Posts.findOneAndUpdate({_id: post_id, "comments._id": comment_id}, 
            {$pull: {"comments.$.users_liked": user_id}}, 
            {new: true}).populate(["comments.user", "comments.users_liked"]).exec();
            response.status(200).json(result);
        }else {
            response.send(400);
        }
    }catch(error) {
        console.log("error");
    }
});

router.post("/users_posts", async (request, response) => {
    try {
        const {author} = request.body;
        const posts = await Posts.find({author: author}).populate(["author", "comments.user"]).exec();
        response.status(200).json(posts);
    }catch(error) {
        response.status(400).json(error);
    }
});

module.exports = router;    