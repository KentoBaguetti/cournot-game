import { Server, Socket } from "socket.io";
import { UserData } from "../types/types";
import { verifyJwtToken, UserTokenData } from "../utils/auth";
import { GameManager } from "../classes/GameManager";
import { parseRoomId } from "../utils/utils";
import { Student } from "../classes/users/Student";

export class SocketManager {
  public connections: Map<string, string> = new Map(); // socket.id : userId
  public userStore: Map<string, UserData> = new Map(); // userId : UserData
  public userRooms: Map<string, string> = new Map(); // userId : roomId (persists between reconnections)

  constructor(private io: Server, private gameManager: GameManager) {}

  /**
   * Handle a new socket connection
   */
  handleConnection(socket: Socket): void {
    console.log(`Socket ID "${socket.id}" connected`);

    // these fields are set by the middleware
    const { userId, username, roomId } = socket;

    if (!userId || !username) {
      console.error("Missing userId or username for socket connection");
      socket.disconnect();
      return;
    }

    // Store user data and connection
    this.registerUser(socket.id, userId, username, roomId);

    // If user has a lastRoom, try to reconnect them to their game
    const persistedRoomId = this.userRooms.get(userId) || roomId;

    if (persistedRoomId) {
      console.log(`User ${username} has a persisted room: ${persistedRoomId}`);
      socket.roomId = persistedRoomId;
      this.reconnectToGame(socket, userId, username, persistedRoomId);
    }

    console.log(
      `User "${username}" (${userId}) connected with socket ${socket.id}`
    );
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket: Socket): void {
    const userId = this.connections.get(socket.id);

    if (userId) {
      console.log(
        `Socket "${socket.id}" disconnected (User: ${userId}). Coming from handleDisconnection()`
      );

      // Remove socket connection but keep user data for potential reconnection
      this.connections.delete(socket.id);

      // If the user was in a room, update the player list
      const roomId = socket.roomId;
      if (roomId) {
        // Get the main room ID if this is a breakout room
        const mainRoomId = parseRoomId(roomId);
        const game = this.gameManager.getGame(mainRoomId);

        if (game) {
          // Mark player as disconnected
          const player = game.players.get(userId);
          if (player) {
            player.setDisconnected(true);

            // Broadcast updated player list
            this.io.to(roomId).emit("server:listUsers", game.getPlayers());

            // If the player was ready, update their ready status
            if (player.isReady()) {
              player.setReady(false);
              this.io.to(roomId).emit("player:readyUpdate", {
                playerId: userId,
                playerName: player.getNickname(),
                isReady: false,
              });
            }

            // send the updated rooms and players to the game dashboard
            console.log(`Main room id: ${mainRoomId}`);
            this.io
              .to(mainRoomId)
              .emit("server:listRoomsAndPlayers", game.listRoomsAndPlayers());
            console.log("SENT UPDATED ROOMS AND PLAYERS TO GAME DASHBOARD");
          }
        }
      }

      // Set a timeout to clean up user data if they don't reconnect
      setTimeout(() => {
        // Check if user has reconnected with a different socket
        const hasReconnected = Array.from(this.connections.values()).includes(
          userId
        );

        if (!hasReconnected) {
          console.log(
            `User ${userId} did not reconnect, cleaning up user data`
          );
          this.userStore.delete(userId);
          this.userRooms.delete(userId);
          const game = this.gameManager.getGame(roomId);
          if (game) {
            game.players.delete(userId);
            game.playerCount--;
          }

          // delete the game after the timeout if the game is empty after the user is removed
          if (game && game.playerCount === 0) {
            this.gameManager.removeGame(roomId);
          }
        }
      }, 5 * 60 * 1000); // 5 min timeout callback func
    } else {
      console.log(`Socket "${socket.id}" disconnected (Unknown user)`);
    }
  }

  /**
   * Register a user in the system
   */
  registerUser(
    socketId: string,
    userId: string,
    username: string,
    roomId?: string
  ): void {
    // Store connection
    this.connections.set(socketId, userId);

    // Get or create user data
    let userData = this.userStore.get(userId);

    if (!userData) {
      // New user
      userData = {
        nickname: username,
        lastRoom: roomId,
      };
    } else {
      // Existing user, update nickname if needed
      userData.nickname = username;
    }

    // Update user store
    this.userStore.set(userId, userData);

    // If roomId is provided, update the persisted room
    if (roomId) {
      this.userRooms.set(userId, roomId);
    }
  }

