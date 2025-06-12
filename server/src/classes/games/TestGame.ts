import { Socket } from "socket.io";
import { BaseGame } from "./BaseGame.ts";

// simple game for testing purposes

export class TestGame extends BaseGame {
  public gameSettings: { gameDuration: number; maxPlayers: number } = {
    gameDuration: 3600,
    maxPlayers: 2,
  };

  onPlayerJoin(socket: Socket): void {
    if (this.playerCount >= this.gameSettings.maxPlayers) {
      console.log("room is full");
      return;
    }
    this.players.set(socket.id, socket);
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player with ID: "${socket.id}" has joined`);
    this.playerCount++;
    console.log(`Player "${socket.id}" has connected to room: ${this.roomId}`);
  }

  onPlayerMove(socket: Socket): void {
    this.io.to(this.roomId).emit("server-response", `Hello ${socket.id}`);
    console.log(`onPlayerMove() hit with socket: ${socket.id}`);
  }
}
