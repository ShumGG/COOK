import axios from "axios";
import React, {useEffect, useRef, useState} from "react";
import { useHistory } from "react-router-dom";
import NotificationBar from "../components/NotificationBar";
import Posts from "../components/CSS/Posts.css";
import Posts_recipe from "../components/CSS/Posts_recipe.css";

function Post_Recipe() {
    
    const {push} = useHistory();
    
    const ref = useRef(null);

    const [user, setUser] = useState("");
    const [recipe_title, setRecipe_Title] = useState("");
    const [recipe, setRecipe] = useState("");
    const [tags, setTags] = useState([]);
    const [new_tag, setNewTag] = useState("");
    const [recipe_images, setRecipeImages] = useState();
    const [url, setUrl] = useState([]);
    const [post_images, setPostImages] = useState([]);

    useEffect(() => {
        verify_session();
    }, []);

    return (  
        <div className = "background">
            <NotificationBar></NotificationBar>
            <div className = "wrapper">
                <form onSubmit = {post_recipe} encType = "multipart/form-data">
                    <div>
                        <textarea 
                            maxLength = {200} 
                            onChange = {handle_recipe_title} 
                            rows = "2" 
                            cols = "100" 
                            name = "recipe_title" 
                            placeholder = "Title" 
                            className = "textarea_">
                        </textarea>
                    </div>
                    <div>
                        <textarea 
                        value = {recipe} 
                        onChange = {text => write_recipe(text)} 
                        rows = "25" 
                        cols = "100" 
                        name = "recipe" 
                        placeholder = "Body"
                        className = "textarea_"
                        >
                    </textarea>
                    </div>
                    <label for = "files" className = "file_button">
                        Upload photo
                        <span className = "material-icons" style = {{float: "left", color: "gray"}}>attach_file</span>
                    </label>
                    <input 
                        id = "files" 
                        multiple = {true} 
                        onChange = {() => upload_images()} 
                        key = {recipe_images} 
                        type = "file" 
                        name = "recipe_images" 
                        style = {{color: "transparent", visibility: "hidden"}}
                        accept = "image/*" 
                        ref = {(ref) => setRecipeImages(ref)}
                    ></input>
                    <div className = {`${(recipe != "") ? "preview_body" : null}`}>
                        {   
                        recipe.split("\n").map((text, index) => (
                            <div key = {index} >
                                {
                                    (text.includes("blob:http://localhost:3000/"))
                                    ? <p>{text.replace(text, "")}</p> 
                                    : (text.includes("")) 
                                    ? <p>{text}</p> 
                                    : null 
                                }
                                {   
                                    url.map((images) => {
                                        return (
                                            <>
                                            {
                                                (text.includes(images))
                                                ? 
                                                <>
                                                    <div className = "post_image">
                                                        <img key = {images} src = {images} className = "recipe_images"></img>
                                                    </div>
                                                </>
                                                : 
                                                (text.includes(""))
                                                ? 
                                                null
                                                :
                                                <>
                                                    <div className = "post_image">
                                                        <img key = {images} src = {images} className = "recipe_images"></img>
                                                    </div>
                                                </>
                                            }
                                            </>
                                        )
                                    })
                                }
                            </div>
                            ))
                        }
                    </div>
                    <div className = "tags_wrapper">
                        <div className = "tags_container" onClick = {() => ref.current.focus()}>
                            {
                                (tags.length <= 0)
                                ? 
                                <p>Tags</p>
                                :
                                tags.map((tags, index) => {
                                    return (
                                        <>
                                            <div className = "tag_background">
                                                <button type = "button" onClick = {() => delete_tag(index)}>X</button>
                                                <p>{tags}</p>
                                            </div>
                                        </>
                                    )
                                })
                            }
                            <input style = {{outline: "none", height: "3vh", alignSelf: "center", borderWidth: "0px"}} type = "text" onKeyDown = {tag => add_tag(tag)} onChange = {tag => setNewTag(tag.target.value)} ref = {ref} value = {new_tag} ></input>
                        </div>
                    </div>
                    <button 
                        type = "submit" 
                        className = "btn btn-outline-primary, btn btn-primary btn-lg, post_button">
                        Post recipe
                    </button>
                </form>
            </div>
        </div>
    ) 

    function handle_recipe_title(e) {
        setRecipe_Title(e.target.value);
    }

    function verify_session() {
        axios.post("/api/cook/users/verify_session").then((response) => {
            if (!response.data) {
                return;
            }else {
                const user = response.data;
                setUser(user);
            }
        });
    }

    function write_recipe(text) {
        if (text.code === 13) {
            setRecipe((recipe) => `${recipe}\n`);
        }else {
            setRecipe(text.target.value);
        }
    }

    function upload_images() {
        const image_url = URL.createObjectURL(recipe_images.files[0]);
        const image = recipe_images.files[0];
        let recipe_text = recipe + `${"\n"}${image_url}`;
        setUrl([...url, image_url]);
        setPostImages([...post_images, image]);
        setRecipe(recipe_text);
    }

    function post_recipe(e) {
        e.preventDefault();
        if (user && ref.current != document.activeElement) { 
            let i = 0;
            const images = [];
            const data = new FormData();
            for (let i = 0 ; i < post_images.length ; i++) {
                data.append("images", post_images[i]);
            }
            recipe.split("\n").map((content, index) => {
                if (content.includes("blob:http://localhost:3000/")) {
                    images.push({img: post_images[i].name, position: index});
                    i++;
                }else {
                    return;
                }
            })
            data.append("post", JSON.stringify({
                title: recipe_title, 
                content: recipe, 
                author: user._id, 
                post_date: new Date().toLocaleString(),
                tags: tags, 
                images: images,
            }));
            axios({
                method: 'POST',
                url: '/api/cook/post/post_recipe',
                data: data,
                config: { headers: { 'Content-Type': 'multipart/form-data' } }
            }).then((response) => {
                (response.status === 200)
                ? push("/")
                : alert("Cant post");
            }).catch(error => push({pathname: "/404", state: {error: error}}));
        }else {
            if (ref.current === document.activeElement) {
                return;
            }else {
                push("/login");
            }
        }
    }

    function add_tag(tag_event) { 
        if (tag_event.code === "Space") {
            const res = /^[a-zA-Z]+$/.test(new_tag.trim());
            if (res) {
                setTags(tags => [...tags, new_tag]);
                setNewTag("");
            }else {
                return;
            }
        }else if (tag_event.code === "Backspace") {
            if (new_tag === "") {
                const array_tags = [...tags];
                array_tags.pop();
                setTags(array_tags);
            }else {
                return;
            }
        }else {
            return;
        }
    }

    function delete_tag(index) {
        const array_tags = [...tags];
        array_tags.splice(index, 1);
        setTags(array_tags);
    }
}

export default Post_Recipe;