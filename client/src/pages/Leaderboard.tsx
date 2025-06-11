import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowRight, Home } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/gameLogic';

interface LeaderboardData {
  roundNumber: number;
  players: Array<{
    id: string;
    name: string;
    quantity: number;
    profit: number;
    totalProfit: number;
    rank: number;
  }>;
  marketPrice: number;
  totalQuantity: number;
  isGameComplete: boolean;
}

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock data - in real app, this would come from backend
  const data: LeaderboardData = location.state?.data || {
    roundNumber: 1,
    players: [
      { id: '1', name: 'Alice', quantity: 25, profit: 1875, totalProfit: 1875, rank: 1 },
      { id: '2', name: 'You', quantity: 30, profit: 1500, totalProfit: 1500, rank: 2 },
      { id: '3', name: 'Bob', quantity: 35, profit: 1225, totalProfit: 1225, rank: 3 },
      { id: '4', name: 'Charlie', quantity: 20, profit: 1600, totalProfit: 1600, rank: 4 },
    ],
    marketPrice: 35,
    totalQuantity: 110,
    isGameComplete: false,
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</div>;
    }
  };

  const handleNextRound = () => {
    if (data.isGameComplete) {
      navigate('/');
    } else {
      navigate('/game/room', { 
        state: location.state?.gameState 
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {data.isGameComplete ? 'Final Results' : `Round ${data.roundNumber} Results`}
          </h1>
          <p className="text-gray-600">
            {data.isGameComplete 
              ? 'Thank you for playing the Cournot Competition Game!'
              : 'See how you performed this round and prepare for the next one.'
            }
          </p>
        </div>

        {/* Market Summary */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Market Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(data.marketPrice)}</div>
              <p className="text-gray-600">Market Price</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{data.totalQuantity}</div>
              <p className="text-gray-600">Total Quantity</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(data.players.reduce((sum, p) => sum + p.profit, 0))}
              </div>
              <p className="text-gray-600">Total Industry Profit</p>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Player Rankings</h2>
          <div className="space-y-4">
            {data.players
              .sort((a, b) => b.totalProfit - a.totalProfit)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    player.name === 'You'
                      ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index + 1)}
                    <div>
                      <h3 className={`font-semibold ${
                        player.name === 'You' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {player.name}
                        {player.name === 'You' && ' (You)'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {player.quantity} units
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      player.name === 'You' ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {formatCurrency(player.profit)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Total: {formatCurrency(player.totalProfit)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Strategic Insights */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Strategic Insights</h2>
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Key Observations:</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• The market price was {formatCurrency(data.marketPrice)} with total quantity of {data.totalQuantity}</li>
              <li>• Players who chose lower quantities generally earned higher profits per unit</li>
              <li>• The Nash equilibrium for this market would be around 30 units per player</li>
              {!data.isGameComplete && (
                <li>• Consider adjusting your strategy for the next round based on competitors' behavior</li>
              )}
            </ul>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            size="lg"
            icon={Home}
          >
            Exit Game
          </Button>
          <Button
            onClick={handleNextRound}
            variant={data.isGameComplete ? 'primary' : 'success'}
            size="lg"
            icon={ArrowRight}
          >
            {data.isGameComplete ? 'Play Again' : 'Next Round'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};