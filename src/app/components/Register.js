import axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Register_ from "../components/CSS/Register.css";
import NotificationBar from "../components/NotificationBar";
import io from "socket.io-client";

function Register() {
    
    const {push} = useHistory();
    
    const Socket = io("http://localhost:3000");

    const [email, setEmail] = useState("");
    const [email_exist, setEmailExist] = useState("");
    const [name, setName] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [repeat_password, setRepeatPassword] = useState("");
    const [user_exist, setUserExist] = useState("");
    const [same_password, setSamePassword] = useState("");
    const [icon, setIcon] = useState("");
    const [color, setColor] = useState("");

    return (
        <>
           <NotificationBar></NotificationBar>
            <div className = "_body">
                <div className = "register_wrapper">
                   <form onSubmit = {register_user} method = "POST">
                        <div className = "container_register">
                            <div className = "inputs_labels">
                                <label for = "email" name = "email">Email
                                    <span class="material-icons">
                                        email
                                    </span>
                                    :
                                </label>
                                <input 
                                    id = "email" 
                                    type = "email" 
                                    name = "email" 
                                    onChange = {text => setEmail(text.target.value)}
                                    onBlur = {() => search_email()}
                                />
                                {
                                    (email_exist != "")
                                    ? 
                                    <div className = "rotate">
                                        <p style = {{color: `${color}`}}>{`${email_exist}`}</p>
                                        <span class="material-icons">
                                            {`${icon}`}
                                        </span>
                                    </div>
                                    :
                                    null    
                                }
                            </div>
                            <div className = "inputs_labels">
                                <label for = "name" name = "name">Name
                                <span class="material-icons">
                                    face
                                </span>
                                    : 
                                </label>
                                <input 
                                    id = "name" 
                                    type = "text" 
                                    name = "name"
                                    onChange = {text => setName(text.target.value)}
                                />
                            </div>
                            <div className = "inputs_labels">
                                <label for = "user" name = "user">Username
                                <span class="material-icons">
                                    account_circle
                                </span>
                                : 
                                </label>
                                <input 
                                    id = "user" 
                                    type = "text" 
                                    name = "user" 
                                    onChange = {text => setUser(text.target.value)} 
                                    onBlur = {() => search_user()}
                                />
                                {
                                    (user_exist != "")
                                    ?
                                    <div className = "rotate">
                                        <p style = {{color: `${color}`}}>{`${user_exist}`}</p>
                                        <span class = "material-icons">
                                            {`${icon}`}
                                        </span>
                                    </div>
                                    :
                                    null    
                                }
                            </div>
                            <div className = "inputs_labels">
                                <label for = "password" name = "password">Password
                                <span class="material-icons">
                                    lock
                                    </span>
                                    : 
                                </label>
                                <input 
                                    id = "password" 
                                    type = "password" 
                                    name = "password" 
                                    onChange = {text => setPassword(text.target.value)}
                                />
                            </div>
                            <div className = "inputs_labels">
                                <label for = "repeat_password" name = "repeat_password">Repeat password
                                <span class="material-icons">
                                    lock
                                    </span>
                                    : 
                                </label>
                                <input 
                                    id = "repeat_password" 
                                    type = "password" 
                                    name = "repeat_password" 
                                    onChange = {text => setRepeatPassword(text.target.value)}
                                />
                            </div>
                            {
                                (same_password != "")
                                ?
                                <div className = "rotate">
                                    <p style = {{color: `${color}`}}>{`${same_password}`}</p>
                                    <span class = "material-icons">
                                        {`${icon}`}
                                    </span>
                                </div>
                                :
                                null    
                            }
                            <input type = "submit" value = "Register"/>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )

    async function register_user (e) {
        e.preventDefault();
        const result = await verify_password();
        if (result > 0) {
            setTimeout(() => {
                axios.post("/api/cook/users/register", 
                {
                    email: email, 
                    name: name,
                    user: user, 
                    user_password: password,
                }, 
                {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                }).then((response) => {
                    Socket.emit("logged", response.data);
                    push("/users/profile");
                }).catch(error => {
                    let error_ = error.toString();
                    if (error_.includes("400")) {
                        setTimeout(() => {
                            setSamePassword("Please insert data.");
                            setColor("red");
                        }, 500);
                    }else if (error_.includes("409")) {
                        setTimeout(() => {
                            setSamePassword("Email or username already taken.");
                            setColor("red");
                        }, 500);
                    }else{
                        push({pathname: "/404", state: {error: error}});
                    }
                })
            }, 500);
        }else {
            return;
        }
    }

    async function search_email() {
        if (email === "") {
            setEmailExist("Insert email.");
            setColor("red");
        }else {
            setUserExist("");
            setEmailExist("Cheking if email is allowed.");
            setColor("black");
            setIcon("autorenew");
            const response = await search();
            if (response.data.length > 0) {
                setTimeout(() => {
                    setEmailExist("Email already taken.");
                    setIcon("");
                    setColor("red");
                }, 2000);
            }else {
                setTimeout(() => {
                    setEmailExist("Email allowed.");
                    setIcon("");
                    setColor("green");
                }, 2000);
            }
        }
    }

    async function search_user() {
        if (user === "") {
            setEmailExist("");
            setUserExist("Insert username.");
            setColor("red");
        }else {
            setEmailExist("");
            setUserExist("Cheking if user is allowed.");
            setColor("black");
            setIcon("autorenew");
            const response = await search();
            if (response.data.length > 0) {
                setTimeout(() => {
                    setUserExist("Username already taken.");
                    setIcon("");
                    setColor("red");
                }, 2000);
            }else {
                setTimeout(() => {
                    setUserExist("Username allowed.");
                    setIcon("");
                    setColor("green");
                }, 2000);
            }
        }
    }

    async function verify_password() {
        setUserExist("");
        setSamePassword("Checking if passwords are the same.");
        setIcon("autorenew");
        setColor("black");
        if (password === repeat_password) {
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    setSamePassword("Passwords are the same.");
                    setIcon("");
                    setColor("green");
                    resolve(1);
                }, 2000);
            });
            return promise;
        }else {
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    setSamePassword("Passwords aren't the same.");
                    setIcon("");
                    setColor("red");
                    resolve(0);
                }, 2000);
            });
            return promise;
        }
    }   

    async function search() {
        return axios.post("/api/cook/users/search_user", 
        {
            email: email,
            user: user
        }, 
        {
            method: "POST", 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }
}

export default Register;