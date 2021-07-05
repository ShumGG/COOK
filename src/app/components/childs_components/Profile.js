import axios from "axios";
import React, {useEffect, useState, useRef} from "react";
import {useHistory} from "react-router-dom";
import Profile_pic from "./prueba.jpg";
import NotificationBar from "../NotificationBar";
import {send_notification, socket_io} from "../../../notifications/Notification";
import Profile_ from "../CSS/Profile.css";


function Profile(props) {
    
    const {push} = useHistory();

    const [login_user, setLoginUser] = useState("");
    const [profile_pic, setProfilePic] = useState();
    const [edit, setEdit] = useState(false);
    const [id, setId] = useState();
    const [name, setName] = useState();
    const [user, setUser] = useState();
    const [status, setStatus] = useState();
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [file, setFile] = useState();
    const [number_notifications, setNumberNotifications] = useState();
    const [select_profile_pic, setSelectProfilePic] = useState(false);
    const [user_info, setUserInfo] = useState();

    const input_ref = useRef(null);
    
    useEffect(() => {
        get_user_info();
    }, [])

    return (   
        <>
            <div style = {{margin: "auto"}}>
                <div className = "image_container" style = {{marginTop: "5px"}}>
                    {
                        (profile_pic === null)
                        ?
                        <img src = {Profile_pic} alt = "Profile pic" className = "profile_image"/>
                        :
                        <img  src = {`/images/${profile_pic}`} alt = "Profile pic 2" className = "profile_image"/>
                    }   
                </div>
                <div className = "user_info_container">
                    {
                        (login_user && user_info === null)
                        ?
                        <>
                            <form onSubmit = {upload_profile_pic} encType = "multipart/form-data" className = "upload_photo">
                                <input 
                                    id = "profile_pic"
                                    onChange = {() => setSelectProfilePic(true)}
                                    key = {file}
                                    type = "file" 
                                    name = "profile_pic" 
                                    style = {{color: "transparent", visibility: "hidden"}} 
                                    accept = "image/*" 
                                    ref = {(ref) => setFile(ref)}>
                                </input>
                                {
                                    (select_profile_pic) 
                                    ? <button type = "submit" style = {{width: "100px"}}>Upload photo</button>
                                    : null
                                }
                            </form>
                            <div>
                                <label for = "profile_pic" className = "profile_pic_label">
                                    Upload photo
                                    <span class="material-icons" style = {{float: "right", color: "black"}}>
                                        upload
                                    </span>
                                </label>
                            </div>
                            <div className = "followers_following">
                                <span className = "followers_span" onClick = {() => props.setView(1, "followers")}>
                                    Followers {followers.length}
                                </span>
                            </div>
                            <div className = "followers_following">
                                <span className = "following_span" onClick = {() => props.setView(1, "following")}>
                                    Following {following.length}
                                </span>
                            </div>
                        </>
                        : 
                        <>
                            <div className = "followers_following">
                                <span className = "followers_span" onClick = {() => props.setView(1, "followers")}>
                                    Followers {followers.length}
                                </span>
                            </div>
                            <div className = "followers_following">
                                <span className = "following_span" onClick = {() => props.setView(1, "following")}>
                                    Following {following.length}
                                </span>
                            </div>
                        </>
                    }
                    <div className = "user_info_container_2">
                        <input 
                            ref = {input_ref} readOnly = {!edit} 
                            value = {name} onChange = {text => setName(text.target.value)}>
                        </input>
                        <input 
                            readOnly = {!edit} 
                            value = {user} onChange = {text => setUser(text.target.value)}>
                        </input>
                        {
                            (props.user_info === null && !login_user)
                            ?
                            <textarea 
                                value = {(status === "No status" ? "" : status)}
                                placeholder = {(status === "No status") ? status : null}
                                onChange = {text => setStatus(text.target.value)}
                                readOnly = {!edit} 
                            ></textarea>
                        :
                            (status === "No status")
                            ? 
                            null
                            :
                            <textarea
                                value = {status}
                                onChange = {text => setStatus(text.target.value)}
                                readOnly = {!edit}>
                            </textarea>
                        }
                    </div>
                </div>
                    {
                        (login_user && user_info)
                        ?
                        (user_info.following_users.filter(followers => followers.user._id === login_user._id).length >= 1)
                        ?
                        <p>Follows you.</p>
                        :
                        null
                        :
                        null
                    }
                <div className = "user_info_container_2">
                    {
                        (login_user && user_info === null)
                        ? 
                            (edit) 
                        ?
                            <button 
                                type = "button" 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, save_button" 
                                onClick = {save_changes}
                            >
                                <span class="material-icons" style = {{float: "right"}}>
                                    check_circle_outline
                                </span>
                                <p style = {{margin: "0px", padding: "0px", display: "inline-block"}}>Save</p>
                            </button>
                        :
                            <button 
                                type = "button" 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, edit_button"
                                onClick = {edit_profile}
                            >
                                <span class = "material-icons" style = {{float: "right", color: "black"}}>
                                    person_pin
                                </span>
                                <p style = {{margin: "0px", padding: "0px", display: "inline-block", color: "black"}}>Edit profile</p>
                            </button>
                        :
                        (login_user && user_info)
                        ?
                            (login_user.following_users.filter(followers => followers.user._id == user_info._id).length >= 1)
                        ? 
                            <button 
                                type = "button" 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, follow_unfollow_button"
                                onClick = {unfollow_user}
                            >
                                <span class = "material-icons">
                                    person_remove
                                </span>
                                <p>Unfollow</p>
                            </button>
                        : 
                            <button 
                                type = "button"  
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, follow_unfollow_button"
                                onClick = {follow_user}
                            >
                                <span class = "material-icons">
                                    person_add
                                </span>
                                <p>Follow</p>
                            </button>
                        :
                            <button 
                                type = "button"  
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, follow_unfollow_button"
                                onClick = {follow_user}
                            >
                                <span class="material-icons">
                                    person_add
                                </span>
                                <p>Follow</p>
                            </button>
                    }
                    {
                        (login_user && !user_info)
                        ? null
                        :
                        <div className = "send_message_container">
                            <button 
                                type = "button"  
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, send_message_button" 
                                onClick = {send_message}
                            >
                                <span class="material-icons">
                                    sms
                                </span>
                                <p>Send message</p>
                            </button>
                        </div>
                    }
                </div>
            </div>
        </>
    );

    function send_message() {
        push({pathname: "/users/profile/message", state: {receiver: props.user_info}});
    }

    function get_user_info() {
        const {user_info, login_user} = props;
        if (!login_user && user_info || login_user && user_info) {
            setId(user_info._id);
            setName(user_info.name);
            setUser(user_info.user);
            setStatus(user_info.status);
            setProfilePic(user_info.profile_pic);
            setFollowers(user_info.followers);
            setFollowing(user_info.following_users);
            setNumberNotifications(user_info.number_notifications);
            setLoginUser(login_user);
            setUserInfo(user_info);
        }else {
            setId(login_user._id);
            setName(login_user.name);
            setUser(login_user.user);
            setStatus(login_user.status);
            setFollowers(login_user.followers);
            setFollowing(login_user.following_users);
            setProfilePic(login_user.profile_pic);
            setLoginUser(login_user);
            setUserInfo(user_info);
        }
    }
    
    function edit_profile() {
        input_ref.current.focus();
        setEdit(!edit);
    }

    function save_changes() {
        axios.post("/api/cook/users/update_profile",
        {
            basic_update: true, 
            id: id,
            name: name, 
            user: user, 
            status: status, 
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
        setEdit(!edit);
    }

    function follow_user() {
        axios.post("/api/cook/users/follow_user", 
        {
            user_to_follow: id,
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
                    message: `started to follow you.`,
                    value: user.toUpperCase(),
                    user_id: id,
                    user: props.login_user._id,
                    type: {type: "follow", url: `${props.login_user.user}`},
                    number_notifications: number_notifications
                }
                const data = await send_notification(notification);
                setLoginUser(response.data.user);
                setFollowers(response.data.follower.followers);
                setFollowing(response.data.follower.following_users);
                setNumberNotifications(data.data.number_notifications);
                socket_io(data);
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function unfollow_user() {
        axios.post("/api/cook/users/unfollow_user", 
        {
            user_to_unfollow: id,
            user_follower: props.login_user._id,
        }, 
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            const {user, followers} = response.data;
            setLoginUser(user);
            setFollowers(followers);
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function upload_profile_pic(e) {
        e.preventDefault();
        const file_ = file.files[0];
        const data = new FormData();
        data.append("actual_profile_pic", login_user.profile_pic);
        data.append("new_profile_pic", file_);
        data.append("user_id", login_user._id);
        axios({
            method: 'POST',
            url: '/api/cook/users/upload_profile_pic',
            data: data,
            config: {
                headers: { 
                    'Content-Type': 'multipart/form-data' 
                } 
            }
        }).then((response) => {
            const {profile_pic} = response.data;
            setProfilePic(profile_pic);
            setFile(null);
            setSelectProfilePic(false);
        }).catch(error => push({pathname: "/404", state: {error}}));
    };
}

export default Profile;
