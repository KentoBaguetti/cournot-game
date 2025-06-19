import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Game } from "../../types";

export default function InstructorDashboard() {
  const [instructorName, setInstructorName] = useState("");
  const [games, setGames] = useState<Record<string, Game> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructor name
        const meResponse = await axios.get("http://localhost:3001/auth/me", {
          withCredentials: true,
        });
        setInstructorName(meResponse.data.user.username);

        // Fetch available games
        const gamesResponse = await axios.get(
          "http://localhost:3001/game/getGames",
          { withCredentials: true }
        );
        setGames(gamesResponse.data.games);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleGameSelect = (gameId: string) => {
    navigate(`/instructor/create/${gameId}`);
  };

  return (
    <div className="flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>
      <h2 className="mb-6">
        Welcome,{" "}
        <span className="font-bold text-green-500">{instructorName}</span>
      </h2>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Choose a Game to Create</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games &&
            Object.entries(games).map(([gameId, gameData]) => (
              <div
                key={gameId}
                className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleGameSelect(gameId)}
              >
                <h3 className="font-bold text-lg">{gameData[1]}</h3>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
