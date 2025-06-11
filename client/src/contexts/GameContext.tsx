import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Game, Room, Player } from '../types/game';

interface GameState {
  currentGame: Game | null;
  currentRoom: Room | null;
  currentPlayer: Player | null;
  isInGame: boolean;
  gameStatus: 'waiting' | 'active' | 'ended';
  currentRound: number;
  timeLeft: number;
  marketData: {
    totalProduction: number;
    marketPrice: number;
  };
  leaderboard: any[];
  error: string | null;
}

type GameAction =
  | { type: 'SET_GAME'; payload: Game }
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'UPDATE_GAME_STATUS'; payload: 'waiting' | 'active' | 'ended' }
  | { type: 'UPDATE_ROUND'; payload: number }
  | { type: 'UPDATE_TIMER'; payload: number }
  | { type: 'UPDATE_MARKET'; payload: { totalProduction: number; marketPrice: number } }
  | { type: 'UPDATE_LEADERBOARD'; payload: any[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  currentGame: null,
  currentRoom: null,
  currentPlayer: null,
  isInGame: false,
  gameStatus: 'waiting',
  currentRound: 0,
  timeLeft: 0,
  marketData: {
    totalProduction: 0,
    marketPrice: 0,
  },
  leaderboard: [],
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
        isInGame: true,
        error: null,
      };
    case 'SET_ROOM':
      return {
        ...state,
        currentRoom: action.payload,
      };
    case 'SET_PLAYER':
      return {
        ...state,
        currentPlayer: action.payload,
      };
    case 'UPDATE_GAME_STATUS':
      return {
        ...state,
        gameStatus: action.payload,
      };
    case 'UPDATE_ROUND':
      return {
        ...state,
        currentRound: action.payload,
      };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timeLeft: action.payload,
      };
    case 'UPDATE_MARKET':
      return {
        ...state,
        marketData: action.payload,
      };
    case 'UPDATE_LEADERBOARD':
      return {
        ...state,
        leaderboard: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  socket: ReturnType<typeof useSocket>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const socket = useSocket();

  useEffect(() => {
    if (!socket.isConnected) return;

    // Set up socket event listeners
    const cleanupFunctions: (() => void)[] = [];

    // Game events
    cleanupFunctions.push(
      socket.on('game:joined', (data) => {
        if (data.success) {
          dispatch({ type: 'SET_ERROR', payload: null });
        } else {
          dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to join game' });
        }
      })
    );

    cleanupFunctions.push(
      socket.on('game:started', () => {
        dispatch({ type: 'UPDATE_GAME_STATUS', payload: 'active' });
      })
    );

    cleanupFunctions.push(
      socket.on('game:ended', () => {
        dispatch({ type: 'UPDATE_GAME_STATUS', payload: 'ended' });
      })
    );

    // Round events
    cleanupFunctions.push(
      socket.on('round:started', (data) => {
        dispatch({ type: 'UPDATE_ROUND', payload: data.roundNumber });
        dispatch({ type: 'UPDATE_TIMER', payload: data.timeLimit });
      })
    );

    cleanupFunctions.push(
      socket.on('round:ended', (data) => {
        // Handle round end results
        console.log('Round ended:', data);
      })
    );

    // Real-time updates
    cleanupFunctions.push(
      socket.on('market:updated', (data) => {
        dispatch({ type: 'UPDATE_MARKET', payload: data });
      })
    );

    cleanupFunctions.push(
      socket.on('leaderboard:updated', (data) => {
        dispatch({ type: 'UPDATE_LEADERBOARD', payload: data.rankings });
      })
    );

    cleanupFunctions.push(
      socket.on('timer:update', (data) => {
        dispatch({ type: 'UPDATE_TIMER', payload: data.timeLeft });
      })
    );

    // Error handling
    cleanupFunctions.push(
      socket.on('error', (data) => {
        dispatch({ type: 'SET_ERROR', payload: data.message });
      })
    );

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [socket]);

  return (
    <GameContext.Provider value={{ state, dispatch, socket }}>
      {children}
    </GameContext.Provider>
  );
};