const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");

router.get("/latest_posts", async (request, response) => {
    const latest_posts = await Posts.find();
    response.json(latest_posts);
});

module.exports = router;