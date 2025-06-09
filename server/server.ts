import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const app: Express = express();
const PORT: number = 3001;
const server = createServer(app); // get the underlying server for socketIO -- to get low level access
const io = new Server(server); // create the socket.oi server wihth the low-level access server

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, "../public")))

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Running on port: ${PORT}`);
})

// test socket.io connection
io.on("connection", (socket) => {
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    })
})

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "public/index.html"));
}) 
