// abstract class
import { Server, Socket } from "socket.io";
import { Student } from "../users/Student";
import { Instructor } from "../users/Instructor";
import { SocketManager } from "../../socket/SocketManager";
import { BreakoutRoomData } from "../../types/types";

/**
 *
 * This abstract class contains very basic implementations of certain methods that will be overrided
 * during the implementation of the more specific sublcass games.
 *
 */

export abstract class BaseGame {
  //////////////////////////////////////////////////////////////
  // instance variables
  //////////////////////////////////////////////////////////////
  public players: Map<string, Student | Instructor> = new Map(); // userId : user-type
  public socketManager?: SocketManager;
  public playerCount: number = 0;
  public roomId: string;
  public hostId: string;

  /**
   * using array for now to take advantage of socket.rooms api.
   * may change later for more flexibility
   * the array will just hold all the different room ids
   */
  public breakoutRoomIds: string[] = [];
  public breakoutRoomCount: number = 0;
  public roomMap: Map<string, BreakoutRoomData> = new Map();

  // abstract instance variables
  public gameSettings: { [key: string]: number | string | any[] } = {};

  //////////////////////////////////////////////////////////////
  // constructor
  //////////////////////////////////////////////////////////////
  constructor(roomId: string, protected io: Server, hostId: string) {
    this.roomId = roomId;
    this.hostId = hostId;
  }

  // Set the socket manager reference
  setSocketManager(socketManager: SocketManager): void {
    this.socketManager = socketManager;
  }
  //////////////////////////////////////////////////////////////
  // basic abstract methods for every game
  //////////////////////////////////////////////////////////////
  abstract onPlayerMove(socket: Socket, action: string): void;
  abstract sendOpponentMove(socket: Socket): void;

  //////////////////////////////////////////////////////////////
  // concrete methods
  //////////////////////////////////////////////////////////////
  // very basic implementation for now, the more specific sublcass games will override this
  onPlayerJoin(
    socket: Socket,
    userId: string,
    username: string,
    host: boolean
  ): void {
    const player = host
      ? new Instructor(socket, userId, username)
      : new Student(socket, userId, username);

    this.players.set(userId, player);
    socket.join(this.roomId);
    this.playerCount++;
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player "${username}" has connected`);
  }

  onPlayerDisconnect(socket: Socket, userId: string): void {
    socket.leave(this.roomId);
    socket.roomId = "";

    // We don't delete the player from the map to allow for reconnection
    // Instead, mark the player as disconnected
    const player = this.players.get(userId);
    if (player) {
      player.setDisconnected(true);
      const username = player.getNickname();

      // Emit disconnect event
      this.io
        .to(this.roomId)
        .emit("player:disconnect", `Player "${username}" has disconnected`);

      // Also emit updated player list
      this.io.to(this.roomId).emit("server:listUsers", this.getPlayers());

      // If the player was ready, update their ready status
      if (player.isReady()) {
        player.setReady(false);
        this.io.to(this.roomId).emit("player:readyUpdate", {
          playerId: userId,
          playerName: username,
          isReady: false,
        });
      }
    }
  }

  onPlayerReconnect(socket: Socket, userId: string, username: string): void {
    const player = this.players.get(userId);

    if (player) {
      // Update the player's socket and connection status
      player.updateSocket(socket);
      player.setDisconnected(false);

      // Join the socket to the room
      socket.join(this.roomId);

      this.io
        .to(this.roomId)
        .emit("player:reconnect", `Player "${username}" has reconnected`);
    } else {
      // If player wasn't found, treat as a new join (non-host)
      this.onPlayerJoin(socket, userId, username, false);
    }
  }

  // TODO: fix this so it gets the users that are in breakout rooms
  getPlayers(): string[] {
    const res: string[] = [];
    for (const [userId, player] of this.players) {
      // Only add non-disconnected players to the result
      if (!player.isDisconnected()) {
        res.push(player.getNickname());
      }
    }
    return res;
  }

  getStudentPlayers(): string[] {
    const res: string[] = [];
    for (const [userId, player] of this.players) {
      // Only add non-disconnected players that are not the host
      if (!player.isDisconnected() && userId !== this.hostId) {
        res.push(player.getNickname());
      }
    }
    return res;
  }

  areAllStudentsReady(): boolean {
    // First, count how many students we have and how many are ready
    let studentCount = 0;
    let readyCount = 0;

    for (const [userId, player] of this.players) {
      // Skip the host and disconnected players
      if (userId === this.hostId || player.isDisconnected()) {
        continue;
      }

      studentCount++;
      if (player.isReady()) {
        readyCount++;
      }
    }

    // Log the counts for debugging
    console.log(`Student count: ${studentCount}, Ready count: ${readyCount}`);

    // If there are no students, return false
    if (studentCount === 0) {
      return false;
    }

    // Return true if all students are ready
    return readyCount === studentCount;
  }

  getStudentCount(): number {
    let count = 0;
    for (const [userId, player] of this.players) {
      if (userId !== this.hostId && !player.isDisconnected()) {
        count++;
      }
    }
    return count;
  }

  checkRole(socket: Socket): string {
    return "";
  }

  // temp function to list all the rooms and players
  listRoomsAndPlayers(): object {
    const res: Map<string, string[]> = new Map();

    for (const currRoomId of this.breakoutRoomIds) {
      const temp: string[] = [];
      const roomData: BreakoutRoomData | undefined =
        this.roomMap.get(currRoomId);
      if (roomData) {
        for (const user of roomData.users) {
          temp.push(user.getNickname());
        }
      }
      res.set(currRoomId, temp);
    }
    const objectData = Object.fromEntries(res);
    return objectData;
  }

  modifyGameSetting(
    socket: Socket,
    settingName: string,
    value: number | string | any[]
  ) {
    this.gameSettings[settingName] = value;
  }

  async countSocketsInRoom(roomId: string): Promise<number> {
    const sockets = await this.io.in(roomId).fetchSockets();
    return sockets.length;
  }
}