  /**
   * Update user's last room
   */
  updateUserRoom(userId: string, roomId: string): void {
    // Update in userData
    const userData = this.userStore.get(userId);
    if (userData) {
      userData.lastRoom = roomId;
      this.userStore.set(userId, userData);
    }

    // Update in persisted rooms
    this.userRooms.set(userId, roomId);

    // Update all active sockets for this user
    const socketIds = this.getSocketIds(userId);
    for (const socketId of socketIds) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.roomId = roomId;
      }
    }
  }

  /**
   * Reconnect a user to their last game
   */
  reconnectToGame(
    socket: Socket,
    userId: string,
    username: string,
    roomId: string
  ): void {
    // Handle main room vs breakout room
    const mainRoomId = parseRoomId(roomId);
    const game = this.gameManager.getGame(mainRoomId);

    if (game) {
      // Check if user was already in the game
      const wasInGame = game.players.has(userId);

      if (wasInGame) {
        console.log(`Reconnecting user ${username} to game in room ${roomId}`);

        // Update the player's socket and connection status
        game.onPlayerReconnect(socket, userId, username);

        // If this is a breakout room, join that specific room
        if (roomId !== mainRoomId) {
          socket.join(roomId);

          // Get the room data to send current game state
          const roomData = game.roomMap.get(roomId);
          if (roomData) {
            // Send current round information
            socket.emit("server:roundStart", {
              roundNo: roomData.roundNo,
              roundLength: (game.gameConfigs as any).roundLength,
            });

            // Send timer updates if active
            if (roomData.timerActive) {
              const remainingTime = Math.max(
                0,
                Math.floor((roomData.timerEndTime - Date.now()) / 1000)
              );
              socket.emit("server:timerUpdate", {
                remainingTime,
                active: roomData.timerActive,
                roundTimer: true,
              });
            }

            // TODO: this needs to be updated to be universal for all games
            // For Cournot game, send game-specific info
            if (game.constructor.name === "CournotGame") {
              game.sendGameInfoToStudent(socket);

              // If player had made a move in the current round, restore it
              const player = game.players.get(userId);
              if (player && player instanceof Student) {
                const userMove = roomData.userMoves.get(player as Student);
                if (userMove !== undefined) {
                  socket.emit("server:moveRestored", { action: userMove });
                }
              }
            }
          }
        }

        // Emit a reconnection event to the client
        socket.emit("game:reconnected", {
          roomId: roomId,
          gameType: game.constructor.name,
          isHost: game.hostId === userId,
        });
      } else {
        console.log(`User ${username} joining game in room ${roomId}`);
        // Determine if they should be host
        const isHost = game.hostId === userId;
        game.onPlayerJoin(socket, userId, username, isHost);

        // If this is a breakout room, join that specific room
        if (roomId !== mainRoomId) {
          socket.join(roomId);
        }
      }

      // Update the socket's roomId
      socket.roomId = roomId;
    } else {
      console.log(`Game with room id "${roomId}" no longer exists`);
      // Clear the room information since it's no longer valid
      this.clearUserRoom(userId);
      socket.emit("game:error", { message: "Game room no longer exists" });
    }
  }

  /**
   * Clear user's room information
   */
  clearUserRoom(userId: string): void {
    // Remove the room association
    this.userRooms.delete(userId);

    // Update in userData
    const userData = this.userStore.get(userId);
    if (userData) {
      userData.lastRoom = undefined;
      this.userStore.set(userId, userData);
    }

    // Update all active sockets for this user
    const socketIds = this.getSocketIds(userId);
    for (const socketId of socketIds) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.roomId = "";
      }
    }
  }

  /**
   * Get user data by user ID
   */
  getUserData(userId: string): UserData | undefined {
    return this.userStore.get(userId);
  }

  /**
   * Get user ID by socket ID
   */
  getUserId(socketId: string): string | undefined {
    return this.connections.get(socketId);
  }

  /**
   * Get user's current room
   */
  getUserRoom(userId: string): string | undefined {
    return this.userRooms.get(userId);
  }

  /**
   * Get socket IDs for a specific user ID
   * This returns all active sockets for a user (could be multiple if they have multiple tabs open)
   */
  getSocketIds(userId: string): string[] {
    const socketIds: string[] = [];
    for (const [socketId, uid] of this.connections.entries()) {
      if (uid === userId) {
        socketIds.push(socketId);
      }
    }
    return socketIds;
  }

  /**
   * Get all active connections
   * Returns a map of userId to array of socket IDs
   */
  getAllConnections(): Map<string, string[]> {
    const result = new Map<string, string[]>();

    for (const [socketId, userId] of this.connections.entries()) {
      if (!result.has(userId)) {
        result.set(userId, []);
      }
      result.get(userId)?.push(socketId);
    }

    return result;
  }
}
