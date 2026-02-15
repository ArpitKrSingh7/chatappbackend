import { ScriptKind } from "typescript";
import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 5000 });
const rooms = new Map(); // Data structure to store the rooms + Users
wss.on("connection", (socket) => {
    setTimeout(() => {
        socket.send("Connection Successful");
    }, 1000);
    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "join") {
                const roomId = data.payload.roomId;
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, []);
                }
                rooms.get(roomId).push(socket);
                const room = rooms.get(roomId);
                if (!room)
                    return;
                const count = room.length;
                for (const user of room) {
                    user.send(JSON.stringify({
                        type: "update_users",
                        count: count,
                    }));
                }
                socket.send("Successfully Joined room " + roomId);
            }
            if (data.type === "chat") {
                const { roomId, chat, name } = data.payload; // Extract name
                const room = rooms.get(roomId);
                if (!room) {
                    socket.send("You need to Join a room first before sending any message");
                    return;
                }
                const isUser = room.includes(socket);
                if (isUser) {
                    for (const user of room) {
                        user.send(JSON.stringify({
                            sender: socket === user ? "me" : "them",
                            name: name, // Send the name back to others
                            text: chat,
                        }));
                    }
                }
                else {
                    socket.send("Unauthorized access");
                }
            }
        }
        catch {
            socket.send("Some Error occurred");
        }
    });
    socket.on("close", () => {
        for (const [roomId, users] of rooms) {
            const updatedUsers = users.filter((user) => user !== socket);
            if (updatedUsers.length === 0)
                rooms.delete(roomId);
            else {
                rooms.set(roomId, updatedUsers);
                for (const user of updatedUsers) {
                    user.send(JSON.stringify({
                        type: "update_users",
                        count: updatedUsers.length,
                    }));
                }
            }
        }
        console.log("Client disconnected and cleaned up");
    });
});
//# sourceMappingURL=index.js.map