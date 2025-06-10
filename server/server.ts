import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server, Socket } from "socket.io";

// database imports
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Extend Socket type to include 'nickname'
declare module "socket.io" {
  interface Socket {
    nickname?: string;
  }
}

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

let lastID: number = 0;

// test socket.io connection
io.on("connection", async (socket) => {
  io.emit("chat message", {
    msg: "has connected!",
    nickname: socket.nickname || "Guest",
  });

  socket.on("chat message", async ({ msg, nickname }) => {
    let result;
    try {
      result = await db.run("INSERT INTO messages (content) VALUES (?)", msg);
    } catch (e) {
      return;
    }
    socket.broadcast.emit(
      "chat message",
      { msg: msg, nickname: socket.nickname || nickname },
      result.lastID
    );
    lastID = result.lastID || 0;
  });

  socket.on("set nickname", (nickname) => {
    socket.nickname = nickname;
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

  socket.on("disconnect", async () => {
    io.emit(
      "chat message",
      {
        msg: "has disconnected",
        nickname: socket.nickname || "Guest",
      },
      lastID
    );
  });
});

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public/index.html"));
});
