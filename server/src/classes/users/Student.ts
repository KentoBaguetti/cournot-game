import { nextTick } from "process";
import { Socket } from "socket.io";

export class Student {
  protected disconnected: boolean = false;
  protected userMove: string = "";
  private ready: boolean = false;

  constructor(
    protected socket: Socket,
    public userId: string,
    protected nickname: string = "Guest",
    public breakoutRoomId: string = ""
  ) {}

  public setNickName(nickname: string): void {
    this.nickname = nickname;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public getUserId(): string {
    return this.userId;
  }

  public updateSocket(socket: Socket): void {
    this.socket = socket;
  }

  public getSocket(): Socket {
    return this.socket;
  }

  public setDisconnected(status: boolean): void {
    this.disconnected = status;
  }

  public isDisconnected(): boolean {
    return this.disconnected;
  }

  public setUserMove(move: string): void {
    this.userMove = move;
  }

  public getUserMove(): string {
    return this.userMove;
  }

  public setReady(isReady: boolean): void {
    this.ready = isReady;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public setBreakoutRoomId(breakoutRoomId: string): void {
    this.breakoutRoomId = breakoutRoomId;
  }

  public getBreakoutRoomId(): string {
    return this.breakoutRoomId;
  }
}
