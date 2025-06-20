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

//////////////////////////////////////////////////////////////////
// imported modules (not libraries)
//////////////////////////////////////////////////////////////////
import { GameFactory } from "./src/classes/GameFactory";
import { GameManager } from "./src/classes/GameManager";
import { BaseGame } from "./src/classes/games/BaseGame";
import { UserData, RoomData } from "./src/types/types";
import {
  verifyJwtToken,
  setTokenCookie,
  clearTokenCookie,
  UserTokenData,
  isAuthenticated,
  updateTokenRoom,
} from "./src/utils/auth";
import { SocketManager } from "./src/socket/SocketManager";
import { parseRoomId, generateJoinCode } from "./src/utils/utils";

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
app.use(express.json()); // express middleware for jsons
app.use(cookieParser()); // Add cookie parser middleware
const PORT: number = 3001; // TODO: add an env variable
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
  const { username, roomId } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Generate a unique user ID if this is a new user
  const userId = uuidv4();

  // Create user data for the token
  const userData: UserTokenData = {
    userId,
    username,
    roomId,
  };

  // Set the token as an HTTP-only cookie
  const token = setTokenCookie(res, userData);

  // Return user info (but not the token directly)
  res.json({
    success: true,
    user: {
      userId,
      username,
      roomId,
    },
  });
});

// Add a logout endpoint
app.post("/auth/logout", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  const userData = verifyJwtToken(token);

  if (!userData || userData instanceof Error) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  const socketManager = new SocketManager(io, gameManager);
  const socketIds = socketManager.getSocketIds(userData.userId);
  socketIds.forEach((socketId) => {
    io.sockets.sockets.get(socketId)?.disconnect();
  });

  clearTokenCookie(res);
  res.json({ success: true });
});

// Add an endpoint to check authentication status
app.get("/auth/me", isAuthenticated, (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const userData = verifyJwtToken(token);

  if (!userData || userData instanceof Error) {
    clearTokenCookie(res);
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      userId: userData.userId,
      username: userData.username,
      roomId: userData.roomId,
    },
  });
});

// expose the jwt token to the frontend
app.get("/auth/token", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  res.json({ success: true, token });
});

// send the different games to the frontend (just the names for now, those will be used to create the games)
app.get("/game/getGames", isAuthenticated, (req, res) => {
  const games = {
    testgame: ["testGame", "Test Game"],
    jankenpo: ["jankenpo", "JanKenPo"],
  };
  res.json({ games });
});

//////////////////////////////////////////////////////////////////
// socket.io routes + middleware
//////////////////////////////////////////////////////////////////

// authentication middleware for socket.io connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.error("No token provided for socket connection");
    return next(new Error("No token provided for socket connection"));
  }
  const userData = verifyJwtToken(token);

  if (userData instanceof Error || !userData) {
    console.error("Invalid token provided for socket connection");
    return next(
      new Error("Invalid or Expired token provided for socket connection")
    );
  }

  // Extract user information from token
  const { userId, username, roomId: tokenRoomId } = userData;

  // Set basic user information on socket
  socket.userId = userId;
  socket.username = username;

  // Check for room information in this order:
  // 1. Room stored in SocketManager (most up-to-date)
  // 2. Room from token (might be outdated)
  const persistedRoomId = socketManager.getUserRoom(userId);

  if (persistedRoomId) {
    // Use the persisted room ID (most up-to-date)
    socket.roomId = persistedRoomId;
    console.log(`Using persisted roomId for ${username}: ${persistedRoomId}`);
  } else if (tokenRoomId) {
    // Use the room ID from token as fallback
    socket.roomId = tokenRoomId;
    console.log(`Using token roomId for ${username}: ${tokenRoomId}`);

    // Store this room ID for future reconnections
    socketManager.userRooms.set(userId, tokenRoomId);
  } else {
    // No room information available
    socket.roomId = "";
    console.log(`No room information available for ${username}`);
  }

  next();
});

