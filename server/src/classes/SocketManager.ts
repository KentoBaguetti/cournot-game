import { Server, Socket } from "socket.io";
import { UserData } from "../types/types";
import { verifyJwtToken, UserTokenData } from "../utils/auth";
import { GameManager } from "./GameManager";

export class SocketManager {
  public connections: Map<string, string> = new Map(); // socket.id : userId
  public userStore: Map<string, UserData> = new Map(); // userId : UserData

  constructor(private io: Server, private gameManager: GameManager) {}

  /**
   * Handle a new socket connection
   */
  handleConnection(socket: Socket): void {
    console.log(`Socket ID "${socket.id}" connected`);

    // these fields are set by the middleware
    const { userId, username, roomId } = socket;

    if (!userId || !username || !roomId) {
      console.error(
        "Missing userId, username, or roomId for socket connection"
      );
      socket.disconnect();
      return;
    }

    // Store user data and connection
    this.registerUser(socket.id, userId, username, roomId);

    // Attach userId to socket for easy access
    socket.userId = userId;

    // If user has a lastRoom, try to reconnect them to their game
    if (roomId) {
      this.reconnectToGame(socket, userId, username, roomId);
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
      console.log(`Socket "${socket.id}" disconnected (User: ${userId})`);

      // Remove socket connection but keep user data for potential reconnection
      this.connections.delete(socket.id);

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
    lastRoom?: string
  ): void {
    // Store connection
    this.connections.set(socketId, userId);

    // Get or create user data
    let userData = this.userStore.get(userId);

    if (!userData) {
      // New user
      userData = {
        nickname: username,
        lastRoom,
      };
    } else {
      // Existing user, update nickname if needed
      userData.nickname = username;
    }

    // Update user store
    this.userStore.set(userId, userData);
  }

  /**
   * Update user's last room
   */
  updateUserRoom(userId: string, roomId: string): void {
    const userData = this.userStore.get(userId);
    if (userData) {
      userData.lastRoom = roomId;
      this.userStore.set(userId, userData);
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
    const game = this.gameManager.getGame(roomId);

    if (game) {
      // Check if user was already in the game
      const wasInGame = game.players.has(userId);

      if (wasInGame) {
        console.log(`Reconnecting user ${username} to game in room ${roomId}`);
        game.onPlayerReconnect(socket, userId, username);
      } else {
        console.log(`User ${username} joining game in room ${roomId}`);
        // Determine if they should be host (unlikely in reconnection scenario)
        const isHost = false;
        game.onPlayerJoin(socket, userId, username, isHost);
      }
    } else {
      console.log(`Game with room id "${roomId}" no longer exists`);
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
