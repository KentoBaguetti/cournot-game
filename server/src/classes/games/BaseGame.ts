// abstract class
import { Socket, Server } from "socket.io";
import { Student } from "../users/Student.ts";
import { Instructor } from "../users/Instructor.ts";

export abstract class BaseGame {
  // instance variables
  public players: Map<string, Student | Instructor> = new Map();
  public playerCount: number = 0;

  // abstract instance variables
  public gameSettings: { [key: string]: number | string | any[] } = {};

  // constructor
  constructor(public roomId: string, protected io: Server) {}

  // basic abstract methods for every game
  abstract onPlayerMove(socket: Socket): void;

  // concrete methods
  onPlayerJoin(socket: Socket, host: boolean): void {
    this.players.set(
      socket.id,
      host ? new Instructor(socket) : new Student(socket)
    );
    this.playerCount++;
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player "${socket.id}" has connected`);
  }

  onPlayerDisconnect(socket: Socket): void {
    this.players.delete(socket.id);
    this.playerCount--;
    this.io.to(this.roomId).emit("player:disconnect");
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player "${socket.id}" has disconnected`);
  }

  getPlayers(): void {
    for (const [key, value] of this.players) {
      console.log(key, value.constructor.name);
    }
  }

  checkRole(socket: Socket): string {
    return "";
  }

  modifyGameSetting(settingName: string, value: number | string) {
    this.gameSettings[settingName] = value;
  }
}
