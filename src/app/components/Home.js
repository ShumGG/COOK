import React, { useRef } from "react";
import {Link} from "react-router-dom";
import Latest_Posts from "./Latest_posts";
import NotificationBar from "../components/NotificationBar";
import Posts from "../components/CSS/Posts.css";

function Home() {

    return ( 
        <>
        <div className = "background">
            <NotificationBar></NotificationBar>
            <div className = "w-50" style = {{minWidth: "25%", height: "100vh", margin: "auto"}}>
                <Latest_Posts></Latest_Posts>
            </div>
        </div>
        </>
    )
}

export default Home;