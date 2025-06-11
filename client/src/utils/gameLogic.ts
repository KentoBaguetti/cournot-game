import { Player } from '../types/game';

export const calculateCournotProfits = (
  players: Player[],
  baseDemand: number,
  marginalCost: number
): Player[] => {
  const totalQuantity = players.reduce((sum, player) => sum + (player.quantity || 0), 0);
  const marketPrice = Math.max(0, baseDemand - totalQuantity);

  return players.map(player => ({
    ...player,
    profit: player.quantity ? (marketPrice - marginalCost) * player.quantity : 0
  }));
};

export const generateGameCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};