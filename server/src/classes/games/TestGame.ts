import { Socket } from "socket.io";
import { BaseGame } from "./BaseGame";
import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";

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

  onPlayerJoin(
    socket: Socket,
    userId: string,
    username: string,
    host: boolean
  ): void {
    if (this.playerCount >= this.gameSettings.maxPlayers) {
      console.log("room is full");
      return;
    }

    socket.join(this.roomId); // acc join the room

    const player = host
      ? new Instructor(socket, userId, username)
      : new Student(socket, userId, username);

    this.players.set(userId, player);

    this.io
      .to(this.roomId)
      .emit(
        "player:connect",
        `Player "${username}" (${userId}) has joined: ${
          host ? "Instructor" : "Student"
        }`
      );

    this.playerCount++;

    console.log(
      `Player "${username}" (${userId}) has connected to room: ${
        this.roomId
      }: ${host ? "Instructor" : "Student"}`
    );
  }

  onPlayerReconnect(socket: Socket, userId: string, username: string): void {
    const player = this.players.get(userId);

    if (player) {
      // Update the player's socket and connection status
      player.updateSocket(socket);
      player.setDisconnected(false);

      // Join the socket to the room
      socket.join(this.roomId);

      this.io
        .to(this.roomId)
        .emit(
          "player:reconnect",
          `Player "${username}" (${userId}) has reconnected: ${
            player instanceof Instructor ? "Instructor" : "Student"
          }`
        );

      console.log(
        `Player "${username}" (${userId}) has reconnected to room: ${
          this.roomId
        }: ${player instanceof Instructor ? "Instructor" : "Student"}`
      );
    } else {
      // If player wasn't found, treat as a new join (non-host)
      this.onPlayerJoin(socket, userId, username, false);
    }
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
    // Get the userId from the socket
    const userId = socket.userId;
    if (!userId) {
      throw new Error("No userId found for socket");
      return;
    }

    // Get the player by userId
    const player = this.players.get(userId);

    if (player instanceof Instructor) {
      this.gameSettings[settingName] = value;
    } else {
      throw new Error(
        `User ${userId} does not have permissions to change settings`
      );
    }
  }
}
