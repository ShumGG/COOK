import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {Notification} from "../../notifications/OneSignal";

function Users(props) {

    const { push } = useHistory();

    const [user, setUser] = useState("");

    const OneSignal = window.OneSignal || [];

    useEffect(() => {
        verify_session();
    }, [])

    return (
        <div>
            <h1>Welcome to users {user.name} {user.user}</h1>
            <button onClick = {logout} type = "button">Logout</button>
        </div>
    )

    function verify_session() {
        axios.post("/api/cook/users/verify_session").then((response) => {
            const {user} = response.data;
            (user) 
            ? (setUser(user), init_notifications(user))
            : push({pathname:"/404", state: {error: "Need to login"}});
        }).catch(error => console.log(error)/*push({pathname:"/404", state: {error: "Need to login " + error }})*/);
    }
    
    function delete_user(e) {
        let _id = e.target.value;
        axios.post("api/cook/users/delete_user", 
        {
            id: _id
        }, 
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            (response.status === 200) 
            ? get_users() 
            : push("/login");
        }).catch(error => console.log(error));
    }

    function show_hide_update() {
        (update) ? setUpdate(false) : setUpdate(true);
    }

    function update_user(e) {
        if (update) {
            if (update && user != "") {
                let user = users.filter(function(user){return user._id === e.target.value}).map(function(user) {return {...user}});
                setUser(user);
            }else {
                setUpdate(false);
                setUser("");
            }
        }else {
            setUpdate(true);
            let user = users.filter(function(user){return user._id === e.target.value}).map(function(user) {return {...user}});
            setUser(user);
        }
    }

    function logout() {
        OneSignal.push(() => {
            window.OneSignal.getUserId((id) => {
                console.log(id);
            });
            window.OneSignal.setSubscription(false);
        });
        /*axios.post("api/cook/login/logout").then((response) => {
            (response.data === 200) 
            ? push({pathname: "/login"})
            : push({pathname: "/404", state: {error: "Couldn't logout"}});
        }).catch(error => alert(error));*/
    }

    function post_recipe(e) {
        e.preventDefault();
        axios.post("api/cook/users/post_recipe", 
        {
            title: recipe_title, 
            content: recipe, 
            author: user.user, 
        }, 
        {
            method: "POST", 
            headers: {
                "Accept": "application/json", 
                "Content-Type": "application/json"
            }
        }).then((response) => {
            (response.data === 200) 
            ? push("/") 
            : alert(response.data);
        });
    }
}

export default Users;