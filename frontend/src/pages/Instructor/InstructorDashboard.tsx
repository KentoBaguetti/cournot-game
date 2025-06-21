import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Home, BarChart3, Play } from "lucide-react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import axios from "axios";
import type { Game } from "../../types";

export default function InstructorDashboard() {
  const [instructorName, setInstructorName] = useState("");
  const [games, setGames] = useState<Record<string, Game> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGameSelect = (gameId: string) => {
    navigate(`/instructor/create/${gameId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
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
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                <p className="text-blue-200">
                  Welcome back, <span className="font-semibold text-white">{instructorName}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              icon={Home}
            >
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!games || Object.keys(games).length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Plus className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Games Available
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Contact your administrator to get access to game creation tools.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Game to Create</h2>
              <p className="text-gray-600">Select from the available game types below</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(games).map(([gameId, gameData]) => (
                <Card
                  key={gameId}
                  hover
                  className="text-center cursor-pointer"
                  onClick={() => handleGameSelect(gameId)}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{gameData[1]}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Create a new {gameData[1].toLowerCase()} session
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Create Game
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}