import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
//////////////////////////////////////////////////////////////////
// server vars
//////////////////////////////////////////////////////////////////
const app = express();
const PORT = 3001;
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: "http://localhost:5173", // frontend port
        methods: ["GET", "POST"],
    },
});
///////////////////////////////////////////////////////////////////
// express routes
//////////////////////////////////////////////////////////////////
server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
app.get("/", (req, res) => {
    res.json({ message: "Root working" });
    console.log("Root hit");
});
//////////////////////////////////////////////////////////////////
// socket.io routes
//////////////////////////////////////////////////////////////////
io.on("connection", (socket) => {
    console.log(`Socket ID "${socket.id}" connected`);
});
