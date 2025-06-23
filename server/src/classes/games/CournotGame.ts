import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";
import { BaseGame } from "./BaseGame";
import { Socket, Server } from "socket.io";
import { GameConfigs, CournotGameConfigs } from "../../types/types";
import {
  calculateMarketPrice,
  calculateProfit,
} from "../../utils/cournotFormulas";

export class CournotGame extends BaseGame {
  // Cournot constructor to specifically handle the different game configs
  constructor(
    roomId: string,
    protected io: Server,
    hostId: string,
    gameConfigs: GameConfigs
  ) {
    super(roomId, io, hostId, gameConfigs);
    const config = gameConfigs as CournotGameConfigs;
    if (
      !config.maxPlayersPerRoom ||
      !config.roundLength ||
      !config.maxRounds ||
      !config.productCost ||
      !config.maxProduction ||
      !config.marketPrice ||
      !config.totalMarketProduction
    ) {
      throw new Error("Invalid game configs");
    }
    this.gameConfigs = config;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // override the onPlayerJoin method specifically for the CournotGame
  // TODO: figure out how to make this method synchronous
  ///////////////////////////////////////////////////////////////////////////////
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

      // this is the main room id, but should check in case this is redundant
      socket.roomId = this.roomId;
    } else {
      let tempRoomId = this.roomId + "_" + this.breakoutRoomCount;
      if (
        (await this.countSocketsInRoom(tempRoomId)) >=
        (this.gameConfigs as CournotGameConfigs).maxPlayersPerRoom
      ) {
        this.breakoutRoomCount++;
        tempRoomId = this.roomId + "_" + this.breakoutRoomCount;
        socket.join(tempRoomId);
      } else {
        socket.join(tempRoomId);
      }
      const player = new Student(socket, userId, username, tempRoomId);

      // set the room map
      if (!this.roomMap.has(tempRoomId)) {
        this.roomMap.set(tempRoomId, {
          users: [player],
          userMoves: new Map(),
          roundNo: 0,
          roundHistory: new Map(),
        });
      } else {
        this.roomMap.get(tempRoomId)?.users.push(player);
      }

      // set the player map
      this.players.set(userId, player);
      this.playerCount++;

      // set the breakout room ids
      this.breakoutRoomIds.push(tempRoomId);

      socket.roomId = tempRoomId;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////
  // on player move, set the player's move, and set the move in the breakout room
  ///////////////////////////////////////////////////////////////////////////////
  onPlayerMove(socket: Socket, action: string): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player not found");
      return;
    }

    if (player instanceof Instructor) {
      console.error("Instructors can not move");
      return;
    }

    player.setUserMove(action);

    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error("Breakout room not found");
      return;
    }

    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error("Room data not found");
      return;
    }

    roomData.userMoves.set(player, action);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // send the opponent move to the socket instance
  ///////////////////////////////////////////////////////////////////////////////
  sendOpponentMove(socket: Socket): void {}

  ///////////////////////////////////////////////////////////////////////////////
  // return all the player moves in the breakout room to the socket instance
  ///////////////////////////////////////////////////////////////////////////////
  returnAllPlayerMoves(socket: Socket): void {
    const player = this.players.get(socket.userId);

    if (!player) {
      console.error("Player not found");
      return;
    }

    /**
     *
     * Two cases: Instructor or Student
     *
     * Instructor:
     *  - return all moves from all breakout rooms
     *
     * Student:
     *  - return all moves from the breakout room the student is in
     *
     * Needs to be refined more , just a quick implementation for now
     * eg make data consistent for the frontend
     *
     */
    if (player instanceof Instructor) {
      socket.emit("server:allPlayerMoves", this.roomMap);
    } else {
      const breakoutRoomId = (player as Student).getBreakoutRoomId();
      if (!breakoutRoomId) {
        console.error("Breakout room not found");
        return;
      }
      const roomData = this.roomMap.get(breakoutRoomId);
      if (!roomData) {
        console.error(
          `Room data not found for breakout room: ${breakoutRoomId}`
        );
      }
      socket.emit("server:currentRoomMoves", roomData);
    }
  }
}
