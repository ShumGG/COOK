import React from "react";
import { useLocation } from "react-router-dom";

function Not_found() {

    const location = useLocation();

    return (
        <div>
            {(location.state) 
            ? <h2>{location.state.error.toString()}</h2> 
            : <h1>404 NOT FOUND</h1>
            }
            <a href = "/">Go back</a>
        </div>
    )
}

export default Not_found;