import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch, useParams } from "react-router-dom";
import Latests_posts from "../components/CSS/Latests_posts.css";
import Mini_Chat from "./Mini_Chat";

function Latest_Posts() {

    const {push} = useHistory();
    const {path} = useRouteMatch();
    const {recipe_to_search} = useParams();

    const [latest_posts, setLatest_Post] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [user, setUser] = useState();
    const [posts, setPosts] = useState("Main Posts");
    
    useEffect(() => {
        verify_session();
    }, []);

    useEffect(() => {
        if (user) {
            setFollowers(user.followers);
            setFollowing(user.following_users);
        }
    }, [user]);

    return ( 
        <>
        <div className = "list-group, w-15, container_buttons">
            <button 
                type = "button" 
                className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, posts_buttons"
                onClick = {() => get_posts()}
                >
                <span className = "material-icons" style = {{float: "left", color: "red"}}>whatshot</span>
                <p className = "like_dislike_p">Main Posts.</p>
            </button>
            {
                (user)
                ?
                <>
                <button 
                    type = "button" 
                    className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, posts_buttons"
                    onClick = {() => followers_posts()}>
                    <span className = "material-icons" style = {{float: "left", color: "black"}}>emoji_people</span>
                    <p className = "like_dislike_p">Followers Posts.</p>
                </button>
                <button 
                    type = "button" 
                    className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, posts_buttons"
                    onClick = {() => following_posts()}>
                    <span className = "material-icons" style = {{float: "left", color: "black"}}>sports_kabaddi</span>
                    <p className = "like_dislike_p">Following Posts.</p>
                </button>
                </>
                : null
            }
          </div>
        <div className = "list-group, w-15, container_post">
        <p style = {{textAlign: "center", fontWeight: "bolder"}}>{posts}</p>
        {
            (latest_posts.length <= 0) ? null : latest_posts.map((post) => {
                return (
                    <div>
                        <div key = {post._id} className = "list-group-item , latest_posts" style = {{borderRadius: "15px 15px 15px 15px", marginBottom: "5px"}}>
                            <div class = "d-flex w-100 justify-content-between">
                                <h5 className = "mb-1, post_title" onClick = {() => click_post(post)}>
                                    {
                                        post.title
                                    }
                                </h5>
                                <small>{(post.post_date) ? `Date: ${post.post_date}` : null}</small>
                            </div>
                            <div className = "like_comment_container">
                                <button type = "button" className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, like_dislike_button">
                                    <span className = "material-icons" style = {{float: "left", color: "black"}}>thumb_up</span>
                                    <p className = "like_dislike_p">{post.likes}</p>
                                </button>
                                <button type = "button" style = {{padding: "5px", marginLeft: "10px"}} className = "btn btn-outline-primary, align-top">
                                    <span className ="material-icons" style = {{float: "left"}}>forum</span>
                                    <p className = "comments_p">{post.comments.length}</p>
                                </button>
                            </div>
                            <small className = "small_author">Posted by: {post.author.user}</small>
                        </div>
                    </div>
                )
            })
        }
        {
            (user)
            ?
            <><Mini_Chat user = {user}></Mini_Chat></>
            :
            null
        }
        </div>
        </>
    )

    function verify_session() {
        axios.post("/api/cook/users/verify_session").then((response) => {
            const user = response.data;
            if (user) {
                setUser(user);
            }
            if (recipe_to_search) {
                get_post_by_url(recipe_to_search);
            }else {
                get_posts();
            } 
        });
    }

    function get_posts() {
        axios.get("api/cook/post/latest_posts").then((response) => { 
            setLatest_Post(response.data);
            setPosts("Main Posts.");
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function get_post_by_url(recipe_to_search) {
        axios.get("/api/cook/post/get_post", 
        {
            params: {
                post_title: recipe_to_search,
            }
        }, 
        {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            setLatest_Post(response.data);
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }


    function followers_posts() {
        const posts = [...latest_posts];
        const followers_posts = posts.filter((post) => {
            return followers.find(follower => {
                return follower.user._id == post.author._id;
            });
        });
        setLatest_Post([...followers_posts]);
        setPosts("Followers Posts.");
    }

    function following_posts() {
        const posts = [...latest_posts];
        const following_posts = posts.filter((post) => {
            return following.find(following => {
                return following.user._id == post.author._id;
            });
        });
        setLatest_Post([...following_posts]);
        setPosts("Following Posts.");
    }
    
    function click_post(post) {
        push({pathname: "/posts/recipe", state: {post: {...post}}});
    }

}

export default Latest_Posts;