import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import Users_profiles from "./Users_profiles";
import Recipe from "./childs_components/Recipe";
import Chat from "./Chat";

function Users_Route() {

    const {path} = useRouteMatch();

    return (
        <Switch>
            <Route exact path = {`${path}/profile/message`} component = {Chat}></Route>
            <Route exact path = {`${path}/profile/:post_author/:post_title`} component = {Recipe}></Route>
            <Route exact path = {`${path}/profile/:user_to_search?`} component = {Users_profiles}></Route>
        </Switch>
    )
}

export default Users_Route;

