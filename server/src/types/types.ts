import { Student } from "../classes/users/Student";

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

export interface BreakoutRoomData {
  users: Student[]; // since only students will be playing
  roundNo: number;
  // roundHistory: string[]; add this later
}
