// abstract class
import { Socket, Server } from "socket.io";

export abstract class BaseGame {
  // instance variables
  public players: Map<string, Socket> = new Map();

  // constructor
  constructor(public roomId: string, protected io: Server) {}

  // basic abstract methods for every game
  abstract onPlayerJoin(socket: Socket): void;
  abstract onPlayerMove(socket: Socket): void;
  abstract onPlayerDisconnect(socket: Socket): void;
}
