//////////////////////////////////////////////////////////////////
// import libraries (not made by me)
//////////////////////////////////////////////////////////////////
import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

// Extend the Socket interface to include userId
declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}

//////////////////////////////////////////////////////////////////
// imported modules (not libraries)
//////////////////////////////////////////////////////////////////
import { GameFactory } from "./src/classes/GameFactory.ts";
import { GameManager } from "./src/classes/GameManager.ts";
import { BaseGame } from "./src/classes/games/BaseGame.ts";
import { UserData } from "./src/types/types.ts";
import { generateUniqueId } from "./src/utils/auth.ts";

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

const userStore: Map<string, UserData> = new Map(); // userId : {name, lastRoom} userId comes from localstorage

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
  console.log("socket.handshake.auth:", socket.handshake.auth);

  const userId = socket.handshake.auth.userId || generateUniqueId();
  const userData = userStore.get(userId) || { nickname: "Guest" };
  socket.userId = userId;
  userStore.set(userId, userData);
  console.log(`///////////// ${userId}`);
  if (userData.lastRoom) {
    socket.join(userData.lastRoom);
  }

  socket.on(
    "game:create",
    ({ roomId, gameType }: { roomId: string; gameType: string }) => {
      const game: BaseGame | undefined = GameFactory.createGame(
        gameType,
        roomId,
        io
      );
      gameManager.addGame(roomId, game);
      game.onPlayerJoin(socket, true);
    }
  );

  socket.on("game:join", ({ roomId }: { roomId: string }) => {
    const game: BaseGame | undefined = gameManager.getGame(roomId);
    if (game) {
      game.onPlayerJoin(socket, false);
    } else {
      console.log(`Game with room id "${roomId}" does not exist`);
    }
  });

  socket.on("game:checkRoles", ({ roomId }: { roomId: string }) => {
    const game: BaseGame | undefined = gameManager.getGame(roomId);
    game?.getPlayers();
  });

  socket.on("game:expandSize", ({ roomId, setting, size }) => {
    const game: BaseGame | undefined = gameManager.getGame(roomId);
    try {
      game?.modifyGameSetting(socket, setting, size);
      console.log(`Game room capacity expanded to: ${size}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log("An unknown error occurred");
      }
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
