import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Message_panel from "../components/CSS/Message.css";

import Profile_pic from "./papa.jpg";

function Message_Panel(props) {

    const {push} = useHistory();

    const [messages, setMessages] = useState([]);
    const [loadedMessages, setLoadedMessages] = useState(true)

    useEffect(() => {
        get_chats();
    }, []);
 
    return (
        <div className = "message_panel">
            {
                (messages.length >= 1) 
                ?
                    messages.map((chat) => {
                        return (
                            <>
                            <div key = {chat._id} className = "list-group-item">
                                {
                                <>
                                    <div class = "d-flex, messages" onClick = {() => open_chat(chat)}>
                                        <div className = "img_wrap">
                                            {
                                                (chat.user_to_talk.profile_pic === null)
                                                ?
                                                <img src = {Profile_pic}
                                                style = {{width: "85px", height: "85px", objectFit: "cover"}}/>
                                                :
                                                <img src = {`/images/${chat.user_to_talk.profile_pic}`}
                                                style = {{width: "85px", height: "85px", objectFit: "cover"}}/>
                                            }
                                        </div>
                                        <div className = "message_icon_background">
                                            {
                                                (chat.seen >= 1)
                                                ? <p>{chat.seen}</p>
                                                : null
                                            }
                                        </div>
                                        <div className = "message_text">
                                            <h5 className = "mb-1">
                                                {chat.user_to_talk.user}
                                            </h5>
                                            <p className = {`${(chat.seen >= 1) ? "message_seen" : "message"}`}>{JSON.parse(chat.chat)[JSON.parse(chat.chat).length - 1].message}</p>
                                        </div>
                                    </div>
                                </>
                                }
                                </div>
                            </>
                        )
                    })
                :
                (loadedMessages)
                ? null
                : <div className = "zero_message"><p>You dont have any messages.</p></div>
            }
        </div>
    )

    function get_chats() { 
        axios.post("/api/cook/users/get_chats",
        {
            user: props.user._id,
        },
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            if (response.data.length >= 1) {
                setLoadedMessages(true)
                setMessages(response.data);
             }else {
                setLoadedMessages(false)
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function open_chat(chat) {
        axios.post("/api/cook/users/update_messages",
        {
            user_id: props.user._id,
            chat_id: chat.user_to_talk._id
        },
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(() => {
            push({pathname: "/users/profile/message", state: {user: chat.user_to_talk.user}});
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }
}

export default Message_Panel;