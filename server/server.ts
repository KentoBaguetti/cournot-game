//////////////////////////////////////////////////////////////////
// import libraries (not made by me)
//////////////////////////////////////////////////////////////////
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

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
import { UserData, RoomData } from "./src/types/types.ts";
import { generateJwtToken, decodeJwtToken } from "./src/utils/auth.ts";

//////////////////////////////////////////////////////////////////
// server vars
//////////////////////////////////////////////////////////////////

const app: Express = express();
app.use(
  // express cors
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
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

const connections: Map<string, string> = new Map(); // socket.id : userId

const userStore: Map<string, UserData> = new Map(); // userId : {name, lastRoom} userId comes from localstorage

const roomStore: Map<string, RoomData> = new Map(); // rooms : set of all players || roomId : {set of players}

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

app.post("/setToken", (req, res) => {
  const { username } = req.body;

  const token = generateJwtToken(username);

  res.json({ token });
});

//////////////////////////////////////////////////////////////////
// socket.io routes
//////////////////////////////////////////////////////////////////
io.on("connection", (socket: Socket) => {
  console.log(`Socket ID "${socket.id}" connected`);
  console.log("socket.handshake.auth:", socket.handshake.auth); // pritns out the entire auth shii so { token: jwt string }

  // the shit below is to add a user to the user map
  const jwtToken = socket.handshake.auth.token;
  const decodedToken = decodeJwtToken(jwtToken) as {
    username: string;
    lastRoom?: string;
  };
  const { username } = decodedToken;

  userStore.set(username, { nickname: username });
  connections.set(socket.id, username); // on connection set the socket id with the username
  console.log(userStore);

  socket.on(
    "game:create",
    ({ roomId, gameType }: { roomId: string; gameType: string }) => {
      const game: BaseGame | undefined = GameFactory.createGame(
        gameType,
        roomId,
        io
      );
      roomStore.set(roomId, { gameType: gameType, players: new Set<string>() });
      gameManager.addGame(roomId, game);
      game.onPlayerJoin(socket, username, true);
      console.log(roomStore);
    }
  );

  socket.on("game:join", ({ roomId }: { roomId: string }) => {
    const game: BaseGame | undefined = gameManager.getGame(roomId);
    if (game) {
      game.onPlayerJoin(socket, username, false);
      const room = roomStore.get(roomId);
      room?.players.add(username);
      const playerData: UserData | undefined = userStore.get(username);
      if (playerData) {
        playerData.lastRoom = roomId;
      }
      console.log(roomStore);
    } else {
      console.log(`Game with room id "${roomId}" does not exist`);
    }
  });

  socket.on(
    "game:leave",
    ({ socket, roomId }: { socket: Socket; roomId: string }) => {
      const game: BaseGame | undefined = gameManager.getGame(roomId);
      if (game) {
        game.onPlayerDisconnect(socket, username);
        const room = roomStore.get(roomId);
        room?.players.delete(username);
      } else {
        console.log(`Game with room id "${roomId}" does not exist`);
      }
    }
  );

  // socket.on("game:checkRoles", ({ roomId }: { roomId: string }) => {
  //   const game: BaseGame | undefined = gameManager.getGame(roomId);
  //   game?.getPlayers();
  // });

  socket.on("game:checkRoles", () => {
    console.log("game:checkroles is being hit");
    const currentUserData: UserData | undefined = userStore.get(username);
    const currentUserRoom: string | undefined = currentUserData?.lastRoom;

    if (currentUserRoom) {
      const game: BaseGame | undefined = gameManager.getGame(currentUserRoom);
      game?.getPlayers();
    } else {
      console.error("room DNE");
    }
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
    console.log(`########### client response: ${msg}`);
  });

  socket.on("disconnect", () => {
    // players disconnecting is different from their socket disconnecting
    // gameManager.games.forEach((game) => {
    //   game.onPlayerDisconnect(socket, username);
    // });

    // should not remove the user from their game if they disconnect
    // const currentUser = userStore.get(username); // find the user in the db
    // const currentUserPrevRoom: string | undefined = currentUser?.lastRoom; // find the users last joined room
    // const theRoom = roomStore.get(currentUserPrevRoom || ""); // get the game room data
    // theRoom?.players.delete(username); // remove the user from the game\
    console.log(roomStore);

    userStore.delete(username); // remove the user from the map
    connections.delete(socket.id);
    console.log(userStore);
    // const room = roomStore.get(roomId);
    console.log(`Socket "${socket.id}" disconnected`);
  });
});
