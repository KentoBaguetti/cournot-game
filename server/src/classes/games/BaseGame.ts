// abstract class
import { Socket, Server } from "socket.io";
import { Student } from "../users/Student.ts";
import { Instructor } from "../users/Instructor.ts";

export abstract class BaseGame {
  // instance variables
  public players: Map<string, Student | Instructor> = new Map(); // socketId : user-type
  public playerCount: number = 0;

  // abstract instance variables
  public gameSettings: { [key: string]: number | string | any[] } = {};

  // constructor
  constructor(public roomId: string, protected io: Server) {}

  // basic abstract methods for every game
  abstract onPlayerMove(socket: Socket): void;

  // concrete methods
  onPlayerJoin(socket: Socket, username: string, host: boolean): void {
    this.players.set(
      username,
      host ? new Instructor(socket) : new Student(socket)
    );
    socket.join(this.roomId);
    this.playerCount++;
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player "${username}" has connected`);
  }

  onPlayerDisconnect(socket: Socket, username: string): void {
    socket.leave(this.roomId);
    this.players.delete(username);
    this.playerCount--;
    this.io.to(this.roomId).emit("player:disconnect");
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player "${username}" has disconnected`);
  }

  getPlayers(): void {
    for (const [key, value] of this.players) {
      console.log(key, value.constructor.name);
    }
    console.log("");
    this.io
      .in(this.roomId)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach((socket) => {
          console.log(`User in ${this.roomId}: ${socket.id}, username: ${123}`);
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
