// abstract class
import { Server, Socket } from "socket.io";
import { Student } from "../users/Student";
import { Instructor } from "../users/Instructor";
import { SocketManager } from "../SocketManager";

declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}

export abstract class BaseGame {
  // instance variables
  public players: Map<string, Student | Instructor> = new Map(); // userId : user-type
  public playerCount: number = 0;
  public socketManager?: SocketManager;

  // abstract instance variables
  public gameSettings: { [key: string]: number | string | any[] } = {};

  // constructor
  constructor(public roomId: string, protected io: Server) {}

  // Set the socket manager reference
  setSocketManager(socketManager: SocketManager): void {
    this.socketManager = socketManager;
  }

  // basic abstract methods for every game
  abstract onPlayerMove(socket: Socket): void;

  // concrete methods
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
    // We don't delete the player from the map to allow for reconnection
    // Instead, mark the player as disconnected
    const player = this.players.get(userId);
    if (player) {
      player.setDisconnected(true);
      const username = player.getNickname();
      this.io
        .to(this.roomId)
        .emit("player:disconnect", `Player "${username}" has disconnected`);
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

  getPlayers(): void {
    for (const [userId, player] of this.players) {
      console.log(
        userId,
        player.constructor.name,
        player.getNickname(),
        player.isDisconnected() ? "(Disconnected)" : ""
      );
    }
    console.log("");
    this.io
      .in(this.roomId)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach((socket) => {
          // RemoteSocket doesn't have userId property directly, so we can only log the socket ID
          console.log(`User in ${this.roomId}: ${socket.id}`);
        });
      });
  }

  checkRole(socket: Socket): string {
    return "";
  }

  modifyGameSetting(
    socket: Socket,
    settingName: string,
    value: number | string | any[]
  ) {
    this.gameSettings[settingName] = value;
  }
}
