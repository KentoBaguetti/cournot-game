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
  userMoves: Map<Student, string>; // student : move
  roundNo: number;
  // roundHistory: string[]; add this later
}

export interface GameConfigs {}

export interface JankenPoGameConfigs extends GameConfigs {
  maxPlayersPerRoom: number;
  roundLength: number;
  maxRounds: number;
}
