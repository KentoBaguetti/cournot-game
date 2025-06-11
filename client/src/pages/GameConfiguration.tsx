import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Play, Settings } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Game, GameSettings } from '../types/game';

export const GameConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const game = location.state?.game as Game;

  const [settings, setSettings] = useState<GameSettings>(game?.settings || {
    maxPrice: 30,
    baseDemand: 30,
    marginalCost: 6,
    roundDuration: 60,
    autoAdvance: false,
  });

  const [gameInfo, setGameInfo] = useState({
    name: game?.name || 'Oil Production Game',
    maxRounds: game?.maxRounds || 5,
  });

  const handleSave = () => {
    // TODO: Save game configuration to backend
    navigate('/instructor/dashboard');
  };

  const handleStartGame = () => {
    // TODO: Start the game
    navigate('/instructor/manage', { state: { game: { ...game, settings, ...gameInfo } } });
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
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Game Configuration</h1>
                <p className="text-blue-200">Set up parameters for your oil production competition</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/instructor/dashboard')}
              variant="secondary"
              icon={ArrowLeft}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Game Information</h2>
            <div className="space-y-4">
              <Input
                label="Game Name"
                value={gameInfo.name}
                onChange={(value) => setGameInfo({ ...gameInfo, name: value })}
                placeholder="Enter game name"
                required
              />
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-700">Game Code</span>
                  <span className="text-2xl font-mono font-bold text-orange-600">{game.code}</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">Share this code with students to join</p>
              </div>

              <Input
                label="Maximum Rounds"
                type="number"
                value={gameInfo.maxRounds}
                onChange={(value) => setGameInfo({ ...gameInfo, maxRounds: parseInt(value) || 5 })}
                min={1}
                max={20}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Economic Parameters</h2>
            <div className="space-y-4">
              <Input
                label="Base Demand (Maximum Price)"
                type="number"
                value={settings.baseDemand}
                onChange={(value) => setSettings({ ...settings, baseDemand: parseInt(value) || 30 })}
                min={1}
                placeholder="30"
              />

              <Input
                label="Production Cost per Barrel"
                type="number"
                value={settings.marginalCost}
                onChange={(value) => setSettings({ ...settings, marginalCost: parseInt(value) || 6 })}
                min={0}
                placeholder="6"
              />

              <Input
                label="Round Duration (seconds)"
                type="number"
                value={settings.roundDuration}
                onChange={(value) => setSettings({ ...settings, roundDuration: parseInt(value) || 60 })}
                min={30}
                max={300}
                placeholder="60"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Game Preview</h2>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  P = {settings.baseDemand} - Q
                </div>
                <p className="text-sm text-orange-700">Demand Function</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  Cost = ${settings.marginalCost}
                </div>
                <p className="text-sm text-blue-700">Per Barrel Cost</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {settings.roundDuration}s
                </div>
                <p className="text-sm text-green-700">Per Round</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={handleSave}
            variant="secondary"
            icon={Save}
            size="lg"
          >
            Save Configuration
          </Button>
          <Button
            onClick={handleStartGame}
            variant="success"
            icon={Play}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
};