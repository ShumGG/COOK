import React, { useEffect, useState } from "react";
import Overview_posts from "./Overview_posts";
import Detailed_posts from "./Detailed_posts";
import { useHistory } from "react-router-dom";

function Users_Posts(props) {
    
    const location = useHistory();

    const {push} = useHistory();
    
    const [view, setView] = useState("");

    useEffect(() => {
        const view = JSON.parse(localStorage.getItem("view"));
        (view) 
        ? setView(view)
        : setView(0);
    }, []);

    return( 
      null
    )

    
}

export default Users_Posts;