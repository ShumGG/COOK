import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Link_to from "./childs_components/Link_to";
import Login from "./login.jpg";
import Profile_pic from "./papa.jpg";
import {send_notification, socket_io} from "../../notifications/Notification";
import Comment from "../components/CSS/Comments.css";

function Comments(props) {

    const {push} = useHistory();

    const [post_info, setPost] = useState("");
    const [user, setUser] = useState("");
    const [profile_pic, setProfilePic] = useState();
    const [post_comments, setPostComment] = useState("");
    const [comment, setComment] = useState("");
    const [init, setInit] = useState(false);
    const [comments_length, setCommentsLength] = useState(5);
    const [number_notifications, setNumberNotifications] = useState();

    useEffect(() => { 
        get_comments();
        //set_comments();
    }, []);

    useEffect(() => {
        console.log(post_comments);
    }, [post_comments]);


    return (
        <>
            {
            <div className = "wrapper">
                <div className = "container_comment">
                    <div class = "d-flex w-100 justify-content-between, post_comment">
                        {
                            (props.login_user)
                            ?
                            <Link_to>
                                <div className = "comments_image">
                                    {
                                        (props.login_user.profile_pic === null)
                                        ? <img src = {Profile_pic}/>
                                        : <img src = {`/images/${props.login_user.profile_pic}`}/>
                                    }
                                </div>
                            </Link_to>
                            :
                            null
                        }
                        <textarea 
                            onChange = {text => setComment(text.target.value)} 
                            placeholder = "Write a comment!" 
                            style = {{marginLeft: `${(props.login_user) ? `-25px` : `0px`}`}}>
                        </textarea>
                        <div className = "comment_button">
                            <button 
                                type = "button"
                                onClick = {() => post_comment()} 
                                className = "btn btn-success, comment">Comment.
                            </button>
                        </div>
                    </div>      
                    <div style = {{width: "100%", height: "auto", padding: "15px"}}>
                        {
                            (post_comments.length <= 0) 
                            ? 
                            <p className = "no_comments">No comments yet.</p>
                            : 
                            <div 
                                className = "list-group-item" 
                                style = {{backgroundColor: "transparent", borderWidth: "0px"}}
                            >
                            {
                                post_comments.map((comment, index) => {
                                    return (
                                        <>
                                        <div 
                                            className = "d-flex w-100 justify-content-between"
                                            style = {{marginBottom: `${(index + 1 === comments_length) ? `2%` : `0px`}`}}
                                        >
                                            <div className = "comment_users">
                                                <div className = "comment_info" onClick = {() => go_profile(comment.user.user)}>
                                                    {
                                                        (comment.user.profile_pic === null)
                                                        ? 
                                                        <>
                                                            <img src = {Profile_pic}/>
                                                            <p>{comment.user.user}</p>
                                                        </>
                                                        :
                                                        <>
                                                            <img src = {`/images/${comment.user.profile_pic}`}/>
                                                            <p>{comment.user.user}</p>
                                                        </>
                                                    }                
                                                </div>
                                                <div className = "user_comment_container">
                                                    {comment.comment}
                                                    {
                                                        (props.login_user)
                                                        ?
                                                        <>
                                                        {
                                                            (comment.users_liked.filter((user) => user == props.login_user._id).length >= 1)
                                                            ?
                                                            <button 
                                                                type = "button" 
                                                                className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top"
                                                                onClick = {() => unlike_comment(comment)}
                                                            >
                                                                <span className = "material-icons" style = {{color: "dodgerblue"}}>thumb_down</span>
                                                                <p>{comment.users_liked.length}</p>
                                                            </button>
                                                            :
                                                            <button 
                                                                type = "button" 
                                                                className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top"
                                                                onClick = {() => like_comment(comment)}
                                                            > 
                                                                <span className = "material-icons">thumb_up</span>
                                                                <p>{comment.users_liked.length}</p>
                                                            </button>
                                                        }
                                                        </>
                                                        :
                                                        <button 
                                                            type = "button" 
                                                            className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top"
                                                            onClick = {() => like_comment(comment)}
                                                        >
                                                            <span className = "material-icons">thumb_up</span>
                                                            <p>{comment.users_liked.length}</p>
                                                        </button>    
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        </>
                                    )
                                })
                                }
                                {
                                    (comments_length < props.comments.comments.length)
                                    ?
                                    <button 
                                        className = "btn btn-success, comment" 
                                        style = {{width: "100%"}} 
                                        type = "button" 
                                        onClick = {() => show_more_comments()}
                                    >
                                        Show more comments.
                                    </button>
                                    :
                                    <p className = "no_comments">No more comments.</p>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
            }
        </>
    )
        
    function get_comments() {
        axios.post("/api/cook/post/get_comments", 
        {
            post_id: props.post._id
        }, 
        {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            const {comments} = response.data;
            const cut_comments = comments.reverse().slice(0, comments_length);
            setPost(props.post);
            setPostComment(cut_comments);
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function post_comment() {
        if (props.login_user) {
            axios.post("/api/cook/post/post_comment", 
            {
                post_id: post_info._id,
                comment: {
                    user: props.login_user._id, 
                    comment: comment, 
                    comment_date: new Date().toLocaleString(),
                }
            },
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then(async (response) => {
                if (post_info.author._id == props.login_user._id) {
                    setPostComment(response.data.reverse());
                }else {
                    const notification = {
                        message: `commented on your post.`,
                        value: post_info.author.user.toUpperCase(),
                        user_id: post_info.author._id,
                        user: props.login_user._id,
                        type: {type: "comment_post", url: `${post_info.author.user}/${post_info.title}`},
                        number_notifications: post_info.author.number_notifications
                    }
                    const data = await send_notification(notification);
                    socket_io(data);
                    setPostComment(response.data.reverse());
                }
            }).catch(() => push({pathname: "/login", state: {redirect: `/posts/recipe_post/${post_info._id}`}}));
        }else {
            push({pathname: "/login"});
        }
    }

    function show_more_comments() {
        let new_length = comments_length + 5;
        const comments = [...props.comments.comments].reverse();
        const number_comments = comments.slice(0, new_length);
        setPostComment(number_comments);
        setCommentsLength(new_length);
    }

    function like_comment(comment) {
        axios.post("/api/cook/post/like_comment", 
        {
            user_id: props.login_user._id,
            post_id: post_info._id,
            comment_id: comment._id
        }, 
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(async (response) => {
            if (comment.user.user === props.login_user.user) {
               get_comments();
            }else {
                const notification = {
                    message: `liked your comment.`,
                    value: comment.user.user.toUpperCase(),
                    user_id: comment.user._id,
                    user: props.login_user._id,
                    type: {type: "like_comment", url: `${post_info.author.user}/${post_info.title}`},
                    number_notifications: comment.user.number_notifications
                }
                const data = await send_notification(notification);
                socket_io(data);
                get_comments();
            }
        }).catch(error => {
            (error.toString().includes(400))
            ? push({pathname: "/login", state: {redirect: `/posts/recipe_post/${post_info._id}`}}) 
            : push({pathname: "/404", state: {error: error}})
        });
    }

    function unlike_comment(comment) {
        axios.post("/api/cook/post/unlike_comment", 
        {
            user_id: props.login_user._id,
            post_id: post_info._id,
            comment_id: comment._id,
        }, 
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            const {comments} = response.data;
            const cut_comments = comments.slice(0, comments_length).reverse();
            setPostComment(cut_comments);
        }).catch(error => {
            (error.toString().includes(400))
            ? push({pathname: "/login", state: {redirect: `/posts/recipe_post/${post_info._id}`}}) 
            : push({pathname: "/404", state: {error: error}})
        });
    }

    function go_profile(user) {
        push({pathname: `/users/profile/${user}`});
    }
}

export default Comments;