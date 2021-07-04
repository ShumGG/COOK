import axios from "axios";
import React, {useEffect, useState} from "react";
import io from "socket.io-client";
import Profile_pic from "./papa.jpg";
import NavBar from "../components/CSS/NavBar.css";
import Notification_panel from "../components/CSS/Notification_panel.css";
import {Link, useRouteMatch, useHistory} from "react-router-dom";
import Notifications_panel from "../components/Notifications_Panel";
import Message_Panel from "./Message_Panel";

function NotificationBar () {

    const {path} = useRouteMatch();
    const {push} = useHistory();

    const Socket = io("http://localhost:3000");

    const [icon, setIcon] = useState("");
    const [user, setUser] = useState(false);
    const [show_notification, setShowNotification] = useState(false);
    const [show_messages, setShowMessages] = useState(false);
    const [number_notifications, setNumberNotifications] = useState("");
    const [number_messages, setNumberMessages] = useState("");

    useEffect(() => {
        verify_session();
        if (path === "/login") {
            setIcon("app_registration");
        }else if (path === "/register") {
            setIcon("login");
        }else {
            return;
        }

    }, []);

    useEffect(() => {
        (user)
        ? 
        Socket.on("update_notifications", (notification) => {
            (notification === user.user)
            ? get_notifications()
            : null
        })
        :
        null
    }, [user]);
    
    return (
        <div>
            <div className = "topnav">
                <button type = "button" onClick = {() => push({pathname: "/"})} className = "btn btn-outline-primary, btn btn-primary btn-sm, home">
                    <span class="material-icons">
                        home
                    </span>
                    <a style = {{margin: "0px", padding: "0px", display: "block"}}>Home</a>
                </button>
                {/*<button type = "button" onClick = {() => push({pathname: "/"})} className = "btn btn-outline-primary, btn btn-primary btn-sm">
                    <span class="material-icons">
                        home
                    </span>
                    <p style = {{margin: "0px", padding: "0px", display: "block"}}>Home</p>
                </button>
                <button type = "button" onClick = {() => push({pathname: "/"})} className = "btn btn-outline-primary, btn btn-primary btn-sm">
                    <span class="material-icons">
                        home
                    </span>
                    <p style = {{margin: "0px", padding: "0px", display: "block"}}>Home</p>
                </button>*/}        
                {
                    (user)
                    ?
                    <>
                        <div className = "topnav_login">
                            <button 
                                type = "button" onClick = {post_recipe} 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, post_recipe_button" 
                                onClick = {post_recipe}
                            >
                                <span class="material-icons">notes</span>
                                <p>Post new recipe</p>
                            </button>
                            <button 
                                type = "button" 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, message_button"
                                onClick = {messages}    
                            >
                                <span class = "material-icons">
                                    question_answer
                                </span>
                                {
                                    (number_messages >= 1)
                                    ? <p>{number_messages}</p>
                                    : null
                                }
                            </button>
                            {
                                (show_messages)
                                ? <Message_Panel user = {user}></Message_Panel>
                                : null
                            }
                            <button 
                                type = "button" 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, notification_button"
                                onClick = {notification}    
                            >
                                <span class = "material-icons">
                                    notifications
                                </span>
                                {
                                    (number_notifications >= 1)
                                    ? <p>{number_notifications}</p>
                                    : null
                                }
                            </button>
                            {
                                (show_notification)
                                ? <Notifications_panel user = {user}></Notifications_panel>
                                : null
                            }
                            {
                                <div 
                                    className = "profile_image_bar"
                                    onClick = {() => push({pathname: "/users/profile"})}>
                                    <img src = {`${(user.profile_pic === null) ? Profile_pic : `/images/${user.profile_pic}`}`}></img>
                                </div>
                            }
                            <button 
                                type = "button" 
                                className = "btn btn-outline-primary, btn btn-primary btn-sm, logout_button"
                                onClick = {logout}
                            >
                                <span class = "material-icons">
                                    logout
                                </span>
                                <p>Logout</p>
                            </button>
                        </div>
                    </>
                    : 
                    <>
                        {
                            (path === "/login")
                            ? 
                            <div className = "topnav_login">
                                <button type = "button" onClick = {go_register} className = "btn btn-outline-primary, btn btn-primary btn-sm, register_button">
                                    <p style = {{margin: "0px", padding: "0px", display: "inline-block"}}>Register</p>
                                    <span class = "material-icons" style = {{float: "right"}}>
                                        {`${icon}`}
                                    </span>
                                </button>
                            </div>
                            :
                            (path === "/register")
                            ?
                            <div className = "topnav_login">
                                <button type = "button" onClick = {go_login} className = {`btn btn-outline-primary, btn btn-primary btn-sm, login_button`}>
                                    <p style = {{margin: "0px", padding: "0px", display: "inline-block"}}>Login</p>
                                    <span class = "material-icons" style = {{float: "right"}}>
                                        {`${icon}`}
                                    </span>
                                </button>
                            </div>
                            :
                            <>
                            <div className = "topnav_both">
                               <button type = "button" onClick = {go_register} className = "btn btn-outline-primary, btn btn-primary btn-sm, register_button">
                                    <p style = {{margin: "0px", padding: "0px", display: "inline-block"}}>Register</p>
                                    <span class = "material-icons" style = {{float: "right"}}>
                                        app_registration
                                    </span>
                                </button>
                                <button type = "button" onClick = {go_login} className = "btn btn-outline-primary, btn btn-primary btn-sm, login_button">
                                    <p style = {{margin: "0px", padding: "0px", display: "inline-block"}}>Login</p>
                                    <span class = "material-icons" style = {{float: "right"}}>
                                        login
                                    </span>
                                </button>
                            </div>
                            </>
                        }
                    </>
                }
            </div>
        </div>
    )
    
    function verify_session() {
        axios.post("/api/cook/users/verify_session").then((response) => {
            if (response.data) {
                const user = response.data;
                setUser(user);
                init_notifications(user.user);
                setSubscription();
                get_notifications();
                get_messages();
            }else {
                return;
            }
        });
    }

    function get_notifications() {
        axios.post("/api/cook/users/get_notifications").then((response) => {
            const {number_notifications} = response.data;
            setNumberNotifications(number_notifications);
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function get_messages() {
        axios.post("/api/cook/users/get_messages").then((response) => {
            let number_messages = 0;
            if (response.data.length <= 0) {
                setNumberMessages(0);   
            }else {
                const {chats} = response.data;
                chats.map((chat) => {
                    number_messages += chat.seen;
                });
                (number_messages >= 1) 
                ? setNumberMessages(number_messages)
                : null
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function init_notifications(user) {
        OneSignal.push(() => {
            window.OneSignal.init({
                appId: "7dc81726-659a-47c4-bfdb-ebca6fbdd879",
                allowLocalhostAsSecureOrigin: true,
                promptOptions: {
                    slidedown: {
                        enabled: true,
                        autoPrompt: true,
                        actionMessage: "We'd like to show you notifications for the latest news and updates.",
                    }
                },
                welcomeNotification: {
                    title: "Welcome to Cook!", 
                    message: "Hope you enjoy :)!",
                },
            });
            window.OneSignal.sendTag("username", user.toUpperCase());
        });
    }

    function setSubscription() {
        OneSignal.push(() => {
            window.OneSignal.setSubscription(true);
        });
    }
    
    function notification() {
        setShowNotification(!show_notification);
        setShowMessages(false);
        if (number_notifications > 0) {
            axios.post("/api/cook/users/update_notifications", 
            {
                user_id: user._id
            },
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                setNumberNotifications("");
            }).catch(error => push({pathname: "/404", state: {error: error}}));
        }else {
            return;
        }
    }

    
    function messages() {
        setShowMessages(!show_messages);
        setShowNotification(false);
        if (number_messages > 0) {
            axios.post("/api/cook/users/update_messages", 
            {
                user_id: user._id
            },
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                setNumberMessages(0);
            }).catch(error => push({pathname: "/404", state: {error: error}}));
        }else {
            return;
        }
    }


    function logout() {
        axios.post("/api/cook/login/logout").then((response) => {
            if (response.data === "OK") {
                OneSignal.push(() => {
                    window.OneSignal.setSubscription(false);
                });
                Socket.emit("logout", user.user);
                (path === "/")
                ? window.location.reload()
                : push({pathname: "/"})
            }else {
                push({pathname: "/404", state: {error: "Couldn't logout"}});
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function go_login() {
        push({pathname: "/login"});
    }

    function go_register() {
        push({pathname: "/register"});
    }

    function post_recipe() {
        push({pathname: "/posts/post_recipe"});
    }
}

export default NotificationBar;