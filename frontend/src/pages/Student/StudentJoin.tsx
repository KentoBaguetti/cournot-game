import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Home } from "lucide-react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import axios from "axios";

export default function StudentJoin() {
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!gameCode.trim() || !playerName.trim()) {
      setError('Please enter both game code and your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Authenticate to get JWT
      await axios.post(
        "http://localhost:3001/auth/login",
        {
          username: playerName,
          roomId: gameCode.toUpperCase(),
        },
        { withCredentials: true }
      );

      // Navigate to game lobby
      navigate("/student/gameLobby", { 
        state: { roomCode: gameCode.toUpperCase() } 
      });
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Failed to join game. Please check your code and try again.");
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Game</h1>
          <p className="text-gray-600">
            Enter the game code provided by your instructor and your name to join the session.
          </p>
        </div>

        <Card>
          <form onSubmit={handleJoin} className="space-y-6">
            <Input
              label="Your Name"
              value={playerName}
              onChange={setPlayerName}
              placeholder="Enter your name"
              required
            />

            <Input
              label="Game Code"
              value={gameCode}
              onChange={(value) => setGameCode(value.toUpperCase())}
              placeholder="Enter 6-character code"
              required
              className="text-center text-lg font-mono tracking-widest"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                variant="success"
                size="lg"
                icon={ArrowRight}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Joining Game...' : 'Join Game'}
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                size="md"
                icon={Home}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Ask your instructor for the 6-character game code. Make sure to enter it exactly as shown.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}