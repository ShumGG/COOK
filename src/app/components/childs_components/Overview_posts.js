import axios from "axios";
import React, {useEffect} from "react";
import {useHistory, useLocation, useRouteMatch} from "react-router-dom";
import {send_notification, socket_io} from "../../../notifications/Notification";
import Overview from "../CSS/Overview.css";

function Overview_posts(props) {
    
    const {push} = useHistory();
    const {path} = useRouteMatch();
    const location = useLocation();
    
    return (
        <>
        <div className = "overview_container">
            {
                (props.user_posts.length <= 0)
                ? 
                <p> This user has no recipes to show</p>
                : 
                <div className = "list_container">
                {   
                    props.user_posts.map((post, index, {length}) => {
                        return (
                            <div key = {post._id} className = "list-group-item, overview_list">
                                {
                                <>
                                <div class = "d-flex w-100 justify-content-between">
                                    <h5 className = "mb-1, post_title" onClick = {() => click_post(post)}>
                                        {
                                            post.title
                                        }
                                    </h5>
                                    <small>{(post.post_date) ? `Date: ${post.post_date}` : null}</small>
                                </div>
                                <div className = "like_comment_container">
                                    {
                                        (!props.login_user) 
                                        ? 
                                        <button type = "button" onClick = {() => like_post(post)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, like_dislike_button">
                                            <span className = "material-icons" style = {{float: "left"}}>thumb_up</span>
                                            <p className = "like_dislike_p">{post.likes}</p>
                                        </button>
                                        :
                                        (post.users_liked_post.filter(liked_user => liked_user === props.login_user._id).length >= 1) 
                                        ? 
                                        <button type = "button" onClick = {() => unlike_post(post)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, like_dislike_button">
                                            <span className = "material-icons" style = {{float: "left", color: "dodgerblue"}}>thumb_down</span>
                                            <p className = "like_dislike_p">{post.likes}</p>
                                        </button>
                                        :
                                        <button type = "button" onClick = {() => like_post(post)} className = "btn btn-outline-primary,  btn btn-primary btn-lg, align-top, like_dislike_button">
                                            <span className = "material-icons" style = {{float: "left"}}>thumb_up</span>
                                            <p className = "like_dislike_p">{post.likes}</p>
                                        </button>
                                    }
                                    {
                                        (post.comments.length <= 0) 
                                        ? 
                                        <button type = "button" style = {{padding: "5px", marginLeft: "10px"}} className = "btn btn-outline-primary, align-top">
                                            <span className ="material-icons" style = {{float: "left"}}>forum</span>
                                            <p className = "comments_p">0</p>
                                        </button>
                                        : 
                                        <button type = "button" style = {{padding: "5px", marginLeft: "10px"}} className = "btn btn-outline-primary, align-top">
                                            <span className ="material-icons" style = {{float: "left"}}>forum</span>
                                            <p className = "comments_p">{post.comments.length}</p>
                                        </button>
                                    }
                                </div>
                                </>
                                }
                            </div>
                        )
                    })
                }
                </div>
            }
        </div>
        </>
    )
 
    function click_post(post) {
        push({pathname: "/posts/recipe", state: {post: {...post}}});
    }

    function like_post(post) {
        if (props.login_user) {
            axios.post("/api/cook/post/like_post",
            {
                path: path,
                id_post: post._id, 
                likes: post.likes
            },
            { 
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(async (response) => {
                if (response.data === "OK") {
                    if (post.author._id == props.login_user._id) {
                        props.get_user_posts(props.login_user._id);
                    }else {
                        const notification = {
                            message: `${props.login_user.user} liked your post.`,
                            value: post.author.user.toUpperCase(),
                            user_id: post.author._id,
                            user: props.login_user._id,
                            type: {type: "like_post", url: `${post.author.user}/${post.title}`},
                            number_notifications: post.author.number_notifications,
                        }
                        const data = await send_notification(notification);
                        socket_io(data);
                        props.get_user_posts(post.author._id);
                    }
                }else {
                    push({pathname: "/404", state: {error: response.data}});
                }
            }).catch(error => push({pathname: "/404", state: {error: error}}));
        }else {
            push({pathname: "/login", state: {redirect: `/posts/recipe/${post._id}`}});
        }
    }
    
    function unlike_post(post) {
        axios.post("/api/cook/post/unlike_post",
        {
            path: path,
            id_post: post._id,
            likes: post.likes
        },
        { 
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            (response.status === 200) 
            ? props.get_user_posts(post.author._id)
            : push({pathname: "/404", state: {error: response.data}});
        }).catch(error => alert(error));
    }
}

export default Overview_posts;