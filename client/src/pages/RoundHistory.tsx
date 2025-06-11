import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';

interface GameState {
  gameCode: string;
  playerName: string;
  playerId: string;
}

interface RoundData {
  round: number;
  totalProduction: number;
  yourProduction: number;
  barrelPrice: number;
  costPerBarrel: number;
  yourProfit: number;
}

export const RoundHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameState = location.state?.gameState as GameState;

  // Mock historical data - in real app, this comes from backend
  const historyData: RoundData[] = [
    { round: 1, totalProduction: 14, yourProduction: 5, barrelPrice: 16, costPerBarrel: 6, yourProfit: 50 },
    { round: 2, totalProduction: 9, yourProduction: 0, barrelPrice: 21, costPerBarrel: 6, yourProfit: 0 },
    { round: 3, totalProduction: 0, yourProduction: 0, barrelPrice: 0, costPerBarrel: 6, yourProfit: 0 },
    { round: 4, totalProduction: 0, yourProduction: 0, barrelPrice: 0, costPerBarrel: 6, yourProfit: 0 },
  ];

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
      {/* Header */}
      <div className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">History</h1>
                  <p className="text-blue-200 text-sm">{gameState.playerName}'s Performance</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate('/game/room', { state: gameState })}
              variant="secondary"
              icon={ArrowLeft}
              size="sm"
            >
              Back to Game
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Oil barrel decorations */}
        <div className="flex items-center mb-8">
          <div className="flex space-x-2 mr-4">
            <div className="w-12 h-16 bg-blue-600 rounded-lg border-4 border-blue-800 relative">
              <div className="absolute top-1 left-1 w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="w-16 h-20 bg-blue-600 rounded-lg border-4 border-blue-800 relative">
              <div className="absolute top-1 left-1 w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white">History</h2>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="grid grid-cols-6 gap-4 p-6">
              <div className="text-center">
                <div className="bg-blue-400 rounded-xl px-4 py-2 font-bold">Round</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-400 rounded-xl px-4 py-2 font-bold">Total Production</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-400 rounded-xl px-4 py-2 font-bold">Your Production</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-400 rounded-xl px-4 py-2 font-bold">Barrel Price</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-400 rounded-xl px-4 py-2 font-bold">Cost Per Barrel</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-400 rounded-xl px-4 py-2 font-bold">Your Profit</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {historyData.map((round, index) => (
              <div 
                key={round.round}
                className={`grid grid-cols-6 gap-4 p-6 transition-colors hover:bg-gray-50 ${
                  round.totalProduction === 0 ? 'opacity-50' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{round.round}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {round.totalProduction || '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {round.yourProduction || '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {round.barrelPrice ? `$${round.barrelPrice}` : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {round.costPerBarrel ? `$${round.costPerBarrel}` : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    round.yourProfit > 0 ? 'text-green-600' : 'text-gray-800'
                  }`}>
                    {round.yourProfit ? `$${round.yourProfit}` : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${historyData.reduce((sum, round) => sum + round.yourProfit, 0)}
            </div>
            <p className="text-gray-600 font-semibold">Total Profit</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(historyData.reduce((sum, round) => sum + round.yourProduction, 0) / historyData.filter(r => r.totalProduction > 0).length) || 0}
            </div>
            <p className="text-gray-600 font-semibold">Avg Production</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {historyData.filter(r => r.yourProfit > 0).length}
            </div>
            <p className="text-gray-600 font-semibold">Profitable Rounds</p>
          </div>
        </div>
      </div>
    </div>
  );
};