"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//////////////////////////////////////////////////////////////////
// import libraries (not made by me)
//////////////////////////////////////////////////////////////////
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const uuid_1 = require("uuid");
// Extend the Socket interface to include userId
// declare module "socket.io" {
//   interface Socket {
//     userId?: string;
//   }
// }
//////////////////////////////////////////////////////////////////
// imported modules (not libraries)
//////////////////////////////////////////////////////////////////
const GameFactory_1 = require("./src/classes/GameFactory");
const GameManager_1 = require("./src/classes/GameManager");
const auth_1 = require("./src/utils/auth");
const SocketManager_1 = require("./src/classes/SocketManager");
//////////////////////////////////////////////////////////////////
// server vars
//////////////////////////////////////////////////////////////////
const app = (0, express_1.default)();
app.use(
// express cors
(0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express_1.default.json()); // express middleware for jsons
app.use((0, cookie_parser_1.default)()); // Add cookie parser middleware
const PORT = 3001; // TODO: add an env variable
const server = (0, http_1.createServer)(app); // low level access server to allow for websocket connections
const io = new socket_io_1.Server(server, {
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
const gameManager = new GameManager_1.GameManager();
const socketManager = new SocketManager_1.SocketManager(io, gameManager);
// Keep these maps for backward compatibility during transition
const roomStore = new Map(); // rooms : set of all players || roomId : {set of players}
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
    console.log("Login hit");
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }
    // Generate a unique user ID if this is a new user
    const userId = (0, uuid_1.v4)();
    // Create user data for the token
    const userData = {
        userId,
        username,
    };
    // Set the token as an HTTP-only cookie
    const token = (0, auth_1.setTokenCookie)(res, userData);
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
    (0, auth_1.clearTokenCookie)(res);
    res.json({ success: true });
});
// Add an endpoint to check authentication status
app.get("/auth/me", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ authenticated: false });
    }
    const userData = (0, auth_1.verifyJwtToken)(token);
    if (!userData) {
        (0, auth_1.clearTokenCookie)(res);
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
// expose the jwt token to the frontend
app.get("/auth/token", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }
    console.log(`Token successfully sent to the frontend`);
    res.json({ success: true, token });
});
//////////////////////////////////////////////////////////////////
// socket.io routes
//////////////////////////////////////////////////////////////////
io.on("connection", (socket) => {
    // Handle socket connection using the SocketManager
    socketManager.handleConnection(socket);
    socket.on("game:create", ({ roomId, gameType }) => {
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
        const game = GameFactory_1.GameFactory.createGame(gameType, roomId, io);
        // Set the SocketManager on the game
        game.setSocketManager(socketManager);
        roomStore.set(roomId, { gameType: gameType, players: new Set() });
        gameManager.addGame(roomId, game);
        // Join as host
        game.onPlayerJoin(socket, userId, username, true);
        // Update room data
        const room = roomStore.get(roomId);
        room === null || room === void 0 ? void 0 : room.players.add(userId);
        // Update user's last room
        socketManager.updateUserRoom(userId, roomId);
        console.log(`Game created: ${gameType}, Room: ${roomId}, Host: ${username}`);
    });
    socket.on("game:join", ({ roomId }) => {
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
        const game = gameManager.getGame(roomId);
        if (game) {
            // Set the SocketManager on the game if not already set
            if (!game.socketManager) {
                game.setSocketManager(socketManager);
            }
            // Check if player is already in the game (might be reconnecting)
            if (game.players.has(userId)) {
                game.onPlayerReconnect(socket, userId, username);
            }
            else {
                game.onPlayerJoin(socket, userId, username, false);
            }
            // Update room data
            const room = roomStore.get(roomId);
            room === null || room === void 0 ? void 0 : room.players.add(userId);
            // Update user's last room
            socketManager.updateUserRoom(userId, roomId);
            console.log(`User ${username} joined game in room ${roomId}`);
        }
        else {
            console.log(`Game with room id "${roomId}" does not exist`);
            socket.emit("game:error", { message: "Game room does not exist" });
        }
    });
    socket.on("game:leave", ({ roomId }) => {
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
        const game = gameManager.getGame(roomId);
        if (game) {
            game.onPlayerDisconnect(socket, userId);
            // Update room data
            const room = roomStore.get(roomId);
            room === null || room === void 0 ? void 0 : room.players.delete(userId);
            console.log(`User ${userData.nickname} left game in room ${roomId}`);
        }
        else {
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
            const game = gameManager.getGame(currentUserRoom);
            game === null || game === void 0 ? void 0 : game.getPlayers();
        }
        else {
            console.error("User is not in any room");
        }
    });
    socket.on("game:expandSize", ({ roomId, setting, size }) => {
        const game = gameManager.getGame(roomId);
        try {
            game === null || game === void 0 ? void 0 : game.modifyGameSetting(socket, setting, size);
            console.log(`Game room capacity expanded to: ${size}`);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
            else {
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
