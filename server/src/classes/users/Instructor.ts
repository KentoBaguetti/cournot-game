import { Socket } from "socket.io";

export class Instructor {
  userId: string;

  constructor(protected socket: Socket) {
    this.userId = socket.id;
  }

  public getUserId(): string {
    return this.userId;
  }
}
