import { Server } from "socket.io";
import { BaseGame } from "./games/BaseGame";
import { CournotGame } from "./games/CournotGame";
import { TestGame } from "./games/TestGame";
import { JanKenPoGame } from "./games/JanKenPoGame";

// factory class for games

export class GameFactory {
  static createGame(
    type: string,
    roomId: string,
    io: Server,
    hostId: string
  ): BaseGame {
    switch (type) {
      case "cournot":
        return new CournotGame(roomId, io, hostId);
      case "testgame":
        return new TestGame(roomId, io, hostId);
      case "jankenpo":
        return new JanKenPoGame(roomId, io, hostId);
      default:
        throw new Error("Unknown game");
    }
  }
}
