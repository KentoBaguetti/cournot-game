import { Server } from "socket.io";
import { BaseGame } from "./games/BaseGame";
import { CournotGame } from "./games/CournotGame";
import { TestGame } from "./games/TestGame";

// factory class for games

export class GameFactory {
  static createGame(type: string, roomId: string, io: Server): BaseGame {
    switch (type) {
      case "cournot":
        return new CournotGame(roomId, io);
      case "testgame":
        return new TestGame(roomId, io);
      default:
        throw new Error("Unknown game");
    }
  }
}