io.on("connection", (socket: Socket) => {
  // Handle socket connection using the SocketManager
  socketManager.handleConnection(socket);

  socket.on("host:createGame", ({ gameType }: { gameType: string }) => {
    const userId = socket.userId;
    if (!userId) {
      console.error("No userId found for socket");
    }

    const userData = socketManager.getUserData(userId);
    if (!userData) {
      console.error("No user data found for userId", userId);
      return;
    }

    const username = userData.nickname;

    // generate the main room id, and this is what will be returned to the client/host
    const mainRoomId = generateJoinCode();

    const game: BaseGame | undefined = GameFactory.createGame(
      gameType,
      mainRoomId,
      io,
      userId
    );

    // apply the server socket manaager to the game
    game.setSocketManager(socketManager);

    roomStore.set(mainRoomId, {
      gameType: gameType,
      players: new Set<string>(),
    });
    gameManager.addGame(mainRoomId, game);

    // join as host
    game.onPlayerJoin(socket, userId, username, true);

    // Update room data
    const room = roomStore.get(mainRoomId);
    room?.players.add(userId);

    // update the users last room (in userData)
    socketManager.updateUserRoom(userId, mainRoomId);
    socket.roomId = mainRoomId;

    // Update the JWT token with room information
    if (socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie
        .split(";")
        .reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      if (cookies.auth_token) {
        // Create a mock request and response to update the token
        const mockReq = {
          cookies: { auth_token: cookies.auth_token },
        } as unknown as Request;
        const mockRes = {
          cookie: (name: string, value: string, options: any) => {
            socket.emit("auth:cookie_update", { name, value, options });
          },
          clearCookie: () => {},
        } as unknown as Response;

        updateTokenRoom(mockReq, mockRes, mainRoomId);
      }
    }

    console.log(
      `Game created: ${gameType}, Room: ${mainRoomId}, Host: ${username}`
    );

    // emit back to the room host the gameRoom id - this way we keep all the logic on the backend, don't want to have the code be generated on the frontend
    socket.emit("game:gameCreated", { roomId: mainRoomId });
    console.log("Emitted back to the host");
  });

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

    const mainRoomId = roomId.length > 6 ? roomId.split("_")[0] : roomId;

    const game: BaseGame | undefined = gameManager.getGame(mainRoomId);
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
      const room = roomStore.get(mainRoomId);
      room?.players.add(userId);

      // Update user's last room (in userData)
      socketManager.updateUserRoom(userId, roomId);

      // update the socket instance # connects to the breakout room immediately if it exists
      socket.roomId = roomId;

      // Update the JWT token with room information
      if (socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie
          .split(";")
          .reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

        if (cookies.auth_token) {
          // Create a mock request and response to update the token
          const mockReq = {
            cookies: { auth_token: cookies.auth_token },
          } as unknown as Request;
          const mockRes = {
            cookie: (name: string, value: string, options: any) => {
              socket.emit("auth:cookie_update", { name, value, options });
            },
            clearCookie: () => {},
          } as unknown as Response;

          updateTokenRoom(mockReq, mockRes, roomId);
        }
      }

      console.log("Main room id", mainRoomId);
      io.to(mainRoomId).emit("server:listUsers", game.getPlayers());

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

      // update the socket instance
      socket.roomId = "";

      console.log(`User ${userData.nickname} left game in room ${roomId}`);
    } else {
      console.log(`Game with room id "${roomId}" does not exist`);
    }
  });

  socket.on("game:checkRoles", () => {
    console.log("game:checkroles is being hit");
    const userId = socket.userId;
    if (!userId) {
      console.log("No userId found for socket");
      return;
    }

    const userData = socketManager.getUserData(userId);
    if (!userData) {
      console.log("No user data found for userId", userId);
      return;
    }

    const currentUserRoom = userData.lastRoom;

    if (currentUserRoom) {
      const game: BaseGame | undefined = gameManager.getGame(currentUserRoom);
      game?.getPlayers();
    } else {
      console.log("User is not in any room");
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

  /**
   *  already have access to socket.roomId, so no need to pass any parameters yet? maybe rewrite later?
   *  test endpoint for now
   */
  socket.on("player:listUsers", () => {
    const game: BaseGame | undefined = gameManager.getGame(socket.roomId);
    if (game) {
      const users = game.getPlayers();
      socket.emit("server:listUsers", users); // target only the socket the requested this data
    } else {
      console.log(`Game with room id "${socket.roomId}" does not exist`);
    }
  });

  socket.on("game:listRoomsAndPlayers", async () => {
    const game: BaseGame | undefined = gameManager.getGame(socket.roomId);
    if (game) {
      const res: Map<string, string[]> = await game.listRoomsAndPlayers();
      socket.emit("game:listRoomsAndPlayers", res);
    } else {
      console.log("Error returning rooms and players");
    }
  });

  socket.on("test:emitToRoom", ({ msg }: { msg: string }) => {
    if (socket.roomId) {
      io.to(socket.roomId).emit("server-message", msg);
      console.log(`Emitting to room ${socket.roomId}`);
    }
  });

  socket.on("client-message", (msg) => {
    console.log(`########### client response: ${msg}`);
  });

  ////////////////////////////////////////////////
  // socket endpoints for the jankenpo game
  ////////////////////////////////////////////////
  socket.on("player:move", ({ action }: { action: string }) => {
    console.log("Player:move endpoint hit");
    const mainRoomId = parseRoomId(socket.roomId);
    const game: BaseGame | undefined = gameManager.getGame(mainRoomId);
    if (game) {
      game.onPlayerMove(socket, action);
    } else {
      console.log(`Game with room id "${mainRoomId}" does not exist`);
    }
  });

  socket.on("game:checkMove", () => {
    const mainRoomId = parseRoomId(socket.roomId);
    const game: BaseGame | undefined = gameManager.getGame(mainRoomId);
    if (game) {
      game.sendOpponentMove(socket);
    } else {
      console.log(`Game with room id "${mainRoomId}" does not exist`);
    }
  });

  // big test endpoint, will need a lot of rewriting if I want to use this later as an acc endpoint
  socket.on("game:emitToCurrentRoom", ({ msg }: { msg: string }) => {
    const currentRoomId = socket.roomId;
    if (currentRoomId) {
      io.to(currentRoomId).emit("game:emitToCurrentRoom", { msg });
      console.log(`Emitting to room ${currentRoomId}`);
    } else {
      console.log("No room found for socket");
    }
  });

  socket.on("disconnect", () => {
    // Handle socket disconnection using the SocketManager
    socketManager.handleDisconnection(socket);
  });

  ////////////////////////////////////////////////
  // master endpoints for testing
  ////////////////////////////////////////////////
  socket.on("master:test", () => {
    console.log("Master:test endpoint hit");
  });
});
