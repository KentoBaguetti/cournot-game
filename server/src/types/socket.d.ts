import { Socket } from "socket.io";

// Extend the Socket interface to include userId
declare module "socket.io" {
  interface Socket {
    userId?: string;
    username?: string;
    roomId?: string;
  }
}
