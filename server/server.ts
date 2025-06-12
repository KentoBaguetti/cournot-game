//////////////////////////////////////////////////////////////////
// import libraries (not made by me)
//////////////////////////////////////////////////////////////////
import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

//////////////////////////////////////////////////////////////////
// imported modules (not libraries)
//////////////////////////////////////////////////////////////////
import { GameFactory } from "./src/classes/GameFactory.ts";
import { GameManager } from "./src/classes/GameManager.ts";
import { BaseGame } from "./src/classes/games/BaseGame.ts";

//////////////////////////////////////////////////////////////////
// server vars
//////////////////////////////////////////////////////////////////

const app: Express = express();
const PORT: number = 3001;
const server = createServer(app); // low level access server to allow for websocket connections
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:5173", // frontend port (vite)
    methods: ["GET", "POST"],
  },
});

//////////////////////////////////////////////////////////////////
// Game Vars
//////////////////////////////////////////////////////////////////
const gameManager = new GameManager();

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
io.on("connection", (socket: Socket) => {
  console.log(`Socket ID "${socket.id}" connected`);

  socket.on(
    "game:create",
    ({ roomId, gameType }: { roomId: string; gameType: string }) => {
      const game: BaseGame | undefined = GameFactory.createGame(
        gameType,
        roomId,
        io
      );
      gameManager.addGame(roomId, game);
    }
  );

  socket.on("game:join", ({ roomId }: { roomId: string }) => {
    const game: BaseGame | undefined = gameManager.getGame(roomId);
    if (game) {
      game.onPlayerJoin(socket);
    }
  });

  socket.on("client-message", (msg) => {
    io.emit("server-response", msg);
  });

  socket.on("disconnect", () => {
    gameManager.games.forEach((game) => {
      game.onPlayerDisconnect(socket);
    });
    console.log(`Socket "${socket.id}" disconnected`);
  });
});
