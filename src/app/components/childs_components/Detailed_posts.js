import React, { useEffect } from "react";
import { Link, useHistory} from "react-router-dom";

function Detailed_posts(props) {
    
    const {push} = useHistory();

    return (
        <>
            <div style = {{justifyContent: "center", overflowX: "hidden", display: "flex", flexDirection: "column",
                width: "100vw", maxWidth: "100%", height: "auto", paddingTop: "15vh"}}>
                {
                    props.user_posts.map((post, index, {length}) => {
                        return (
                            (index + 1 === length) 
                            ?   <Link to = {{pathname: `/users/profile/${post.author.user}/${post.title}`, state: {view: 1, post_id: post._id}}} style = {{textDecoration: "none", 
                                color: "black", display: "flex", flexDirection: "row", backgroundColor: "burlywood", margin: "10px", marginBottom: "15vh"}}>
                                    <div>
                                        <p>{post.title}</p>
                                        <p>{post.content}</p>
                                    </div>
                                </Link>
                            :   
                                <Link to = {{pathname: `/users/profile/${post.author.user}/${post.title}`, state: {view: 1, post_id: post._id}}} style = {{textDecoration: "none", 
                                color: "black", display: "flex", flexDirection: "row", backgroundColor: "burlywood", margin: "10px"}}>
                                    <div>
                                        <p>{post.title}</p>
                                        <p>{post.content}</p>
                                    </div>
                                </Link>
                            )
                        })
                    }
            </div>
        </>
    )
}

export default Detailed_posts;