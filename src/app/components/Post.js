import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch, useLocation } from "react-router-dom";
import Comments from "./Comments";
import {send_notification, socket_io} from "../../notifications/Notification";
import Posts from "../components/CSS/Posts.css";
import NotificationBar from "../components/NotificationBar";
import Mini_Chat from "./Mini_Chat";

function Post(props) {

    const history = useHistory();
    const {push} = useHistory();
    const {path} = useRouteMatch();

    const [login_user, setLoginUser] = useState();
    const [post, setPost] = useState();

    useEffect(() => {
        verify_session();
    }, []);

    useEffect(() => {
        setPost(props.user_post);
    }, [props]);

    return (
        <>
        <div className = "background">
            <NotificationBar></NotificationBar>
            {
                (post)
                ?
                <div className = "wrapper">          
                    <div className = "post_container">
                        <div className = "content">
                            <h3>{post.title}</h3>
                            {
                                post.content.split("\n").map((content, index) => (
                                    <div key = {index}>
                                        {
                                            (content.includes("blob:http://localhost:3000/"))
                                            ? 
                                            <>
                                                <div className = "post_image">
                                                    <img src = {`/post_images/${post.images[post.images.findIndex(image => image.position === index)].img}`}/>
                                                </div>
                                            </>
                                            : 
                                            <p>{content}</p>
                                        }
                                    </div>
                                ))
                            }
                        </div>
                        <hr className = "hr"></hr>
                        <div className = "post_info_container">
                            <div className = "post_info">
                                {
                                    (login_user)
                                    ?
                                    (post.users_liked_post.filter(liked_user => liked_user == login_user._id).length >= 1) 
                                    ?
                                    <button type = "button" onClick = {() => unlike_post(post)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top">
                                        <span className = "material-icons" style = {{color: "dodgerblue"}}>thumb_down</span>
                                        <p>{post.likes}</p>
                                    </button> 
                                    :
                                    <button type = "button" onClick = {() => like_post(post)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top">
                                        <span className = "material-icons" style = {{color: "black"}}>thumb_up</span>
                                        <p>{post.likes}</p>
                                    </button>
                                    :
                                    <button type = "button" onClick = {() => like_post(post)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top">
                                        <span className = "material-icons" style = {{color: "black"}}>thumb_up</span>
                                        <p>{post.likes}</p>
                                    </button>
                                }
                                <button type = "button" style = {{padding: "5px", marginLeft: "10px"}} className = "btn btn-outline-primary, align-top">
                                    <span className ="material-icons" style = {{float: "left"}}>forum</span>
                                    <p className = "comments_p">{post.comments.length}</p>
                                </button>
                            </div>
                            <div className = "post_author">
                                <p>{`Author: ${post.author.user}`}</p>
                                <p>{`${post.post_date}`}</p>
                            </div>
                            <Comments post = {post} comments = {props.user_post} login_user = {(login_user) ? login_user : null}></Comments>
                        </div>
                    </div>
                </div>
                :
                null  
            }
            {
                (login_user) 
                ? 
                <><Mini_Chat user = {login_user}></Mini_Chat></>
                : null
            }
        </div>
        </>
    )
    
    function verify_session() {
        axios.post("/api/cook/users/verify_session").then((response) => {
            if (!response.data) {
                setPost(props.user_post);
            }else {
                const user = response.data;
                setLoginUser(user);
                setPost(props.user_post);
            }
        })
    }

    function like_post(post_map) {
        axios.post("/api/cook/post/like_post",
        {
            path: path,
            id_post: post_map._id,
            likes: post.likes,
        },
        { 
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(async (response) => {
            if (post.author.user === login_user.user) {
                props.recipe_post(response.data);
                history.replace({pathname: "/posts/recipe", state: {post: response.data}});
            }else {
                    const notification = {
                    message: `liked your post.`,
                    value: post.author.user.toUpperCase(),
                    user_id: post.author._id,
                    user: login_user._id,
                    type: {type: "like_post", url: `${post.author.user}/${post.title}`},
                    number_notifications: post.author.number_notifications,
                }
                const data = await send_notification(notification);
                socket_io(data);   
                props.recipe_post(response.data);
                history.replace({pathname: "/posts/recipe", state: {post: response.data}});
            }}).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function unlike_post(post_map) {
        axios.post("/api/cook/post/unlike_post",
        {
            path: path,
            id_post: post_map._id,
            likes: post.likes,
        },
        { 
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            props.recipe_post(response.data);
            history.replace({pathname: "/posts/recipe", state: {post: response.data}});
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }
}

export default Post;