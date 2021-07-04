import axios from "axios";
import io from "socket.io-client";

export function send_notification (notification) {
    const message = {
        app_id: "7dc81726-659a-47c4-bfdb-ebca6fbdd879",
        contents: {"en": notification.message},
        filters: [
            {"field": "tag", "key": "username", "value": notification.value}, 
        ]
    }
    return axios.post("/api/cook/users/send_notifications",{
        message: message,
        user_id: notification.user_id, //the id of the user who will receive the notification (receiver)
        notification: {
            user: notification.user, //the id of the user who creates the notification (sender)
            notification: message.contents.en,
            date: new Date().toLocaleString(),
            type: notification.type,
        },
        number_notifications: notification.number_notifications,
    }, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });
}  

export function socket_io(data) {
    const Socket = io("http://localhost:3000"); //send notification
    const {user} = data.data;
    Socket.emit("notify", user);
}
