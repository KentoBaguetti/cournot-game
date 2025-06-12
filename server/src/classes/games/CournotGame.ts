import { Instructor } from "../users/Instructor.ts";
import { Student } from "../users/Student.ts";
import { BaseGame } from "./BaseGame.ts";
import { Socket } from "socket.io";

export class CournotGame extends BaseGame {
  onPlayerJoin(socket: Socket, host: boolean): void {
    this.players.set(
      socket.id,
      host ? new Instructor(socket) : new Student(socket)
    );
    socket.join(this.roomId);
    this.io.to(this.roomId).emit("player:connect", this.players);
    console.log(`Player with socket ID "${socket.id}" joined`);
  }
  onPlayerDisconnect(socket: Socket): void {
    this.players.delete(socket.id);
    console.log(`Player with socket ID "${socket.id}" has disconnected`);
    this.io.to(this.roomId).emit("player:disconnect", this.players);
  }
  onPlayerMove(socket: Socket): void {}
}
