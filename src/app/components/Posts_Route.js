import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import Latest_Posts from "./Latest_posts";
import Post_Recipe from "./Post_Recipe";
import Recipe_post from "./Recipe_post";

function Posts_Route() {

    const {path} = useRouteMatch();
  
    return (
        <Switch>
            <Route exact path = {path} component = {Latest_Posts}></Route> 
            <Route path = {`${path}/post_recipe`} component = {Post_Recipe}></Route> {/*route used to create the recipe*/}  
            <Route path = {`${path}/recipe/:post_author?/:post_title?`} component = {Recipe_post}></Route> {/*route used to see the recipe*/}
        </Switch> 
    )
}

export default Posts_Route;
 