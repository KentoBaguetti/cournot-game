import { Socket } from "socket.io";
import { BaseGame } from "./BaseGame.ts";
import { Instructor } from "../users/Instructor.ts";
import { Student } from "../users/Student.ts";

// simple game for testing purposes
// higher or lower game, one person guesses higher or lower to win

export class TestGame extends BaseGame {
  public gameSettings: {
    gameDuration: number;
    maxPlayers: number;
  } = {
    gameDuration: 3600,
    maxPlayers: 2,
  };

  onPlayerJoin(socket: Socket, username: string, host: boolean): void {
    if (this.playerCount >= this.gameSettings.maxPlayers) {
      console.log("room is full");
      return;
    }
    socket.join(this.roomId); // acc join the room
    this.players.set(
      username,
      host ? new Instructor(socket) : new Student(socket)
    );
    this.io
      .to(this.roomId)
      .emit(
        "player:connect",
        `Player with ID: "${username}" has joined: ${
          host ? "Instructor" : "Student"
        }`
      );
    this.playerCount++;
    console.log(
      `Player "${username}" has connected to room: ${this.roomId}: ${
        host ? "Instructor" : "Student"
      }`
    );
  }

  onPlayerMove(socket: Socket): void {
    this.io.to(this.roomId).emit("server-response", `Hello ${socket.id}`);
    console.log(`onPlayerMove() hit with socket: ${socket.id}`);
  }

  modifyGameSetting(
    socket: Socket,
    settingName: keyof typeof this.gameSettings,
    value: number
  ) {
    const player = this.players.get(socket.id);
    if (player instanceof Instructor) {
      this.gameSettings[settingName] = value;
    } else {
      throw new Error(
        `${socket.id} does not have permissiosn to change settings`
      );
    }
  }
}
