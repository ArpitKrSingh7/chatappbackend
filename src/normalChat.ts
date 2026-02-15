import { WebSocketServer, WebSocket } from "ws";

const sockets: WebSocket[] = []; // Normal Broadcasted Chat Application!!! Code !!
const wss = new WebSocketServer({ port: 5000 });

wss.on("connection", (socket) => {
  sockets.push(socket);
  const data = JSON.stringify({
    type: "welcome",
    value: sockets.length,
  });
  socket.send(data);

  socket.on("message", (message) => {
    setTimeout(() => {
      for (const client of sockets) client.send(message.toString());
    }, 1000);
  });

  socket.on("close", () => {
    const index = sockets.indexOf(socket);
    if (index !== -1) sockets.splice(index, 1);
    const data = JSON.stringify({
      type: "bye",
      value: sockets.length,
    });
    setTimeout(() => {
      for (const client of sockets) client.send(data);
    }, 1000);
    console.log("Client Disconnected");
  });
});
