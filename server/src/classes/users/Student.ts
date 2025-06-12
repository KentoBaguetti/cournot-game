import { Socket } from "socket.io";

export class Student {
  userId: string;

  constructor(protected socket: Socket) {
    this.userId = socket.id;
  }
}
