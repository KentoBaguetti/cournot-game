import { BaseGame } from "./BaseGame";
import { Socket } from "socket.io";

export class CournotGame extends BaseGame {
  public players: Map<string, Socket> = new Map();

  onPlayerJoin(socket: Socket): void {
    this.players.set(socket.id, socket);
    socket.join(this.roomId);
    this.io.to(this.roomId).emit("player:connect", this.players);
    console.log(`Playe with socket ID "${socket.id}" joined`);
  }
  onPlayerDisconnect(socket: Socket): void {
    this.players.delete(socket.id);
    console.log(`Player with socket ID "${socket.id}" has disconnected`);
    this.io.to(this.roomId).emit("player:disconnect", this.players);
  }
  onPlayerMove(socket: Socket): void {}
}
