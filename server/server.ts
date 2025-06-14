//////////////////////////////////////////////////////////////////
// import libraries (not made by me)
//////////////////////////////////////////////////////////////////
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Express, Request, Response, RequestHandler } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

// Extend the Socket interface to include userId
declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}

//////////////////////////////////////////////////////////////////
// imported modules (not libraries)
//////////////////////////////////////////////////////////////////
import { GameFactory } from "./src/classes/GameFactory";
import { GameManager } from "./src/classes/GameManager";
import { BaseGame } from "./src/classes/games/BaseGame";
import { UserData, RoomData } from "./src/types/types";
import {
  generateJwtToken,
  verifyJwtToken,
  setTokenCookie,
  clearTokenCookie,
  UserTokenData,
} from "./src/utils/auth";
import { SocketManager } from "./src/classes/SocketManager";

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
app.use(cookieParser()); // Add cookie parser middleware
const PORT: number = 3001;
const server = createServer(app); // low level access server to allow for websocket connections
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:5173", // frontend port (vite)
    methods: ["GET", "POST"],
    credentials: true, // Important for cookies
  },
});

//////////////////////////////////////////////////////////////////
// Game Vars
//////////////////////////////////////////////////////////////////
const gameManager = new GameManager();
const socketManager = new SocketManager(io, gameManager);

// Keep these maps for backward compatibility during transition
const roomStore: Map<string, RoomData> = new Map(); // rooms : set of all players || roomId : {set of players}

///////////////////////////////////////////////////////////////////
// express routes
//////////////////////////////////////////////////////////////////
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Root working" });
  console.log("Root hit");
});

// Update the token endpoint to use HTTP-only cookies
app.post("/auth/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Generate a unique user ID if this is a new user
  const userId = uuidv4();

  // Create user data for the token
  const userData: UserTokenData = {
    userId,
    username,
  };

  // Set the token as an HTTP-only cookie
  const token = setTokenCookie(res, userData);

  // Return user info (but not the token directly)
  res.json({
    success: true,
    user: {
      userId,
      username,
    },
  });
});

// Add a logout endpoint
app.post("/auth/logout", (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true });
});

// Add an endpoint to check authentication status
app.get("/auth/me", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const userData = verifyJwtToken(token);

  if (!userData) {
    clearTokenCookie(res);
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      userId: userData.userId,
      username: userData.username,
    },
  });
});

//////////////////////////////////////////////////////////////////
// socket.io routes
//////////////////////////////////////////////////////////////////
io.on("connection", (socket: Socket) => {
  // Handle socket connection using the SocketManager
  socketManager.handleConnection(socket);

  socket.on(
    "game:create",
    ({ roomId, gameType }: { roomId: string; gameType: string }) => {
      const userId = socket.userId;
      if (!userId) {
        console.error("No userId found for socket");
        return;
      }

      const userData = socketManager.getUserData(userId);
      if (!userData) {
        console.error("No user data found for userId", userId);
        return;
      }

      const username = userData.nickname;

      const game: BaseGame | undefined = GameFactory.createGame(
        gameType,
        roomId,
        io
      );

      // Set the SocketManager on the game
      game.setSocketManager(socketManager);

      roomStore.set(roomId, { gameType: gameType, players: new Set<string>() });
      gameManager.addGame(roomId, game);

      // Join as host
      game.onPlayerJoin(socket, userId, username, true);

      // Update room data
      const room = roomStore.get(roomId);
      room?.players.add(userId);

      // Update user's last room
      socketManager.updateUserRoom(userId, roomId);

      console.log(
        `Game created: ${gameType}, Room: ${roomId}, Host: ${username}`
      );
    }
  );

  socket.on("game:join", ({ roomId }: { roomId: string }) => {
    const userId = socket.userId;
    if (!userId) {
      console.error("No userId found for socket");
      return;
    }

    const userData = socketManager.getUserData(userId);
    if (!userData) {
      console.error("No user data found for userId", userId);
      return;
    }

    const username = userData.nickname;

    const game: BaseGame | undefined = gameManager.getGame(roomId);
    if (game) {
      // Set the SocketManager on the game if not already set
      if (!game.socketManager) {
        game.setSocketManager(socketManager);
      }

      // Check if player is already in the game (might be reconnecting)
      if (game.players.has(userId)) {
        game.onPlayerReconnect(socket, userId, username);
      } else {
        game.onPlayerJoin(socket, userId, username, false);
      }

      // Update room data
      const room = roomStore.get(roomId);
      room?.players.add(userId);

      // Update user's last room
      socketManager.updateUserRoom(userId, roomId);

      console.log(`User ${username} joined game in room ${roomId}`);
    } else {
      console.log(`Game with room id "${roomId}" does not exist`);
      socket.emit("game:error", { message: "Game room does not exist" });
    }
  });

  socket.on("game:leave", ({ roomId }: { roomId: string }) => {
    const userId = socket.userId;
    if (!userId) {
      console.error("No userId found for socket");
      return;
    }

    const userData = socketManager.getUserData(userId);
    if (!userData) {
      console.error("No user data found for userId", userId);
      return;
    }

    const game: BaseGame | undefined = gameManager.getGame(roomId);
    if (game) {
      game.onPlayerDisconnect(socket, userId);

      // Update room data
      const room = roomStore.get(roomId);
      room?.players.delete(userId);

      console.log(`User ${userData.nickname} left game in room ${roomId}`);
    } else {
      console.log(`Game with room id "${roomId}" does not exist`);
    }
  });

  socket.on("game:checkRoles", () => {
    console.log("game:checkroles is being hit");
    const userId = socket.userId;
    if (!userId) {
      console.error("No userId found for socket");
      return;
    }

    const userData = socketManager.getUserData(userId);
    if (!userData) {
      console.error("No user data found for userId", userId);
      return;
    }

    const currentUserRoom = userData.lastRoom;

    if (currentUserRoom) {
      const game: BaseGame | undefined = gameManager.getGame(currentUserRoom);
      game?.getPlayers();
    } else {
      console.error("User is not in any room");
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
    // Handle socket disconnection using the SocketManager
    socketManager.handleDisconnection(socket);
  });
});
