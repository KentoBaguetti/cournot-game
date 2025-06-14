import { Instructor } from "../users/Instructor.ts";
import { Student } from "../users/Student.ts";
import { BaseGame } from "./BaseGame.ts";
import { Socket } from "socket.io";

export class CournotGame extends BaseGame {
  onPlayerJoin(socket: Socket, username: string, host: boolean): void {
    this.players.set(
      username,
      host ? new Instructor(socket) : new Student(socket)
    );
    socket.join(this.roomId);
    this.io.to(this.roomId).emit("player:connect", this.players);
    console.log(`Player with socket ID "${username}" joined`);
  }
  onPlayerDisconnect(socket: Socket, username: string): void {
    socket.leave(this.roomId);
    this.players.delete(username);
    console.log(`Player with socket ID "${username}" has disconnected`);
    this.io.to(this.roomId).emit("player:disconnect", this.players);
  }
  onPlayerMove(socket: Socket): void {}
}
