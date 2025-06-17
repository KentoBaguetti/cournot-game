import { BaseGame } from "./BaseGame";
import { Socket } from "socket.io";
import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";
import { BreakoutRoomData } from "../../types/types";

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

      // set the room map
      if (!this.roomMap.has(tempRoomId)) {
        this.roomMap.set(tempRoomId, {
          users: [player],
          roundNo: 0,
        });
      } else {
        this.roomMap.get(tempRoomId)?.users.push(player);
      }

      // set the players map
      this.players.set(userId, player);
      this.playerCount++;

      // set the breakout room ids
      this.breakoutRoomIds.push(tempRoomId);

      socket.roomId = tempRoomId;
      this.io
        .to(tempRoomId)
        .emit("player:connect", `Player "${username}" has connected`);
    }
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
    console.log(this.roomMap);
    console.log();
    return res;
  }

  onPlayerMove(socket: Socket, action: string): void {
    console.log(`Player ${socket.id} moved with action: ${action}`);
  }
}
