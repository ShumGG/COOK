import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Users_Route from "./components/Users_Route";
import Register from "./components/Register";
import Posts_Route from "./components/Posts_Route";
import Not_found from "./components/Not_found";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import axios from "axios";

function Index() {
    return (
        <Router>
            <Switch>
                <Route exact path = "/" component = {Home}></Route>
                <Route path = "/login" component = {Login}></Route>
                <Route path = "/register" component = {Register}></Route>
                <Route path = "/users" component = {Users_Route}></Route>
                <Route path = "/posts" component = {Posts_Route}></Route>
                <Route component = {Not_found}></Route>
            </Switch>
        </Router>
    )

    function verify_session() {
        /*const [verified, setVerified] = useState(null);
        let view;
        useEffect(() => {
            axios.get("api/cook/login/verify_session").then((response) => {
                if (response.data === 404) {
                    setVerified(false);
                }else {
                    setVerified(true);
                }
            });
        }, [])
        view = (verified) ? <Users></Users> : <Redirect to = "/login"></Redirect>
        return view;*/
        const [verified, setVerified] = React.useState(null);

    React.useEffect(() => {
        axios.get("api/cook/login/verify_session").then((response) => {
            if (response.data === 404) {
                setVerified(false);
            }else {
                setVerified(true);
            }
        });
    }, []);

    return (
        <>
        {verified === null ? (
            <div>Verifying...</div>
        ) : verified ? (
            <Users></Users>
        ) : (
            <Redirect to = "/login"></Redirect>
        )}
        </>
    );
    }
}

render(<Index/>, document.getElementById("app"));