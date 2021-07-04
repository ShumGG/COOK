import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useHistory, useParams, useRouteMatch } from "react-router-dom";
import Post from "./Post";

function Recipe_post() {

    const location = useLocation();

    const {push} = useHistory();
    const {post_author, post_title} = useParams();
 
    const [post, setPost] = useState();
    
    useEffect(() => {
        recipe_post();
    },[]);

    useEffect(() => {
        console.log(post);
    }, [post]);

    return (
        (post) 
        ?
        <Post user_post = {post} recipe_post = {recipe_post.bind(this)}>
            <h1>Welcome to recipe post from main</h1>
            <button type = "button" onClick = {go_index}>Main</button>
        </Post>
        :
        null
    )

    function recipe_post(updated_post) {
        if ((location.state && !post_author) && (location.state && !post_title)) { //if was click and no by url
            if (updated_post) {
                setPost(updated_post);
            }else {
                const {post} = location.state; //get the post id
                setPost(post);
            }
        }else if ((!location.state && post_author) && (!location.state && post_title)) { //if was by url call function
            get_post();
        }else {
            push("/login"); //if it wasnt by url or cliking, send to login
        }
    }

    function get_post() {
        
        let search_post_author = (post_author) ? post_author : post.author;
        let search_post_title = (post_title) ? post_title : post.title;
        
        axios.post("/api/cook/post/current_post", 
        {
            search_post_author: search_post_author,
            search_post_title: search_post_title,
        },
        {
            method: "POST", 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        }).then((response) => {
            (response.status === 200) 
            ? setPost(response.data)
            : push({pathname: "/404", state: {error: "Post doesnt exist."}});
        }).catch(error => push({pathname: "/404", state: {error: `${error} Post doesnt exist.`}}));
    }

    function go_index() {
        push("/");
    }

}

export default Recipe_post;