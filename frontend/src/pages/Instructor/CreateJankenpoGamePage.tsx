import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Settings } from "lucide-react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useSocket } from "../../socket";

export default function CreateJankenpoGamePage() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roundLength, setRoundLength] = useState(60);
  const [maxRounds, setMaxRounds] = useState(5);
  const [maxPlayersPerRoom, setMaxPlayersPerRoom] = useState(2);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleGameCreated = (data: { roomId: string }) => {
      setIsCreating(false);
      navigate("/instructor/gameDashboard", { 
        state: { roomId: data.roomId } 
      });
    };

    socket.on("game:gameCreated", handleGameCreated);

    return () => {
      socket.off("game:gameCreated", handleGameCreated);
    };
  }, [socket, navigate]);

  const handleCreateGame = () => {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }

    setIsCreating(true);

    const gameConfigs = {
      roundLength: roundLength || 60,
      maxRounds: maxRounds || 5,
      maxPlayersPerRoom: maxPlayersPerRoom || 2,
    };

    socket.emit("host:createGame", {
      gameType: "jankenpo",
      gameConfigs,
    });
  };

  const handleNumberInput = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => (value: string) => {
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 0 && !isNaN(numValue))) {
      setter(value === "" ? 0 : numValue);
    }
  };

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
                <h1 className="text-3xl font-bold">Create Jankenpo Game</h1>
                <p className="text-blue-200">Configure your rock-paper-scissors tournament</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/instructorDashboard')}
              variant="secondary"
              icon={ArrowLeft}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Game Configuration</h2>
          <div className="space-y-6">
            <Input
              label="Round Length (seconds)"
              type="number"
              value={roundLength}
              onChange={handleNumberInput(setRoundLength)}
              min={30}
              max={300}
              placeholder="60"
            />

            <Input
              label="Maximum Rounds"
              type="number"
              value={maxRounds}
              onChange={handleNumberInput(setMaxRounds)}
              min={1}
              max={20}
              placeholder="5"
            />

            <Input
              label="Max Players Per Room"
              type="number"
              value={maxPlayersPerRoom}
              onChange={handleNumberInput(setMaxPlayersPerRoom)}
              min={2}
              max={10}
              placeholder="2"
            />
          </div>
        </Card>

        {/* Game Preview */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Game Preview</h2>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {roundLength}s
                </div>
                <p className="text-sm text-orange-700">Per Round</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {maxRounds}
                </div>
                <p className="text-sm text-blue-700">Total Rounds</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {maxPlayersPerRoom}
                </div>
                <p className="text-sm text-green-700">Players Per Room</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleCreateGame}
            variant="success"
            icon={Play}
            size="lg"
            disabled={isCreating || !socket}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isCreating ? 'Creating Game...' : 'Create Game'}
          </Button>
        </div>

        {!socket && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm text-center">
              Not connected to server. Please refresh the page and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}