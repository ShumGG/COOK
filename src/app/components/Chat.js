import React, { createRef, useEffect, useRef, useState } from "react";
import Chat_ from "../components/CSS/Chat.css";
import NotificationBar from "./NotificationBar";
import io from "socket.io-client";
import axios from "axios";
import {useHistory, useLocation} from "react-router-dom";
import Profile_pic from "./papa.jpg";

function Chat() {

    const {push} = useHistory();

    const location = useLocation();
    const Socket = io("http://localhost:3000");
    const textarea_message = createRef();
    
    const chats_reference = useRef([]);

    const [textarea_heigth, setTextAreaHeigth] = useState(10);
    const [message_heigth, setMessageHeigth] = useState(81);
    const [message, setMessage] = useState("");
    const [message_length, setMessageLength] = useState(280);
    const [receiver, setReceiver] = useState("");
    const [sender, setSender] = useState("");
    const [user_to_talk, setUserToTalk] = useState(""); 
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState("");
    const [typing, setTyping] = useState(false);
    const [chats, setChats] = useState([]);
    const [clone_chats, setCloneChats] = useState([]);
    const [show_chat, setShowChat] = useState(false);
    const [location_state, setLocationState] = useState("");
    const [bottom, setBottom] = useState(10);
    const [init_chat, setInitChat] = useState(false);
    const [show_textarea, setShowTextArea] = useState(true);
    
    useEffect(() => {
        verify_session();
    }, []);
    
    useEffect(() => {
        if (user) {
            start_message();
        }else {
            return;
        }
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
    }, [init_chat]);

    useEffect(() => {
        if (location_state === "") {
            return;
        }else {
            if (location.state) {
                if (location.state.user) { //load chat from message icon
                    set_chat(location.state.user);
            }else if (location.state.receiver) {
                    set_chat_from_external(location.state.receiver);
                }else {
                    return;
                }
            }else {
                return;
            }
        }
    }, [location_state]);

    useEffect(() => {
        const selected_user = localStorage.getItem("selected_user");
        if (message != "") {
            Socket.emit("typing", {receiver: selected_user, sender: user.user, message: message});
        }else {
            Socket.emit("stop_typing", {receiver: selected_user, sender: user.user, message: message});
        }
    }, [message]);

    return (     
        <>
            <div className = "notification_bar">
                <NotificationBar></NotificationBar>
            </div>
            <div className = "row g-0">
                <div className = "col-4 g-0">
                    <div className = "left">
                        <div className = "list-group" style = {{marginTop: "70px"}}>
                            <div className = "search_input">
                                <input 
                                    placeholder = "Search Chat." 
                                    onChange = {chat => search_chat(chat.target.value)}>
                                </input>
                            </div>
                            {
                            (chats.length >= 1)
                            ?
                            chats.map((chat, index) => {
                                return (
                                <>
                                    <div 
                                        key = {chat._id} 
                                        className = "list-group-item, chats" 
                                        onClick = {() => load_chat(chat.user_to_talk, chat.seen)}
                                        style = {{
                                            borderBottom: 
                                            `${(index + 1 === chats.length) 
                                            ? null 
                                            : "3px solid rgba(111, 177, 64, 0.75)"}`
                                        }}
                                    >
                                        <div className = "d-flex" 
                                            style = {{
                                                background: 
                                                `${(chat.user_to_talk.user === receiver) 
                                                ? "rgb(129, 201, 78)" 
                                                : "transparent"}`
                                            }}
                                        >
                                            <div className = "image_wrap_chat">
                                            {
                                                (chat.user_to_talk.profile_pic === null)
                                                ?
                                                <>
                                                    <img src = {Profile_pic}
                                                    style = {{
                                                        width: "85px", 
                                                        height: "85px", 
                                                        objectFit: "cover", 
                                                        borderRadius: "50%"}}
                                                    />
                                                    {
                                                        (chat.seen >= 1)
                                                        ?
                                                        <div className = "number_message">
                                                            <p>{chat.seen}</p>
                                                        </div>
                                                        : null
                                                    }  
                                                </>
                                                :
                                                <>
                                                    <img src = {`/images/${chat.user_to_talk.profile_pic}`}
                                                    style = {{
                                                        width: "85px",
                                                        height: "85px", 
                                                        objectFit: "cover", 
                                                        borderRadius: "50%"}}
                                                    />
                                                    {
                                                        (chat.seen >= 1)
                                                        ?
                                                        <div className = "number_message">
                                                            <p>{chat.seen}</p>
                                                        </div>
                                                        : null
                                                    }  
                                                </>
                                            }
                                            </div>
                                            <div className = "chat_info">
                                                <p className = "chat_user">
                                                    {chat.user_to_talk.user}
                                                </p>
                                                <p className = {`${(chat.seen >= 1) ? "chat_message_seen" : "chat_message"}`}>
                                                    {
                                                        (chat.chat.length >= 1)
                                                        ? JSON.parse(chat.chat)[JSON.parse(chat.chat).length - 1].message
                                                        : null
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                                )
                            })
                            :
                            <>
                            {
                                (chats.length <= 0 && show_chat)
                                ?
                                <div className = "cant_find">
                                    <p>Cant find chat.</p>
                                </div>
                                :
                                null    
                            }
                            </>
                            }
                        </div>
                    </div>
                </div>
                <div className = "col g-0">
                    <div className = "right">
                        {
                            (messages.length <= 0) 
                            ?
                            <div className = "select_chat">
                                {
                                    (init_chat) 
                                    ?
                                    (chats.length <= 0) 
                                    ? <p>Theres no chat.</p>
                                    : 
                                    (show_textarea)
                                    ? <p>Select a chat to start chatting.</p>
                                    : null
                                    : null
                                }
                            </div>
                            :
                            null
                        }
                        <div 
                            className = "message_container" 
                            style = {{
                                height: `${message_heigth}%`,bottom: `${bottom}%`
                            }}>
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
                                                    className = "message_send" 
                                                >
                                                    <p>{message.message}</p>
                                                </div>
                                                :
                                                <div className = "message_recive"><p>{message.message}</p></div>
                                            }
                                        </>
                                    )
                                }).reverse()
                            }
                            {
                                (typing)
                                ?
                                <div className = "typing">
                                    <p>Typing...</p>
                                </div>
                                :
                                null
                            }
                        </div>
                        <div className = "textarea_message" style = {{height: `${textarea_heigth}%`}}>
                            {
                                (messages.length <= 0 && show_textarea) 
                                ? null
                                :
                                <textarea
                                    onChange = {message => write_message(message.target.value)}
                                    onKeyPress = {key => send_message(key, message)}
                                    placeholder = "Type message."
                                    ref = {textarea_message}>
                                </textarea>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    function verify_session() {
        if (user) {
            return;   
        }else {
            axios.post("/api/cook/users/verify_session").then((response) => {
                if (!response.data) {
                    push({pathname: "/404", state: {error: "Need to login"}});
                }else {
                    setUser(response.data);
                    if (messages.length <= 0) {
                        localStorage.removeItem("selected_user");
                    }
                }
            });
        }
    }
    
    function start_message() {
        axios.post("/api/cook/users/get_chats", 
        {
            user: user._id,
        }, 
        {
            method: "POST", 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            if (response.data.length <= 0) {
                setSender(user.user);
                setChats([]);
                setLocationState(location.state);
                setInitChat(true);
                chats_reference.current = [];
            }else {
                const {chats} = response.data;
                setChats(response.data);
                setCloneChats(chats);
                setSender(user.user);
                setLocationState(location.state);
                setInitChat(true);
                chats_reference.current = response.data;
            }
        });
    }

    function save_chat(type_of_save, old_messages, new_user, first_message) {
        axios.post("/api/cook/users/save_chat", 
        {
            type: type_of_save,
            user: user._id,
            user_to_talk: (user_to_talk === "") ? new_user : (new_user) ? new_user : user_to_talk,
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
            setCloneChats(chats);
            setInitChat(true);
            chats_reference.current = chats;
        });
    }
    
    function write_message(message) {
        if (message.length >= message_length && textarea_heigth < 30 && bottom === 10) {
            setTextAreaHeigth(textarea_heigth + 10);
            setMessageHeigth(message_heigth - 10);
            setMessage(message);
            setMessageLength(message.length + 280);
            setBottom(bottom + 10);
        }else if(message.length < message_length - 280 && textarea_heigth > 10 && bottom >= 20) {
            setTextAreaHeigth(textarea_heigth - 10);
            setMessageHeigth(81);
            setMessage(message);
            setMessageLength(message_length - 280);
            setBottom(10);
        }else {
            setMessage(message);
        }
    }
    
    async function send_message(key) {
        if (key.code === "Enter") {
            const new_message = {type: "send", message: textarea_message.current.value};
            Socket.emit("send_message", {receiver: receiver, message: textarea_message.current.value, sender: sender, sender_id: user});
            let old_messages = [...messages];
            old_messages.push(new_message);
            textarea_message.current.value = null;
            save_chat("send", old_messages);
            setMessages(old_messages);
            key.preventDefault();
        }else {
            return;
        }
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

    function load_chat(talk_to, seen) { //user click in chat
        const {user_to_talk, chat} = chats.find((chat) => chat.user_to_talk.user === talk_to.user);
        localStorage.setItem("selected_user", user_to_talk.user);
        see_chat(user_to_talk, chat, seen);
    }

    function set_chat(user) {
        const {user_to_talk, chat} = chats.find((chat) => chat.user_to_talk.user === user);
        localStorage.setItem("selected_user", user_to_talk.user);
        setReceiver(user_to_talk.user);
        setSender(user.user);
        setUserToTalk(user_to_talk._id);
        setMessages(JSON.parse(chat));
    }

    function set_chat_from_external(prop) {
        const user_chat = chats.find((chat) => chat.user_to_talk.user === prop.user);
        if (user_chat) {
            const {user_to_talk, chat} = user_chat;
            localStorage.setItem("selected_user", user_to_talk.user);
            setReceiver(user_to_talk.user);
            setSender(user.user);
            setUserToTalk(user_to_talk._id);
            setMessages(JSON.parse(chat));
        }else {
            const new_user_message = {
                _id: prop._id,
                user_to_talk: {
                    user: prop.user,
                    profile_pic: prop.profile_pic,
                    seen: 0,
                },
                chat: [],
            }
            const old_chats = [...chats];
            old_chats.push(new_user_message);
            localStorage.setItem("selected_user", prop.user);
            setReceiver(prop.user);
            setSender(user.user);
            setUserToTalk(prop._id);
            setChats(old_chats);
            setCloneChats(old_chats);
            setShowTextArea(false);
        }
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
                chats.unshift(chats.splice(chat_index, 1)[0]);
                setChats(chats);
                setReceiver(user_to_talk.user);
                setSender(user.user);
                setUserToTalk(user_to_talk._id);
                setMessages(JSON.parse(chat));
            }
        }).catch(error => {
            push({pathname: "/404", state: {error: error}});
        })
    }

    function search_chat(search) {
        if (search === "") {
            const clone_chat = [...clone_chats];
            setChats(clone_chat);
            setShowChat(false);
        }else {
            const clone_chat = [...chats];
            const search_chat = clone_chat.filter((chat) => {
                if (chat.user_to_talk.user.toUpperCase().includes(search.toUpperCase())) {
                    return chat;
                }
            });
            setChats(search_chat);
            setShowChat(true);
        }
    }   
}

export default Chat;