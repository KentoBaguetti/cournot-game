export interface UserData {
  nickname: string;
  lastRoom?: string;
}

export interface RoomData {
  gameType: string;
  players: Set<string>;
}
