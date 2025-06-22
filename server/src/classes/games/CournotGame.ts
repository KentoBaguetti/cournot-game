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

  // on player move, set the player's move, and set the move in the breakout room
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

  sendOpponentMove(socket: Socket): void {}

  // return all the player moves in the breakout room to the socket instance
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
