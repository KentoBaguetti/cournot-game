import { Server } from "socket.io";
import { BaseGame } from "./games/BaseGame";
import { CournotGame } from "./games/CournotGame";
import { TestGame } from "./games/TestGame";
import { JanKenPoGame } from "./games/JanKenPoGame";
import { GameConfigs } from "../types/types";

// factory class for games

export class GameFactory {
  static createGame(
    type: string,
    roomId: string,
    io: Server,
    hostId: string,
    gameConfigs: GameConfigs
  ): BaseGame {
    switch (type) {
      case "cournot":
        return new CournotGame(roomId, io, hostId, gameConfigs);
      case "testgame":
        return new TestGame(roomId, io, hostId, gameConfigs);
      case "jankenpo":
        return new JanKenPoGame(roomId, io, hostId, gameConfigs);
      default:
        throw new Error("Unknown game");
    }
  }
}
