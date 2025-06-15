import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";
import { BaseGame } from "./BaseGame";
import { Socket } from "socket.io";

export class CournotGame extends BaseGame {
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
    this.io.to(this.roomId).emit("player:connect", this.players);
    console.log(`Player "${username}" (${userId}) joined`);
  }

  onPlayerDisconnect(socket: Socket, userId: string): void {
    socket.leave(this.roomId);

    // We don't delete the player from the map to allow for reconnection
    // Instead, mark the player as disconnected
    const player = this.players.get(userId);
    if (player) {
      player.setDisconnected(true);
      const username = player.getNickname();
      console.log(`Player "${username}" (${userId}) has disconnected`);
      this.io.to(this.roomId).emit("player:disconnect", this.players);
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

      console.log(`Player "${username}" (${userId}) has reconnected`);
      this.io.to(this.roomId).emit("player:reconnect", this.players);
    } else {
      // If player wasn't found, treat as a new join (non-host)
      this.onPlayerJoin(socket, userId, username, false);
    }
  }

  onPlayerMove(socket: Socket): void {}
}
