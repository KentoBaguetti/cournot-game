import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Home } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useGameContext } from '../contexts/GameContext';

export const StudentJoin: React.FC = () => {
  const navigate = useNavigate();
  const { socket, state, dispatch } = useGameContext();
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinGame = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter both game code and your name' });
      return;
    }

    if (!socket.isConnected) {
      dispatch({ type: 'SET_ERROR', payload: 'Not connected to game server. Please try again.' });
      return;
    }

    setIsJoining(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    // Set up one-time listener for join response
    const cleanup = socket.on('game:joined', (data) => {
      setIsJoining(false);
      if (data.success) {
        // Create player object
        const player = {
          id: Math.random().toString(36).substr(2, 9),
          name: playerName,
          isReady: false,
        };
        
        dispatch({ type: 'SET_PLAYER', payload: player });
        
        // Navigate to game room
        navigate('/game/room', { 
          state: { 
            gameCode: gameCode.toUpperCase(), 
            playerName,
            playerId: player.id
          } 
        });
      }
      cleanup(); // Remove the listener after handling
    });

    // Join the game
    socket.joinGame(gameCode.toUpperCase(), playerName);

    // Set timeout for join attempt
    setTimeout(() => {
      if (isJoining) {
        setIsJoining(false);
        dispatch({ type: 'SET_ERROR', payload: 'Join request timed out. Please try again.' });
        cleanup();
      }
    }, 10000);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Game</h1>
          <p className="text-gray-600">
            Enter the game code provided by your instructor and your name to join the session.
          </p>
        </div>

        <Card>
          <form onSubmit={(e) => { e.preventDefault(); handleJoinGame(); }} className="space-y-6">
            <Input
              label="Game Code"
              value={gameCode}
              onChange={(value) => setGameCode(value.toUpperCase())}
              placeholder="Enter 6-character code"
              required
              className="text-center text-lg font-mono tracking-widest"
            />

            <Input
              label="Your Name"
              value={playerName}
              onChange={setPlayerName}
              placeholder="Enter your name"
              required
            />

            {/* Connection Status */}
            <div className={`flex items-center space-x-2 p-3 rounded-xl ${
              socket.isConnected 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                socket.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                socket.isConnected ? 'text-green-700' : 'text-red-700'
              }`}>
                {socket.isConnected ? 'Connected to game server' : 'Connecting to game server...'}
              </span>
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                variant="success"
                size="lg"
                icon={ArrowRight}
                disabled={isJoining || !socket.isConnected}
                className="w-full"
              >
                {isJoining ? 'Joining Game...' : 'Join Game'}
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                size="md"
                icon={Home}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Ask your instructor for the 6-character game code. Make sure to enter it exactly as shown.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};