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

  // two cases: host and non-host - host is in the main room, non-host is in the breakout room
  async onPlayerJoin(
    socket: Socket,
    userId: string,
    username: string,
    host: boolean
  ): Promise<void> {
    if (host) {
      socket.join(this.roomId);
      const player = new Instructor(socket, userId, username, this.roomId);
      this.players.set(userId, player);
      this.playerCount++;
      console.log(
        `Instructor ${username} (${userId}) joined main room ${this.roomId}`
      );
    } else {
      let tempRoomId = this.roomId + "_" + this.breakoutRoomCount; // "JWKDKE_0"
      if (
        (await this.countSocketsInRoom(tempRoomId)) >=
        this.gameSettings.maxPlayersPerRoom
      ) {
        this.breakoutRoomCount++;
        tempRoomId = this.roomId + "_" + this.breakoutRoomCount; // update BR id
        socket.join(tempRoomId);
        console.log(
          `Player ${username} (${userId}) joined breakout room ${tempRoomId}`
        );
      } else {
        socket.join(tempRoomId);
        console.log(`Player ${username} (${userId}) joined room ${tempRoomId}`);
      }

      const player = new Student(socket, userId, username, tempRoomId);
      this.players.set(userId, player);
      this.playerCount++;
      this.breakoutRoomIds.push(tempRoomId);
      socket.roomId = tempRoomId;
      this.io
        .to(tempRoomId)
        .emit("player:connect", `Player "${username}" has connected`);
    }

    // add to players map
    // const player = host
    //   ? new Instructor(socket, userId, username, this.roomId) // instructor is in the main room
    //   : new Student(socket, userId, username, tempRoomId);
    // this.players.set(userId, player);
    // this.playerCount++;
    // this.breakoutRoomIds.push(tempRoomId);

    // socket.roomId = tempRoomId; // make sure to update the socket instance as well

    // this.io
    //   .to(tempRoomId)
    //   .emit("player:connect", `Player "${username}" has connected`);
  }

  async listRoomsAndPlayers(): Promise<Map<string, string[]>> {
    const res: Map<string, string[]> = new Map();

    for (const currentRoomId of this.breakoutRoomIds) {
      const sockets = await this.io.in(currentRoomId).fetchSockets();
      const players: string[] = [];
      for (const socket of sockets) {
        const userId = this.socketManager?.connections.get(socket.id) || "";
        const currentPlayerNickname: string =
          this.socketManager?.userStore.get(userId)?.nickname || "None";
        players.push(currentPlayerNickname);
      }
      res.set(currentRoomId, players);
    }
    console.log();
    console.log(res);
    console.log();
    return res;
  }

  onPlayerMove(socket: Socket): void {}
}
