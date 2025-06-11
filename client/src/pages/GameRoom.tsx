import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Users, Home, History } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Slider } from '../components/Slider';
import { DemandCurve } from '../components/DemandCurve';
import { EndOfRoundModal } from '../components/EndOfRoundModal';
import { useGameContext } from '../contexts/GameContext';

interface GameState {
  gameCode: string;
  playerName: string;
  playerId: string;
}

export const GameRoom: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, socket } = useGameContext();
  const gameState = location.state as GameState;

  const [yourProduction, setYourProduction] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Game settings
  const costPerBarrel = 6;
  const maxProduction = 15;
  const totalCompanies = 2;
  const baseDemand = 30;

  // Use real-time data from context
  const totalProduction = state.marketData.totalProduction || 1;
  const currentPrice = state.marketData.marketPrice || Math.max(0, baseDemand - totalProduction);
  const timeLeft = state.timeLeft;
  const currentRound = state.currentRound || 1;

  const [roomPlayers] = useState([
    { id: '1', name: 'Alice', isReady: true },
    { id: '2', name: gameState?.playerName || 'You', isReady: isSubmitted },
  ]);

  // Optimize production change handler
  const handleProductionChange = useCallback((newValue: number) => {
    setYourProduction(newValue);
    
    // Emit real-time production update (for live market updates)
    if (socket.isConnected) {
      socket.emit('player:production_preview', { quantity: newValue });
    }
  }, [socket]);

  useEffect(() => {
    if (!gameState) {
      navigate('/');
      return;
    }

    // Set up socket listeners for game events
    const cleanupFunctions: (() => void)[] = [];

    if (socket.isConnected) {
      // Listen for round end
      cleanupFunctions.push(
        socket.on('round:ended', (data) => {
          setShowEndModal(true);
        })
      );

      // Listen for forced round end
      cleanupFunctions.push(
        socket.on('round:force_ended', () => {
          if (!isSubmitted) {
            handleSubmitProduction();
          }
        })
      );

      // Listen for timer updates
      cleanupFunctions.push(
        socket.on('timer:update', (data) => {
          if (data.timeLeft <= 0 && !isSubmitted) {
            handleSubmitProduction();
          }
        })
      );
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [gameState, navigate, isSubmitted, socket]);

  const handleSubmitProduction = () => {
    if (isSubmitted || !socket.isConnected) return;
    
    setIsSubmitted(true);
    
    // Submit production to server
    socket.submitProduction(yourProduction);
    socket.setPlayerReady(true);
  };

  const handleNextRound = () => {
    setShowEndModal(false);
    if (currentRound >= 5) {
      navigate('/game/leaderboard', { 
        state: { 
          data: { isGameComplete: true },
          gameState 
        } 
      });
    } else {
      setIsSubmitted(false);
      setYourProduction(0);
      socket.setPlayerReady(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
      {/* Background oil derricks */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-20 w-32 h-32 bg-black/20 transform rotate-12"></div>
        <div className="absolute right-20 top-32 w-24 h-24 bg-black/20 transform -rotate-12"></div>
        <div className="absolute left-1/3 bottom-20 w-28 h-28 bg-black/20 transform rotate-6"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-700 rounded-xl px-4 py-2">
                <h1 className="text-2xl font-bold">Oil Production</h1>
              </div>
              <div className="text-blue-200">
                Round {currentRound} • {gameState.playerName}
              </div>
              {/* Connection Status */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                socket.isConnected 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {socket.isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 ${
                timeLeft > 30 
                  ? 'bg-green-500 text-white' 
                  : timeLeft > 10 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <Button
                onClick={() => navigate('/game/history', { state: { gameState } })}
                variant="secondary"
                icon={History}
                size="sm"
              >
                History
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                icon={Home}
                size="sm"
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Game Info */}
          <div className="space-y-6">
            {/* Game Parameters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-3 mb-2">
                    <div className="text-sm text-blue-600 font-semibold">Per Barrel Cost</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">${costPerBarrel}</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-3 mb-2">
                    <div className="text-sm text-blue-600 font-semibold">Maximum Production</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{maxProduction}</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-3 mb-2">
                    <div className="text-sm text-blue-600 font-semibold">Total Companies</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{totalCompanies}</div>
                </div>
              </div>
            </div>

            {/* Players Status */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Players ({roomPlayers.filter(p => p.isReady).length}/{roomPlayers.length} Ready)
              </h3>
              <div className="space-y-3">
                {roomPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      player.name === gameState.playerName
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${
                      player.name === gameState.playerName ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {player.name}
                      {player.name === gameState.playerName && ' (You)'}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      player.isReady ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel - Production Control */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Production</h2>
              <div className="text-6xl font-bold mb-4">Barrel: {yourProduction}</div>
            </div>

            {!isSubmitted ? (
              <div className="space-y-8">
                <Slider
                  value={yourProduction}
                  onChange={handleProductionChange}
                  min={0}
                  max={maxProduction}
                  className="mb-8"
                />

                <Button
                  onClick={handleSubmitProduction}
                  variant="success"
                  size="lg"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 text-xl"
                  disabled={timeLeft === 0 || !socket.isConnected}
                >
                  {!socket.isConnected ? 'Disconnected' : 'Produce'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Production Submitted!</h3>
                <p className="text-white/80 mb-4">
                  You chose to produce <span className="font-bold">{yourProduction}</span> barrels
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-sm">Waiting for other players...</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Demand Curve */}
          <div>
            <DemandCurve
              totalProduction={totalProduction}
              maxProduction={maxProduction * totalCompanies}
              baseDemand={baseDemand}
              currentPrice={currentPrice}
            />
          </div>
        </div>
      </div>

      {/* End of Round Modal */}
      <EndOfRoundModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        roundData={{
          roundNumber: currentRound,
          totalProduction: totalProduction,
          yourProduction: yourProduction,
          barrelPrice: currentPrice,
          costPerBarrel: costPerBarrel,
          yourProfit: Math.max(0, (currentPrice - costPerBarrel) * yourProduction),
          isLastRound: currentRound >= 5,
        }}
        onNextRound={handleNextRound}
      />
    </div>
  );
};