import { BaseGame } from "./BaseGame";
import { Socket } from "socket.io";
import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";

export class JanKenPoGame extends BaseGame {
  gameSettings: {
    maxPlayersPerRoom: number;
  } = {
    maxPlayersPerRoom: 2,
  };

  async onPlayerJoin(
    socket: Socket,
    userId: string,
    username: string,
    host: boolean
  ): Promise<void> {
    let tempRoomId = this.roomId + "_" + this.breakoutRoomCount; // "JWKDKE_0"
    if (
      (await this.countSocketsInRoom(tempRoomId)) >=
      this.gameSettings.maxPlayersPerRoom
    ) {
      this.breakoutRoomCount++;
      tempRoomId = this.roomId + "_" + this.breakoutRoomCount; // update BR id
      socket.join(tempRoomId);
    } else {
      socket.join(tempRoomId);
    }

    // add to players map
    this.players.set(userId, new Student(socket, userId, username, tempRoomId));
    this.playerCount++;
    this.breakoutRoomIds.push(tempRoomId);
  }

  onPlayerMove(socket: Socket): void {}
}
