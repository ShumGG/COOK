import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation} from "react-router-dom";
import io from "socket.io-client";
import NotificationBar from "../components/NotificationBar";
import Login_ from "../components/CSS/Login.css";

function Login() {

    const {push} = useHistory();

    const Socket = io("http://localhost:3000");
    const location = useLocation();    
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState("");
    const [data, setdata] = useState("");

    useEffect(() => {
        //signal();
        //verify_redirect();
    });

    return (
        <div className = "background_">
            <NotificationBar></NotificationBar>
            <div className = "login_wrapper">
                <form onSubmit = {login} method = "POST">
                    <div className = "container_login">
                        <div className = "inputs_labels">
                            <label for = "email" name = "email">Email
                                <span class="material-icons">
                                    email
                                </span>
                                :
                            </label>
                            <input id = "email" type = "email" name = "email" onChange = {text => setEmail(text.target.value)}/>
                        </div>
                        <div className = "inputs_labels">
                            <label for = "password" name = "password">Password
                            <span class="material-icons">
                                lock
                                </span>
                                : 
                            </label>
                            <input id = "password" type = "password" name = "password" onChange = {text => setPassword(text.target.value)}/>
                        </div>
                        <p>Forgot your password?</p>
                        <input type = "submit" value = "Login"/>
                    </div>
                </form>
            </div>
        </div>
    );

    function verify_redirect() {
        if (!location.state) {
            return;
        }else {
            const {redirect} = location.state;
            setRedirect(redirect);
        }
    }

    function login(e) {
        e.preventDefault();
        axios.post("api/cook/login/login_user",
        {
            email: email, //data
            password: password, 
        },
        { 
            method: "POST", //config
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(async (response) => {
            if (response.data === 404) {
                alert("Email doesnt exist");
            }else if (response.data === "Incorrect password") {
                alert("Incorrect Password");
            }else{
                Socket.emit("logged", response.data);
                push({pathname: "/users/profile"});
            }
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

}

export default Login;