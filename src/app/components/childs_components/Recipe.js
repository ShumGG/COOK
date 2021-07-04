import axios from "axios";
import React, { useEffect, useState } from "react";
import {useHistory, useParams, useLocation } from "react-router-dom";
import Post from "../Post";

function Recipe() {

    const location = useLocation();

    const {post_author, post_title} = useParams();
    const {push} = useHistory();
    
    const [post, setPost] = useState("");
    const [loggin_user, setLoginUser] = useState("");

    useEffect(() => {
        get_post();
    },[]);
    
    
    return (
        (post) 
        ? 
        <Post user_post = {post} user_info = {loggin_user}>
        </Post>
        :
        null 
    )

    function get_post() {
        axios.get("/api/cook/post/current_post", 
        {
            params: {
                search_post_author: post_author,
                search_post_title: post_title,
            }
        },
        {
            method: "GET", 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        }).then((response) => {
            window.addEventListener("popstate", function (event) {
                const r = true;
                if (r === true) {
                    (location.state.view === 0)
                    ? push({pathname: `/users/profile/${response.data.author.user}`, state: {view: 0}})
                    : push({pathname: `/users/profile/${response.data.author.user}`, state: {view: 1}});
                }else {
                    return;
                }
            });
            setPost(response.data);
        }).catch(error => push({pathname: "/404", state: {error: `${error} post or user doenst exist`}}));
    }

    function go_user_profile() {
        push({pathname: `/users/profile/${post.author.user}`, state: {view: location.state.view}});
    }
}

export default Recipe;