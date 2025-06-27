import React, { useEffect, useState } from "react";
import { useSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function CreateCournotGamePage() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roundLength, setRoundLength] = useState<number>(0);
  const [maxPlayersPerRoom, setMaxPlayersPerRoom] = useState<number>(0);
  const [maxRounds, setMaxRounds] = useState<number>(0);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [z, setZ] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;
  }, [socket]);

  // default the cournot formula values to 1
  const handleCreateGame = () => {
    socket?.emit("host:createGame", {
      gameType: "cournot",
      gameConfigs: {
        roundLength: roundLength || 1,
        maxRounds: maxRounds || 1,
        maxPlayersPerRoom: maxPlayersPerRoom || 1,
        x: x || 1,
        y: y || 1,
        z: z || 1,
      },
    });
    navigate("/instructor/gameDashboard");
  };

  const handleNumberInput =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseInt(value);
      if (value === "" || (numValue >= 0 && !isNaN(numValue))) {
        setter(value === "" ? 0 : numValue);
      }
    };

  return (
    <Layout showHeader={true} title="JanKenPo Game Setup">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Configure Cournot Game
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Set up the parameters for your Cournot Game
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="roundLength"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Round Length (minutes)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="roundLength"
                    type="text"
                    value={roundLength}
                    onChange={handleNumberInput(setRoundLength)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Duration of each round in minutes
                </p>
              </div>

              <div>
                <label
                  htmlFor="maxRounds"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Maximum Rounds
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="maxRounds"
                    type="text"
                    value={maxRounds}
                    onChange={handleNumberInput(setMaxRounds)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Total number of rounds in the game
                </p>
              </div>

              <div>
                <label
                  htmlFor="maxPlayersPerRoom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Maximum Players Per Room
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="maxPlayersPerRoom"
                    type="text"
                    value={maxPlayersPerRoom}
                    onChange={handleNumberInput(setMaxPlayersPerRoom)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of players allowed in each breakout room
                </p>
              </div>

              <div>
                <label
                  htmlFor="maxPlayersPerRoom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  X
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="maxPlayersPerRoom"
                    type="text"
                    value={maxPlayersPerRoom}
                    onChange={handleNumberInput(setX)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="maxPlayersPerRoom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Y
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="maxPlayersPerRoom"
                    type="text"
                    value={maxPlayersPerRoom}
                    onChange={handleNumberInput(setY)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="maxPlayersPerRoom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Z
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="maxPlayersPerRoom"
                    type="text"
                    value={maxPlayersPerRoom}
                    onChange={handleNumberInput(setZ)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleCreateGame}
                  variant="primary"
                  className="w-full"
                >
                  Create Game
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
