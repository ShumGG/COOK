import axios from "axios";
import React, {useEffect, useState} from "react";
import Profile_pic from "./prueba.jpg";
import {Link, useHistory} from "react-router-dom";
import Follower from "../CSS/Follower.css";
import {send_notification, socket_io} from "../../../notifications/Notification";

function Followers_Following(props) {
    
    const {push} = useHistory();
    const [followers_following, setFollowersFollowing] = useState([]);

    useEffect(() => {
        console.log(props);
        show_followers_following();
    }, [props]);

    return (
        <>
        <div style = {{width: "100%", marginLeft: "-100px"}}>
        {
            (followers_following.length >= 1)
            ?
            <> 
                {
                    followers_following.map((follower) => {
                        return (
                            <div key = {follower._id} className = "list-group-item">
                                <div class = "d-flex w-100, follower_info">
                                    <img 
                                        src = {`/images/${follower.user.profile_pic}`} 
                                        onClick = {() => click_follower(follower.user.user)}
                                    />
                                    <div style = {{justifyContent: "center"}}>
                                        <h5 className = "mb-1, name" onClick = {() => click_follower(follower.user.user)}>
                                            {
                                            follower.user.name.toUpperCase()
                                            }
                                        </h5>
                                        <h6 className = "mb-1, user">
                                            {
                                            follower.user.user.toUpperCase()
                                            }
                                        </h6>
                                        <p>
                                            {
                                            (follower.user.status === "No status")
                                            ? `No status`
                                            : follower.user.status
                                            }
                                        </p>
                                        <div>
                                            {
                                            (props.login_user)
                                            ? 
                                            <>
                                            {
                                            (props.login_user._id == follower.user._id)
                                            ? 
                                            null
                                            : 
                                            (props.login_user.following_users.filter(
                                                following => 
                                                following.user._id == follower.user._id 
                                                && follower.user.user != props.login_user.user
                                            ).length >= 1)
                                            ? 
                                            <>
                                                <button type = "button" onClick = {() => unfollow_user(follower)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, button_container">
                                                    <div className = "button_inner_container">
                                                        <p>Unfollow</p>
                                                        <span class="material-icons">
                                                            person_remove
                                                        </span>
                                                    </div>
                                                </button>
                                            </>
                                            : 
                                            <>
                                            <button type = "button" onClick = {() => follow_user(follower)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, button_container">
                                                <div className = "button_inner_container">
                                                    <p>Follow</p>
                                                    <span class="material-icons">
                                                        person_add
                                                    </span>
                                                </div>
                                            </button>
                                            </>
                                            }
                                            </>
                                            :
                                            <button type = "button" onClick = {() => follow_user(follower)} className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, button_container">
                                                <div className = "button_inner_container">
                                                    <p>Follow</p>
                                                    <span class="material-icons">
                                                        person_add
                                                    </span>
                                                </div>
                                            </button>
                                        }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )    
                    })
                }
            </>
            :
            <>
                {
                    (props.login_user.user === props.user_info.user)
                    ? <p style = {{textAlign: "center"}}>You dont have followers.</p>
                    : <p style = {{textAlign: "center"}}>This user doesnt have followers.</p>
                }
            </>
        }
        </div>
        </>
    );

    function show_followers_following() {
        if (props.followers_following === "followers") {
            const followers = [...props.user_info.followers];
            setFollowersFollowing(followers);
        }else {
            const following = [...props.user_info.following_users];
            setFollowersFollowing(following);
        }
    }

    function click_follower(user) {
        window.location.href = `/users/profile/${user}`;
    }

    function follow_user(follower) {
        axios.post("/api/cook/users/follow_user", 
        {
            user_to_follow: follower.user._id,
            user_follower: props.login_user._id
        }, 
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(async (response) => {
            if (!response.data) {
                push({pathname: "/login", state: {redirect: `/users/profile/${login_user.user}`}});
            }else {
                const notification = {
                    message: `${props.login_user.user} started to follow you.`,
                    value: follower.user.user.toUpperCase(),
                    user_id: follower.user._id,
                    user: props.login_user._id,
                    type: {type: "follow", url: `${props.login_user.user}`},
                    number_notifications: follower.user.number_notifications
                }
                const data = await send_notification(notification);
                socket_io(data);
                props.verify_session();
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function unfollow_user(follower) {
        axios.post("/api/cook/users/unfollow_user", 
        {
            user_to_unfollow: follower.user._id,
            user_follower: props.login_user._id,
        }, 
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            props.verify_session();
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }
}

export default Followers_Following;