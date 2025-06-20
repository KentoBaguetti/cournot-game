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

  listRoomsAndPlayers(): object {
    const res: Map<string, string[]> = new Map();

    for (const currRoomId of this.breakoutRoomIds) {
      const temp: string[] = [];
      const roomData: BreakoutRoomData | undefined =
        this.roomMap.get(currRoomId);
      if (roomData) {
        for (const user of roomData.users) {
          temp.push(user.getNickname());
        }
      }
      res.set(currRoomId, temp);
    }
    const objectData = Object.fromEntries(res);
    return objectData;
  }

  onPlayerMove(socket: Socket, action: string): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player not found");
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructor cannot move");
      return;
    }
    player.setUserMove(action);
    console.log(`Player ${socket.id} moved with action: ${action}`);
  }

  // go through the breakout room, find the opponent, check for move, send the move to the socket
  sendOpponentMove(socket: Socket): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player not found");
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructor cannot move and should not recieve a move");
      return;
    }

    const roomId = socket.roomId;
    if (!roomId) {
      console.error("Room id not found");
      return;
    }

    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error("Room data not found");
      return;
    }

    const roomUsers = roomData.users;
    const opponent = roomUsers.find((user) => user.userId !== socket.userId);
    const opponentMove = opponent?.getUserMove();
    if (!opponentMove) {
      console.error("Opponent move not found");
      return;
    }
    socket.emit("game:checkMove", { move: opponentMove });
  }
}
