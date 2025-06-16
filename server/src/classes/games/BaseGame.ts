// abstract class
import { Server, Socket } from "socket.io";
import { Student } from "../users/Student";
import { Instructor } from "../users/Instructor";
import { SocketManager } from "../SocketManager";

export abstract class BaseGame {
  //////////////////////////////////////////////////////////////
  // instance variables
  //////////////////////////////////////////////////////////////
  public players: Map<string, Student | Instructor> = new Map(); // userId : user-type
  public playerCount: number = 0;
  public socketManager?: SocketManager;
  public roomId: string;
  public hostId: string;

  /** using array for now to take advantage of socket.rooms api.
   * may change later for more flexibility
   * the array will just hold all the different room ids
   */
  public breakoutRoomIds: string[] = [];
  public breakoutRoomCount: number = 0;

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
  abstract onPlayerMove(socket: Socket): void;

  //////////////////////////////////////////////////////////////
  // concrete methods
  //////////////////////////////////////////////////////////////
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

  getPlayers(): string[] {
    const res: string[] = [];
    for (const [userId, player] of this.players) {
      console.log(
        userId,
        player.constructor.name,
        player.getNickname(),
        player.isDisconnected() ? "(Disconnected)" : ""
      );
      res.push(player.getNickname());
    }
    console.log("");
    this.io
      .in(this.roomId)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach((socket) => {
          // RemoteSocket doesn't have userId property directly, so we can only log the socket ID
          const id = this.socketManager?.connections.get(socket.id) || "";
          const playerNickname =
            this.socketManager?.userStore.get(id)?.nickname || "None";
          const player = this.players.get(id);
          console.log(
            `User in ${
              this.roomId
            }: uuid: ${id} ### nickname: ${playerNickname} ### Role: ${
              player instanceof Instructor ? "Instructor" : "Student"
            }`
          );
        });
      });
    return res;
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

  async countSocketsInRoom(roomId: string): Promise<number> {
    const sockets = await this.io.in(roomId).fetchSockets();
    return sockets.length;
  }
}
