export interface UserData {
  nickname: string;
  lastRoom?: string;
}

export interface RoomData {
  gameType: string;
  players: Set<string>;
}

export interface TokenPayload {
  userId: string;
  username: string;
  lastRoom?: string;
}
