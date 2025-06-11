export interface Player {
  id: string;
  name: string;
  quantity?: number;
  profit?: number;
  isReady: boolean;
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  currentRound: number;
  isActive: boolean;
}

export interface Game {
  id: string;
  code: string;
  name: string;
  rooms: Room[];
  settings: GameSettings;
  status: 'waiting' | 'active' | 'ended';
  currentRound: number;
  maxRounds: number;
}

export interface GameSettings {
  maxPrice: number;
  baseDemand: number;
  marginalCost: number;
  roundDuration: number; // in seconds
  autoAdvance: boolean;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalProfit: number;
  roundProfits: number[];
  averageProfit: number;
  rank: number;
}