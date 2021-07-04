require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const SECRET = require("../salt/salt");
const session = require("express-session")({
    secret: SECRET,
    resave: true, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        maxAge: 8*60*60*1000 //8H
    }
});
const socket_session = require("express-socket.io-session");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const PORT = 3000;
const SocketIO = require("socket.io");
const http = require("http");
let io;
let ids = [];

//static files
app.use(express.static(path.join(__dirname, "../public"))); //used to run index.html in public, it will run react index in app

//server

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log("Server listening in port" + PORT);
});

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(session);

//routes
app.use("/api/cook/index", require("../routes/index"));
app.use("/api/cook/login", require("../routes/Login"));
app.use("/api/cook/users", require("../routes/Users"));
app.use("/api/cook/post", require("../routes/Post"));

app.get("*", function(request, response) {
    response.sendFile(path.join(__dirname, "../public/index.html"));
}); 

io = SocketIO(server);

io.use(socket_session(session));

io.on("connection", socket => {
    if (socket.handshake.session.user) {
        socket.join(socket.handshake.session.user.socket_id);
        socket.on("disconnect", () => {
            if (socket.handshake.session.user) {
                return;
            }else {
                return;
            }
        });
        socket.on("notify", message => {
            const id = ids.filter(user => user.user === message.receiver);
            if (id) {
                socket.broadcast.to(id.id).emit("update_notifications", message);
            }else {
                return;
            }
        });
        socket.on("logout", logout => {
            const id = ids.filter(user => user.user != logout);
            if (id) {
                ids = id;
            }else {
                return;
            }
        });
        socket.on("send_message", message => {
            const id = ids.filter(user => user.user === message.receiver);
            if (id) {
                socket.broadcast.to(id.id).emit("recive_message", message);
            }else {
                return;
            }
        });
        socket.on("typing", message => {
            const id = ids.filter(user => user.user === message.receiver);
            if (id) {
                socket.broadcast.to(id.id).emit("typing_message", message);
            }else {
                return;
            }
        });
        socket.on("stop_typing", message => {
            const id = ids.filter(user => user.user === message.receiver);
            if (id) {
                socket.broadcast.to(id.id).emit("stop_typing", message);
            }else {
                return;
            }
        });
    }else {
        socket.on("logged", logged => {
            if (logged) {
                socket.handshake.session.user = logged;
                socket.handshake.session.save();
                ids.push({user: logged.user, id: socket.id});
            }else {
                return;
            }    
        });
    }
});

app.set("ids", ids);

//connecting to DB
mongoose.connect(
    "mongodb://localhost/Cook", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to DB")).catch(error => console.log(error));
