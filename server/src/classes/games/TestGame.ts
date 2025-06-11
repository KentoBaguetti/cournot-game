import { Socket } from "socket.io";
import { BaseGame } from "./BaseGame";

// simple game for testing purposes

export class TestGame extends BaseGame {
  // instance variables
  players: Map<string, Socket> = new Map();
  playerCount: number = 0;

  onPlayerJoin(socket: Socket): void {
    if (this.playerCount >= 2) {
      console.log("room is full");
      return;
    }
    this.players.set(socket.id, socket);
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player with ID: "${socket.id}" has joined`);
    this.playerCount++;
  }

  onPlayerDisconnect(socket: Socket): void {
    this.players.delete(socket.id);
    this.io
      .to(this.roomId)
      .emit(
        "player:disconnect",
        `Player with ID: "${socket.id}" has disconnected`
      );
    this.playerCount--;
  }

  onPlayerMove(socket: Socket): void {
    this.io.to(this.roomId).emit("server-response", `Hello ${socket.id}`);
    console.log(`onPlayerMove() hit with socket: ${socket.id}`);
  }
}
