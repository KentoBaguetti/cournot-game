import { Socket } from "socket.io";

export interface Player {
  id: string;
  socket: Socket;
  nickname: string;
}

export interface Instructor {
  id: string;
  socket: Socket;
}
