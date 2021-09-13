import axios from "axios";
import React, { createRef, useEffect, useRef, useState } from "react";
import Mini_Chat_ from "../components/CSS/Mini_Chat.css";
import {useHistory} from "react-router-dom";
import Profile_pic from "./papa.jpg";
import io from "socket.io-client";

function Mini_Chat(props) {

    const {push} = useHistory();

    const textarea_message = createRef();
    const Socket = io("http://localhost:3000");
    
    const chats_reference = useRef([]);
    const number_chats_reference = useRef(0);

    const [user, setUser] = useState();
    const [chats, setChats] = useState([]);
    const [over_user, setOverUser] = useState();
    const [messages, setMessages] = useState([]);
    const [show_textarea, setShowTextArea] = useState(false);
    const [receiver, setReceiver] = useState("");
    const [sender, setSender] = useState("");
    const [user_to_talk, setUserToTalk] = useState("");
    const [message, setMessage] = useState("");
    const [init_chat, setInitChat] = useState(false);
    const [typing, setTyping] = useState(false);
    const [show_mini_chat, setShowMiniChat] = useState(false);
    const [number_chats, setNumberChats] = useState(0);

    useEffect(() => {
        if (props.user) setUser(props.user);
    }, []);

    useEffect(() => {
        if (user) get_chats();
    }, [user]);

    useEffect(() => {
        if (init_chat && user) {
            Socket.on("recive_message", message => {
                recive_message(message);
            });
            Socket.on("typing_message", message => {
                const selected_user = localStorage.getItem("selected_user");
                (message.sender === selected_user && message.receiver === user.user)
                ? (message.message === "")
                ? setTyping(false)
                : setTyping(true)
                : setTyping(false);
            });
            Socket.on("stop_typing", message => {
                const selected_user = localStorage.getItem("selected_user");
                (message.sender === selected_user && message.receiver === user.user)
                ? setTyping(false) 
                : setTyping(false);
            });
        }else {
            return;
        }
        return
    }, [init_chat]);

    useEffect(() => {
        if (user) {
            const selected_user = localStorage.getItem("selected_user");
            if (message != "") {
                Socket.emit("typing", {receiver: selected_user, sender: user.user, message: message});
            }else {
                Socket.emit("stop_typing", {receiver: selected_user, sender: user.user, message: message});
            }
        }
    }, [message]);

    return (
        <> 
            <div className = "mini_container">
                {
                    (number_chats_reference.current <= 0) 
                    ? null
                    :
                    <div className = "number_chats_container">
                        <p>{number_chats_reference.current}</p>
                    </div>
                }
                {
                (show_mini_chat)
                ?
                <div className = "float_chat_container">
                    <div className = "row g-0">
                        <div className = "col-3 g-0">
                            <div className = "left_">
                                <div className = "image_wrapper">
                                {  
                                    (chats.length >= 1)
                                    ? 
                                    chats.map((chat) => {
                                        return (
                                            <>
                                            <div 
                                                className = "d-flex" 
                                                style = {{overflow: "hidden", marginBottom: "15px", whiteSpace: "nowrap"}}
                                            >
                                                {
                                                    (over_user === chat.user_to_talk.user)
                                                    ?
                                                    <div className = "chat_name_container">
                                                        <div className = "chat_name">
                                                            <p>{chat.user_to_talk.user}</p> 
                                                        </div>
                                                    </div>
                                                    : null    
                                                }
                                                <div className = {
                                                        `${(over_user === chat.user_to_talk.user) 
                                                        ? "image_wrap_mini_chat_2" 
                                                        : "image_wrap_mini_chat"}`
                                                    } 
                                                    onMouseOver = {() => setOverUser(chat.user_to_talk.user)}
                                                    onMouseOut = {() => setOverUser("")}
                                                >
                                                {
                                                    (chat.user_to_talk.profile_pic === null)
                                                    ?
                                                    <>
                                                        <img 
                                                            src = {Profile_pic}
                                                            onClick = {() => load_chat(chat.user_to_talk, chat.seen)}
                                                        />
                                                        {
                                                            (chat.seen >= 1)
                                                            ?
                                                            <div className = "container_number_message_mini">
                                                                <div className = "number_message_mini">
                                                                    <p>{chat.seen}</p>
                                                                </div>
                                                            </div>
                                                            : null
                                                        }
                                                    </>
                                                    :
                                                    <>
                                                        <img 
                                                            src = {`/images/${chat.user_to_talk.profile_pic}`}
                                                            onClick = {() => load_chat(chat.user_to_talk)}
                                                        />
                                                        {
                                                            (chat.seen >= 1)
                                                            ?
                                                            <div className = "container_number_message_mini">
                                                                <div className = "number_message_mini">
                                                                    <p>{chat.seen}</p>
                                                                </div>
                                                            </div>
                                                            : null
                                                        }    
                                                    </>
                                                }
                                                </div>
                                            </div>
                                            </>
                                        )
                                    })
                                    : null
                                }
                                </div>
                            </div>
                        </div>
                        <div className = "col-9 g-0">
                            <div className = "right_"> 
                            {
                                (messages.length <= 0) 
                                ?
                                <div className = "select_chat_mini">
                                    <p>Select a chat to start chatting.</p>
                                </div>
                                :
                                null
                            }
                                <div className = "message_container_mini">
                                {
                                    (messages.length <= 0) 
                                    ? 
                                    null
                                    :
                                    messages.map((message) => {
                                        return  (
                                            <>
                                            {
                                                (message.type === "send")
                                                ?
                                                <div 
                                                    className = "message_send_mini" 
                                                >
                                                    <p>{message.message}</p>
                                                </div>
                                                :
                                                <div className = "message_recive_mini">
                                                    <p>{message.message}</p>
                                                </div>
                                            }
                                            </>
                                        )
                                    }).reverse()
                                }
                                {
                                    (typing)
                                    ?
                                    <div className = "typing_mini">
                                        <p>Typing...</p>
                                    </div>
                                    :
                                    null
                                }
                                </div>
                                <div className = "text_area">
                                    {
                                    (messages.length <= 0 && !show_textarea)
                                    ? null
                                    :
                                    <textarea
                                        placeholder = "Type message."
                                        onChange = {text => setMessage(text.target.value)}
                                        onKeyPress = {key => send_message(key)}    
                                        ref = {textarea_message}
                                    >
                                    </textarea> 
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                :
                null
                }
                <div className = "message_icon">
                    <button 
                        type = "button" 
                        className = "btn btn-outline-primary"
                        onClick = {show_chat}
                    >
                        <span className ="material-icons" style = {{float: "left"}}>textsms</span>
                    </button>
                </div>
            </div>
        </>
    )

    function show_chat() {
        setShowMiniChat(!show_mini_chat);
        setNumberChats(0);
        number_chats_reference.current = 0;
    }

    function get_chats() {
        axios.post("/api/cook/users/get_chats", 
        {
            user: user._id
        }, 
        {
            method: "POST", 
            headers: {
                "Accept": "application/json", 
                "Content-Type": "application/json"
            }
        }).then((response) => {
            if (response.data.length <= 0) {
                setChats([]);
                setInitChat(true);
                localStorage.removeItem("selected_user");
                chats_reference.current = [];
            }else {
                setChats(response.data);
                setInitChat(true);
                localStorage.removeItem("selected_user");
                chats_reference.current = response.data;
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }   

    function load_chat(selected_chat, seen) {
        const {user_to_talk, chat} = chats.find((chat) => chat.user_to_talk.user === selected_chat.user);
        localStorage.setItem("selected_user", user_to_talk.user);
        see_chat(user_to_talk, chat, seen);
    }

    function see_chat(user_to_talk, chat, seen) {
        axios.post("/api/cook/users/see_chat", 
        {   
            user: user._id, 
            chat_id: user_to_talk._id,
        },
        {
            method: "POST", 
            headers: {
                "Accept": "application/json", 
                "Content-Type": "application/json"
            }
        }).then((response) => {
            const chats_ = response.data;
            console.log("CHATS");
            console.log(chats_);
            if (seen >= 1) {
                const old_chat = [...chats];
                const ordered_chats = chats_.chats.sort((a,b) => {
                    return old_chat.indexOf(a) - chats_.chats.indexOf(b);
                });
                setChats(ordered_chats);
                setReceiver(user_to_talk.user);
                setSender(user.user);
                setUserToTalk(user_to_talk._id);
                setMessages(JSON.parse(chat));
            }else {
                const chat_index = chats.findIndex((chat) => chat.user_to_talk._id === user_to_talk._id);
                chats_.chats.unshift(chats_.chats.splice(chat_index, 1)[0]);
                setChats(chats_.chats);
                setReceiver(user_to_talk.user);
                setSender(user.user);
                setUserToTalk(user_to_talk._id);
                setMessages(JSON.parse(chat));
            }
        }).catch(error => {
            push({pathname: "/404", state: {error: error}});
        })
    }
    
    function send_message(key) {
        if (key.code === "Enter") {
            const new_message = {type: "send", message: textarea_message.current.value};
            Socket.emit("send_message", {receiver: receiver, message: textarea_message.current.value, sender: sender, sender_id: user});
            let old_messages = [...messages];
            old_messages.push(new_message);
            textarea_message.current.value = null;
            setMessages(old_messages);
            save_chat("send", old_messages);
            key.preventDefault();
        }else {
            return;
        }
    }   

    function save_chat(type_of_save, old_messages, new_user, first_message) {
        axios.post("/api/cook/users/save_chat", 
        {
            type: type_of_save,
            user: user._id,
            user_to_talk: (new_user) ? new_user: user_to_talk,
            chat: JSON.stringify(old_messages),
            receiver: receiver, 
            message: message, 
        }, 
        {
            method: "POST", 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            const {chats} = response.data;
            const chat_index = chats.findIndex((chat) => chat.user_to_talk._id === first_message);
            chats.unshift(chats.splice(chat_index, 1)[0]);
            setChats(chats);
            setInitChat(true);
            chats_reference.current = chats;
            if (!show_mini_chat) {
                show_number_chats();
            }
        });
    }

    function recive_message(message) {
        const selected_user = localStorage.getItem("selected_user");
        if (message.sender === user.user) {
            return;
        }else {
            if (selected_user === null && messages.length <= 0) {
                if (message.receiver === user.user) {
                    const chats_ = chats_reference.current;
                    const user_chat = chats_.find((chat) => chat.user_to_talk._id === message.sender_id._id);
                    if (user_chat) {
                        const {user_to_talk, chat} = user_chat;
                        const new_message = {type: "recive", message: message.message};
                        const parsed_chat = JSON.parse(chat);
                        parsed_chat.push(new_message);
                        if (message.sender === selected_user) {
                            setMessages(old_messages => [...old_messages, new_message]);
                            save_chat("same", parsed_chat, user_to_talk._id);  //all this is used for when user hasnt open any chat yet.
                        }else {
                            save_chat("another", parsed_chat, user_to_talk._id);  //all this is used for when user hasnt open any chat yet.
                        }
                    }else {
                        const new_message = [{type: "recive", message: message.message}];
                        save_chat("new", new_message, message.sender_id._id, message.sender_id._id);
                    }
                }else {
                    return;
                }
            }else {
                if (message.receiver === user.user) {
                    const chats_ = chats_reference.current;
                    const user_chat = chats_.find((chat) => chat.user_to_talk.user === message.sender_id.user);
                    if (user_chat) {
                        const {user_to_talk, chat} = user_chat;
                        const new_message = {type: "recive", message: message.message};
                        const parsed_chat = JSON.parse(chat);
                        parsed_chat.push(new_message);
                        if (message.sender === selected_user) {
                            setMessages(old_messages => [...old_messages, new_message]);
                            setTyping(false);
                            save_chat("same", parsed_chat, user_to_talk._id);  //all this is used for when user hasnt open any chat yet.
                        }else {
                            console.log("RECIVE MESSAGE SEGUNDO ELSE EJECUTADO, CHAT ENVIADO A SEND CHAT");
                            save_chat("another", parsed_chat, user_to_talk._id);  //all this is used for when user hasnt open any chat yet.
                        }
                    }else {
                        const new_message = [{type: "recive", message: message.message}];
                        save_chat("new", new_message, message.sender_id._id, message.sender_id._id);
                    }
                }
                return;
            }
        }
    }   

    function show_number_chats() {
        const chats = chats_reference.current;
        let user_chats = 0;
        chats.map((chat) => {
            if (chat.seen >= 1) {
                user_chats++;
            }
        });
        number_chats_reference.current = user_chats;
        setNumberChats(user_chats);
    }   
}

export default Mini_Chat;