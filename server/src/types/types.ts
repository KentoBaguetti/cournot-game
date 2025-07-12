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

export interface PlayerRoundHistoryItem {
  round: number;
  totalProduction: number;
  yourProduction: number;
  marketPrice: number;
  costPerBarrel: number;
  yourProfit: number;
}

export interface BreakoutRoomData {
  users: Student[]; // since only students will be playing
  userMoves: Map<Student, string | number>; // student : move
  userReadyMap: Map<Student, boolean>;
  roundNo: number;
  roundHistory: Map<number, Map<Student, Map<string, number | string>>>; // stored info for each user roundNo : Student : quantity/move name : value
  roomHistory: Map<number, Map<string, number | string>>; // stored info for each room roundNo : total production, market price, cost per unit, your profit
  playerRoundHistory: Map<string, PlayerRoundHistoryItem[]>; // userId : array of round history items
  timerActive: boolean;
  remainingTime: number;
  timerInterval?: NodeJS.Timeout;
}

export interface GameConfigs {}

export interface JankenPoGameConfigs extends GameConfigs {
  maxPlayersPerRoom: number;
  roundLength: number;
  maxRounds: number;
}

/**
 * Game configs for the Cournot Game | These are values set by the instructor
 * x, y, z are just coefficients for the price and cost functions, they do not have specific names (should default to 1)
 */
export interface CournotGameConfigs extends GameConfigs {
  maxPlayersPerRoom: number;
  maxRounds: number;
  roundLength: number; // in seconds
  x: number; // demand intercept
  y: number; // sunk cost
  z: number; // cost per product
}
