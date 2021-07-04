import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function Update_user(props) {
    
    const { push } = useHistory();
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        setId(props.user[0]._id);
        setEmail(props.user[0].email);
        setUser(props.user[0].user);
        setPassword(props.user[0].password);
    }, []);
 
    return (
        <div key = {id}>
            <h1>Update user</h1>
            <form onSubmit = {update_user}>
                <label>Email:</label>
                <input type = "text" value = {email} onChange = {text => setEmail(text.target.value)}></input>
                <label>User:</label>
                <input type = "text" value = {user} onChange = {text => setUser(text.target.value)}></input>
                <label>Password:</label>
                <input maxLength = {"5"} type = "password" value = {password} onChange = {text => setPassword(text.target.value)}></input>
                <input type = "submit" value = "Update"></input>
                <button onClick = {stop_update}>Stop updating</button>
            </form> 
            <button onClick = {show}>data</button>
         </div>
    )

    function show() {
        console.log(email);
    }

    function stop_update() {
        props.show_hide_update();
    }

    function update_user(e) {
  
        e.preventDefault();
  
        axios.post("api/cook/users/update_user",
        {
            id: id,
            email: email, 
            user: user, 
            password: password, 
        }, 
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            (response.data === 200) ? props.get_users() : push("/login");
        })
   }
}

export default Update_user;