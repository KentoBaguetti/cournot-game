import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Play, Pause, SkipForward, Plus, Settings, BarChart3 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Game, Room } from '../types/game';
import { useGameContext } from '../contexts/GameContext';

export const InstructorManage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useGameContext();
  const game = location.state?.game as Game;

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Room A',
      players: [
        { id: '1', name: 'Alice', quantity: 8, isReady: true },
        { id: '2', name: 'Bob', quantity: undefined, isReady: false },
        { id: '3', name: 'Charlie', quantity: 12, isReady: true },
      ],
      maxPlayers: 4,
      currentRound: 1,
      isActive: true,
    },
    {
      id: '2',
      name: 'Room B',
      players: [
        { id: '4', name: 'David', quantity: undefined, isReady: false },
        { id: '5', name: 'Eve', quantity: 6, isReady: true },
      ],
      maxPlayers: 4,
      currentRound: 1,
      isActive: true,
    },
  ]);

  useEffect(() => {
    if (!socket.isConnected || !game) return;

    // Set up socket listeners for real-time room updates
    const cleanupFunctions: (() => void)[] = [];

    cleanupFunctions.push(
      socket.on('room:updated', (data) => {
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === data.roomId 
              ? { ...room, players: data.players }
              : room
          )
        );
      })
    );

    cleanupFunctions.push(
      socket.on('player:joined', (data) => {
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === data.roomId 
              ? { 
                  ...room, 
                  players: [...room.players, { 
                    id: data.playerId, 
                    name: data.playerName, 
                    isReady: false 
                  }] 
                }
              : room
          )
        );
      })
    );

    cleanupFunctions.push(
      socket.on('player:production_submitted', (data) => {
        setRooms(prevRooms => 
          prevRooms.map(room => ({
            ...room,
            players: room.players.map(player => 
              player.id === data.playerId 
                ? { ...player, quantity: data.quantity, isReady: true }
                : player
            )
          }))
        );
      })
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [socket, game]);

  const createNewRoom = () => {
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Room ${String.fromCharCode(65 + rooms.length)}`,
      players: [],
      maxPlayers: 4,
      currentRound: 1,
      isActive: false,
    };

    if (socket.isConnected) {
      socket.createRoom(newRoom.name, newRoom.maxPlayers);
    }

    setRooms([...rooms, newRoom]);
  };

  const forceEndRound = (roomId: string) => {
    if (socket.isConnected) {
      socket.forceEndRound(roomId);
    }

    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, currentRound: room.currentRound + 1 }
        : room
    ));
  };

  const toggleRoomStatus = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    if (socket.isConnected) {
      socket.emit('room:toggle_status', { roomId, isActive: !room.isActive });
    }

    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, isActive: !room.isActive }
        : room
    ));
  };

  const forceEndAllRounds = () => {
    if (socket.isConnected) {
      socket.emit('game:force_end_all_rounds', { gameId: game?.id });
    }

    setRooms(rooms.map(room => ({
      ...room,
      currentRound: room.currentRound + 1
    })));
  };

  const endGame = () => {
    if (socket.isConnected) {
      socket.emit('game:end', { gameId: game?.id });
    }
    
    navigate('/instructor/dashboard');
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Button onClick={() => navigate('/instructor/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
      {/* Header */}
      <div className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Managing: {game.name}</h1>
                <p className="text-blue-200">
                  Game Code: <span className="font-mono font-bold text-white bg-blue-700 px-2 py-1 rounded">{game.code}</span> • 
                  Active Rooms: {rooms.filter(r => r.isActive).length}
                </p>
              </div>
              {/* Connection Status */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                socket.isConnected 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {socket.isConnected ? 'Server Connected' : 'Server Disconnected'}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate('/instructor/dashboard')}
                variant="secondary"
                icon={ArrowLeft}
              >
                Back
              </Button>
              <Button
                onClick={() => navigate('/instructor/configure', { state: { game } })}
                variant="secondary"
                icon={Settings}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Game Controls</h2>
              <p className="text-gray-600">Manage the overall game flow and room creation</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={createNewRoom}
                variant="secondary"
                icon={Plus}
                disabled={!socket.isConnected}
              >
                New Room
              </Button>
              <Button
                onClick={forceEndAllRounds}
                variant="warning"
                icon={SkipForward}
                disabled={!socket.isConnected}
              >
                Force End All Rounds
              </Button>
              <Button
                onClick={endGame}
                variant="danger"
                disabled={!socket.isConnected}
              >
                End Game
              </Button>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600">
                    Round {room.currentRound} • {room.players.length}/{room.maxPlayers} players
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  room.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {room.isActive ? 'Active' : 'Paused'}
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-2 mb-4">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200"
                  >
                    <span className="font-medium text-gray-900">{player.name}</span>
                    <div className="flex items-center space-x-2">
                      {player.quantity !== undefined && (
                        <span className="text-sm text-orange-700 bg-orange-200 px-2 py-1 rounded">
                          Barrels: {player.quantity}
                        </span>
                      )}
                      <div className={`w-3 h-3 rounded-full ${
                        player.isReady ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                ))}
                {room.players.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No players in this room</p>
                )}
              </div>

              {/* Room Controls */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => toggleRoomStatus(room.id)}
                  variant={room.isActive ? "secondary" : "success"}
                  size="sm"
                  icon={room.isActive ? Pause : Play}
                  className="flex-1"
                  disabled={!socket.isConnected}
                >
                  {room.isActive ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  onClick={() => forceEndRound(room.id)}
                  variant="warning"
                  size="sm"
                  icon={SkipForward}
                  className="flex-1"
                  disabled={!room.isActive || !socket.isConnected}
                >
                  Force End Round
                </Button>
              </div>

              {/* Ready Status */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Players Ready:</span>
                  <span className="font-semibold">
                    {room.players.filter(p => p.isReady).length}/{room.players.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${room.players.length > 0 ? (room.players.filter(p => p.isReady).length / room.players.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Statistics */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Game Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {rooms.reduce((sum, room) => sum + room.players.length, 0)}
              </div>
              <p className="text-gray-600">Total Players</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {rooms.filter(r => r.isActive).length}
              </div>
              <p className="text-gray-600">Active Rooms</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.round(rooms.reduce((sum, room) => sum + room.currentRound, 0) / rooms.length) || 0}
              </div>
              <p className="text-gray-600">Average Round</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {rooms.reduce((sum, room) => sum + room.players.filter(p => p.isReady).length, 0)}
              </div>
              <p className="text-gray-600">Ready Players</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};