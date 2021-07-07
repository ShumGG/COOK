import axios from "axios";
import React, {useEffect, useState} from "react";
import Notification_panel from "../components/CSS/Notification_panel.css";
import {useHistory} from "react-router-dom";
import Profile_pic from "./papa.jpg";

function Notifications_panel(props) {

    const {push} = useHistory();

    const [notifications, setNotifications] = useState([]);
    const [loadedNotifications, setLoadedNotifications] = useState(true);

    useEffect(() => {
        get_notifications();
    }, []);
    
    return (
        <div className = "notification_panel">
            {
                (notifications.length >= 1) ?
                notifications.map((notification) => {
                    return (
                        <>
                         <div key = {notification._id} className = "list-group-item">
                            {
                            <>
                                <div class = "d-flex, notifications">
                                    <div className = "img_wrap">
                                        {
                                            (notification.user.profile_pic === null)
                                            ? 
                                            <img src = {Profile_pic}
                                            style = {{width: "85px", height: "85px", objectFit: "cover"}}/>
                                            :
                                            <img src = {`/images/${notification.user.profile_pic}`}
                                            style = {{width: "85px", height: "85px", objectFit: "cover"}}/>
                                        }
                                    </div>
                                    <div className = "notification_icon_background">
                                        {
                                            (notification.type.type === "like_post" || notification.type.type === "like_comment")
                                            ?
                                            <span class = "material-icons">
                                                thumb_up_off_alt
                                            </span>
                                            : (notification.type.type === "comment_post")
                                            ?
                                            <span class = "material-icons">
                                                chat
                                            </span>
                                            :
                                            <span class = "material-icons">
                                                account_box
                                            </span>
                                        }
                                    </div>
                                    <div className = "notification_text">
                                        <h5 className = "mb-1" onClick = {() => open_notification(notification)}>
                                            {`${notification.user.user + " " + notification.notification}`}
                                        </h5>
                                        {
                                            (notification.seen)
                                            ? 
                                            null
                                            :
                                            <span class = "material-icons">
                                                visibility_off
                                            </span>
                                        }
                                        <div className = "notification_date_seen">
                                            <small>{notification.date}</small>
                                        </div>
                                    </div>
                                </div>
                            </>
                            }
                            </div>
                        </>
                    )
                })
                : 
                (loadedNotifications)
                ? null
                : <div className = "zero_notification"><p>You dont have any kind of notification.</p></div>
            }
        </div>
    )

    function get_notifications() {
        axios.post("/api/cook/users/get_notifications").then((response) => {
            if (response.data.length <= 0) {
                setLoadedNotifications(false);
            }else {
                const {notifications} = response.data;
                setLoadedNotifications(true);
                setNotifications(notifications.reverse());
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function open_notification(notification) { 
        axios.post("/api/cook/users/update_notifications",
        {
            user_id: props.user._id,
            id: notification._id
        },
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(() => {
            go_to_notification(notification);
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function go_to_notification(notification) {
        const {type, url} = notification.type;
        
        switch(type) {
            case "follow":
                window.location.href = `/users/profile/${url}`;
                break;
            case "like_comment":
                push({pathname: `/posts/recipe/${url}`});    
                break;
            case "like_post":
                push({pathname: `/posts/recipe/${url}`});    
                break;
            case "comment_post":
                push({pathname: `/posts/recipe/${url}`});    
                break;
        }
    }
}

export default Notifications_panel;