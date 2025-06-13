export interface UserData {
  nickname: string;
  lastRoom?: string;
}

export interface RoomData {
  players: Set<string>;
}
