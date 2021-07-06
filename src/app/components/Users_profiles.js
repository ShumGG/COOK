import axios from "axios";
import React, { useEffect, useState } from "react";
import {useParams, useLocation} from "react-router-dom";
import Profile from "./childs_components/Profile";
import { useHistory } from "react-router-dom";
import Overview_posts from "./childs_components/Overview_posts";
import Followers_Following from "./childs_components/Followers_Following";
import io from "../../notifications/Socket";
import Profile_ from "../components/CSS/Profile.css";
import NotificationBar from "../components/NotificationBar";

function Users_profiles() {
    
    const {Socket} = io;
    const location = useLocation();

    const {push} = useHistory();
    const {user_to_search} = useParams();

    const [user_info, setUserInfo] = useState();
    const [login_user, setLoginUser] = useState();
    const [users_posts, setUserPost] = useState("");
    const [followers_following, setFollowersFollowing] = useState("");
    const [view, setView] = useState(0);
    const [id, setId] = useState("");

    useEffect(() => {
        (user_to_search)
        ? get_user()
        : verify_session();
    }, []);

    useEffect(() => {
        if (location.state != null) {
            const {view} = location.state;
            setView(view);
        }else {
            return;
        }
    }, [users_posts]);

    return (
        <div className = "profile_background">
            {
                (user_info && users_posts || login_user && users_posts) 
                ?   
                <>
                    <NotificationBar></NotificationBar>
                    <div className = "wrapper">
                        <div className = "row_profile">
                            <div className = "column_profile">
                                <Profile 
                                    id = {id} 
                                    user_info = {user_info} 
                                    login_user = {login_user} 
                                    setView = {set_View.bind(this)} 
                                    validate = {validate.bind(this)}>
                                </Profile> 
                            </div>
                            <div className = "column_profile">
                                {
                                    <>
                                        <div>
                                            <button 
                                                type = "button" 
                                                onClick = {() => set_View(0)}
                                                className = "btn btn-outline-primary, btn btn-primary btn-lg, align-top, overview_post"
                                                >
                                                <span 
                                                    className = "material-icons" 
                                                    style = {{float: "right", color: "black"}}
                                                >
                                                    list_alt
                                                </span>
                                                <p>Overview Posts</p>
                                            </button>
                                        </div>
                                        {
                                            (view === 0)
                                            ? 
                                            <Overview_posts 
                                                user_posts = {users_posts} 
                                                login_user = {login_user} 
                                                get_user_posts = {get_user_posts.bind(this)}>
                                            </Overview_posts>
                                            : 
                                            <Followers_Following 
                                                followers_following = {followers_following}
                                                user_info = {(user_info) ? user_info : login_user} 
                                                login_user = {login_user} 
                                                verify_session = {verify_session.bind(this)}>
                                            </Followers_Following>
                                        }                              
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </>
                :
                null
            }
        </div>
    )
    
    function validate() {
        (user_to_search)
        ? get_user()
        : verify_session();
    }

    function verify_session() {
        axios.post("/api/cook/users/verify_session").then((response) => {
            if (!response.data) {
                push({pathname: "/404", state: {error: "Need to login"}});
            }else {
                const {_id} = response.data;
                (setLoginUser(response.data), get_user_posts(_id), setUserInfo(null), setId(id));
            }
        });
    }

    function get_user() {
        axios.all([
            axios.get("/api/cook/users/get_user", 
            {
                params: {
                    user: user_to_search,
                }
            },
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                }
            }),
            axios.post("/api/cook/users/verify_session"),
        ]).then(axios.spread((response_user, response_session) => {
            if (response_session.data.user) {
                if (response_user.data.user === response_session.data.user.user) {
                    get_user_posts(response_session.data.user._id);
                    setLoginUser(response_session.data.user);
                    setUserInfo(null);
                }else {
                    get_user_posts(response_user.data._id);
                    setLoginUser(response_session.data);
                    setUserInfo(response_user.data);
                }
            }else {
                get_user_posts(response_user.data._id);
                setLoginUser(response_session.data);
                setUserInfo(response_user.data);
            }
        })).catch(error => push({pathname: "/404", state: {error: `${error} User not found`}}));
    }

    function get_user_posts(id) {
        axios.post("/api/cook/post/users_posts",
        {
            author: id,
        },
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        }).then((response) => {
            setUserPost(response.data);
        }).catch(error => push({pathname: "/404", state: {error: error}}));
    }

    function set_View(view, follow) {
        if (follow) {
            setFollowersFollowing(follow);
            setView(view);
        }else {
            setView(view);
        }
    }

}

export default Users_profiles;