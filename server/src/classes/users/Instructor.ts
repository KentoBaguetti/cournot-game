import { Socket } from "socket.io";

export class Instructor {
  protected disconnected: boolean = false;
  protected nickname: string;
  public roomId: string;
  private ready: boolean = false;

  constructor(
    protected socket: Socket,
    public userId: string,
    nickname: string = "Instructor",
    roomId: string = ""
  ) {
    this.nickname = nickname;
    this.roomId = roomId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public setNickName(nickname: string): void {
    this.nickname = nickname;
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

  public setReady(isReady: boolean): void {
    this.ready = isReady;
  }

  public isReady(): boolean {
    return this.ready;
  }
}
