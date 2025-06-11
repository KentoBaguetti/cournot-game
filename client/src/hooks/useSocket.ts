import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
  type: string;
  payload: any;
}

export interface GameEvents {
  // Game management
  'game:created': { gameCode: string; gameId: string };
  'game:joined': { success: boolean; message?: string; roomId?: string };
  'game:started': { gameId: string };
  'game:ended': { gameId: string; finalResults: any };
  
  // Room management
  'room:created': { roomId: string; roomName: string };
  'room:joined': { roomId: string; players: any[] };
  'room:left': { roomId: string; playerId: string };
  'room:updated': { roomId: string; players: any[] };
  
  // Round management
  'round:started': { roundNumber: number; timeLimit: number };
  'round:ended': { roundNumber: number; results: any };
  'round:force_ended': { roundNumber: number };
  
  // Player actions
  'player:joined': { playerId: string; playerName: string; roomId: string };
  'player:ready': { playerId: string; isReady: boolean };
  'player:production_submitted': { playerId: string; quantity: number };
  'player:disconnected': { playerId: string };
  
  // Real-time updates
  'market:updated': { totalProduction: number; marketPrice: number };
  'leaderboard:updated': { rankings: any[] };
  'timer:update': { timeLeft: number };
  
  // Error handling
  'error': { message: string; code?: string };
}

export const useSocket = (serverUrl?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const eventListeners = useRef<Map<string, Function[]>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    const url = serverUrl || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Connected to game server');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from game server:', reason);
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  // Generic event listener
  const on = useCallback(<T extends keyof GameEvents>(
    event: T,
    callback: (data: GameEvents[T]) => void
  ) => {
    if (!socketRef.current) return;

    const listeners = eventListeners.current.get(event) || [];
    listeners.push(callback);
    eventListeners.current.set(event, listeners);

    socketRef.current.on(event, callback);

    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
      const currentListeners = eventListeners.current.get(event) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) {
        currentListeners.splice(index, 1);
        eventListeners.current.set(event, currentListeners);
      }
    };
  }, []);

  // Generic event emitter
  const emit = useCallback(<T extends keyof GameEvents>(
    event: T,
    data: GameEvents[T]
  ) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  // Game-specific methods
  const createGame = useCallback((gameConfig: any) => {
    emit('game:create', gameConfig);
  }, [emit]);

  const joinGame = useCallback((gameCode: string, playerName: string) => {
    emit('game:join', { gameCode, playerName });
  }, [emit]);

  const startGame = useCallback((gameId: string) => {
    emit('game:start', { gameId });
  }, [emit]);

  const submitProduction = useCallback((quantity: number) => {
    emit('player:production_submit', { quantity });
  }, [emit]);

  const setPlayerReady = useCallback((isReady: boolean) => {
    emit('player:ready', { isReady });
  }, [emit]);

  const forceEndRound = useCallback((roomId?: string) => {
    emit('round:force_end', { roomId });
  }, [emit]);

  const createRoom = useCallback((roomName: string, maxPlayers: number) => {
    emit('room:create', { roomName, maxPlayers });
  }, [emit]);

  return {
    isConnected,
    connectionError,
    socket: socketRef.current,
    
    // Event handlers
    on,
    emit,
    
    // Game methods
    createGame,
    joinGame,
    startGame,
    submitProduction,
    setPlayerReady,
    forceEndRound,
    createRoom,
  };
};