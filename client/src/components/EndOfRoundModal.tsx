import React from 'react';
import { X, Trophy, TrendingUp } from 'lucide-react';
import { Button } from './Button';

interface EndOfRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundData: {
    roundNumber: number;
    totalProduction: number;
    yourProduction: number;
    barrelPrice: number;
    costPerBarrel: number;
    yourProfit: number;
    isLastRound?: boolean;
  };
  onNextRound: () => void;
}

export const EndOfRoundModal: React.FC<EndOfRoundModalProps> = ({
  isOpen,
  onClose,
  roundData,
  onNextRound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">End of Round</h2>
          <div className="bg-white/20 rounded-full px-4 py-1 inline-block">
            <span className="text-white font-semibold">Round {roundData.roundNumber}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-sm text-white/80 mb-1">Total Production</div>
              <div className="bg-white rounded-xl p-3">
                <div className="text-2xl font-bold text-gray-800">{roundData.totalProduction}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/80 mb-1">Your Production</div>
              <div className="bg-white rounded-xl p-3">
                <div className="text-2xl font-bold text-gray-800">{roundData.yourProduction}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/80 mb-1">Barrel Price</div>
              <div className="bg-white rounded-xl p-3">
                <div className="text-2xl font-bold text-gray-800">${roundData.barrelPrice}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/80 mb-1">Cost Per Barrel</div>
              <div className="bg-white rounded-xl p-3">
                <div className="text-2xl font-bold text-gray-800">${roundData.costPerBarrel}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/80 mb-1">Your Profit</div>
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">${roundData.yourProfit}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={onNextRound}
            variant="success"
            size="lg"
            icon={roundData.isLastRound ? Trophy : TrendingUp}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8"
          >
            {roundData.isLastRound ? 'View Final Results' : 'Continue to Next Round'}
          </Button>
        </div>
      </div>
    </div>
  );
};