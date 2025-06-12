import { nextTick } from "process";
import { Socket } from "socket.io";

export class Student {
  userId: string;
  nickname: string;

  constructor(protected socket: Socket, nickname?: string) {
    this.userId = socket.id;
    this.nickname = nickname ?? "Guest";
  }

  public setNickName(nickname: string): void {
    this.nickname = nickname;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public getUserId(): string {
    return this.userId;
  }
}
