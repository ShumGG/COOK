const io = require("socket.io-client");
const Socket = io("http://localhost:3000");

exports.Socket = Socket;