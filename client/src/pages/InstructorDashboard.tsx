import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Users, Play, Home, Copy, Check, BarChart3 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Game } from '../types/game';
import { generateGameCode } from '../utils/gameLogic';
import { useGameContext } from '../contexts/GameContext';

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { socket, dispatch } = useGameContext();
  const [games, setGames] = useState<Game[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const createNewGame = () => {
    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      code: generateGameCode(),
      name: `Oil Production Game ${games.length + 1}`,
      rooms: [],
      settings: {
        maxPrice: 30,
        baseDemand: 30,
        marginalCost: 6,
        roundDuration: 60,
        autoAdvance: false,
      },
      status: 'waiting',
      currentRound: 0,
      maxRounds: 5,
    };

    // Create game on server if connected
    if (socket.isConnected) {
      socket.createGame({
        gameId: newGame.id,
        gameCode: newGame.code,
        settings: newGame.settings,
        maxRounds: newGame.maxRounds,
      });

      // Listen for game creation confirmation
      const cleanup = socket.on('game:created', (data) => {
        console.log('Game created on server:', data);
        cleanup();
      });
    }

    setGames([...games, newGame]);
    navigate('/instructor/configure', { state: { game: newGame } });
  };

  const copyGameCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
                <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                <p className="text-blue-200">Create and manage your oil production competition games</p>
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
                onClick={() => navigate('/')}
                variant="secondary"
                icon={Home}
              >
                Home
              </Button>
              <Button
                onClick={createNewGame}
                variant="success"
                icon={Plus}
                className="bg-orange-500 hover:bg-orange-600"
                disabled={!socket.isConnected}
              >
                New Game
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!socket.isConnected && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Server Connection Required</h3>
                <p className="text-red-600 text-sm">
                  Please ensure your game server is running to create and manage games.
                </p>
              </div>
            </div>
          </div>
        )}

        {games.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Plus className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Games Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Create your first oil production competition game to get started. Configure 
              game parameters and manage student sessions with real-time analytics.
            </p>
            <Button
              onClick={createNewGame}
              variant="primary"
              icon={Plus}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              disabled={!socket.isConnected}
            >
              Create First Game
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {games.map((game) => (
              <div key={game.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      game.status === 'active' 
                        ? 'bg-gradient-to-br from-green-400 to-green-500' 
                        : game.status === 'waiting'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{game.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-mono font-bold">
                          Code: {game.code}
                        </span>
                        <span>•</span>
                        <span>{game.rooms.length} rooms</span>
                        <span>•</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          game.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : game.status === 'waiting'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {game.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => copyGameCode(game.code)}
                      variant="secondary"
                      size="sm"
                      icon={copiedCode === game.code ? Check : Copy}
                      className={copiedCode === game.code ? 'bg-green-100 text-green-700' : ''}
                    >
                      {copiedCode === game.code ? 'Copied!' : 'Copy Code'}
                    </Button>
                    <Button
                      onClick={() => navigate('/instructor/configure', { state: { game } })}
                      variant="secondary"
                      size="sm"
                      icon={Settings}
                    >
                      Configure
                    </Button>
                    <Button
                      onClick={() => navigate('/instructor/manage', { state: { game } })}
                      variant="primary"
                      size="sm"
                      icon={Users}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};