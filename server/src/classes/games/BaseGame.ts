// abstract class
import { Socket, Server } from "socket.io";

export abstract class BaseGame {
  // instance variables
  public players: Map<string, Socket> = new Map();
  public playerCount: number = 0;

  // abstract instance variables
  public abstract gameSettings: object;

  // constructor
  constructor(public roomId: string, protected io: Server) {}

  // basic abstract methods for every game
  abstract onPlayerMove(socket: Socket): void;

  // concrete methods
  onPlayerJoin(socket: Socket): void {
    this.players.set(socket.id, socket);
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
      console.log(key);
    }
  }
}
