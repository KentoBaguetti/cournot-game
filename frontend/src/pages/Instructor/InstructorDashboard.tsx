import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Game } from "../../types";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import config from "../../config";

export default function InstructorDashboard() {
  const [instructorName, setInstructorName] = useState("");
  const [games, setGames] = useState<Record<string, Game> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch instructor name
        const meResponse = await axios.get(`${config.apiUrl}/auth/me`, {
          withCredentials: true,
        });
        setInstructorName(meResponse.data.user.username);

        // Fetch available games
        const gamesResponse = await axios.get(
          `${config.apiUrl}/game/getGames`,
          { withCredentials: true }
        );
        setGames(gamesResponse.data.games);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGameSelect = (gameId: string) => {
    navigate(`/instructor/create/${gameId}`);
  };

  return (
    <Layout title="Instructor Dashboard" navigateTo="/instructorDashboard">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Instructor Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Welcome,{" "}
                <span className="font-medium text-blue-600">
                  {instructorName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Available Games
              </h2>
              <p className="text-gray-600">
                Select a game type to create a new session
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games &&
                Object.entries(games).map(([gameId, gameData]) => (
                  <Card
                    key={gameId}
                    hover={true}
                    className="cursor-pointer"
                    onClick={() => handleGameSelect(gameId)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {gameData[1]}
                      </h3>
                      <p className="text-gray-600 mt-2 flex-grow">
                        {gameData[2] || "Create and manage a new game session"}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={() => handleGameSelect(gameId)}
                      >
                        Create Game
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
