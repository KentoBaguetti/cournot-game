import React, { useState, useEffect } from "react";
import { useSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";

export default function CreateJankenpoGamePage() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roundLength, setRoundLength] = useState(1);
  const [maxRounds, setMaxRounds] = useState(1);
  const [maxPlayersPerRoom, setMaxPlayersPerRoom] = useState(1);

  useEffect(() => {}, [socket]);

  const handleCreateGame = () => {
    socket?.emit("test", {
      data: {
        roundLength,
        maxRounds,
        maxPlayersPerRoom,
      },
    });
    socket?.emit("host:createGame", {
      gameType: "jankenpo",
      gameConfigs: {
        roundLength: roundLength || 1,
        maxRounds: maxRounds || 1,
        maxPlayersPerRoom: maxPlayersPerRoom || 1,
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
    <Layout showHeader={true} title="Confire settings for JanKenPo Game">
      <div className="flex flex-col justify-center items-center">
        <h1 className="m-5 text-2xl font-bold">
          Configure Settings for Jankenpo Game
        </h1>
        <div className="w-80 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Round Length</h4>
            <input
              type="text"
              value={roundLength}
              onChange={handleNumberInput(setRoundLength)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Max Rounds</h4>
            <input
              type="text"
              value={maxRounds}
              onChange={handleNumberInput(setMaxRounds)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Max Players Per Room</h4>
            <input
              type="text"
              value={maxPlayersPerRoom}
              onChange={handleNumberInput(setMaxPlayersPerRoom)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="pt-4">
            <button
              onClick={handleCreateGame}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Create Game
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
