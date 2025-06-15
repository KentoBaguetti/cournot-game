import { Socket } from "socket.io";

export class Instructor {
  protected disconnected: boolean = false;
  protected nickname: string;

  constructor(
    protected socket: Socket,
    public userId: string,
    nickname: string = "Instructor"
  ) {
    this.nickname = nickname;
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
}
