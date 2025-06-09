import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

// database imports
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// open database file
const db = await open({
  filename: "chat.db",
  driver: sqlite3.Database,
});

await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);

const app: Express = express();
const PORT: number = 3001;
const server = createServer(app); // get the underlying server for socketIO -- to get low level access
const io = new Server(server, {
  connectionStateRecovery: {}, // store temp events to try and restore state when client reconnects
}); // create the socket.oi server wihth the low-level access server

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, "../public")));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on port: ${PORT}`);
});

// test socket.io connection
io.on("connection", async (socket) => {
  socket.on("chat message", async (msg) => {
    let result;
    try {
      result = await db.run("INSERT INTO messages (content) VALUES (?)", msg);
    } catch (e) {
      return;
    }
    io.emit("chat message", msg, result.lastID);
  });

  if (!socket.recovered) {
    try {
      await db.each(
        "SELECT id, content FROM messages WHERE id > ?",
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit("chat message", row.content, row.id);
        }
      );
    } catch (e) {
      // something went wrong
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public/index.html"));
});
