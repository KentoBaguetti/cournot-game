// abstract class
import { Socket, Server } from "socket.io";

export abstract class BaseGame {
  constructor(public roomId: string, protected io: Server) {}

  abstract onPlayerJoin(socket: Socket): void;
  abstract onPlayerMove(socket: Socket): void;
  abstract onPlayerDisconnect(socket: Socket): void;
}
