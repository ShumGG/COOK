import React from "react";
import {Link} from "react-router-dom";

function Link_to ({children, user}) {
    
    const Link_component = (user) 
    ? <Link to = "/login"> {children} </Link>
    : <> {children} </>

    return Link_component;
}

export default Link_to;