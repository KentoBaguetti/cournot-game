import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import config from "../../config";

export default function StudentJoin() {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // check for cookie
      const cookieExists = await axios.post(
        `${config.apiUrl}/auth/checkTokenRoomId`,
        { roomId: code.toUpperCase() },
        { withCredentials: true }
      );

      // if the cookie does not exist or the room code not not match, set a new token, otherwise dont do shit
      if (!cookieExists.data.success) {
        const loginRes = await axios.post(
          `${config.apiUrl}/auth/login`,
          {
            username,
            roomId: code.toUpperCase(),
          },
          { withCredentials: true }
        );

        if (loginRes.data?.token) {
          localStorage.setItem("auth_token", loginRes.data.token);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${loginRes.data.token}`;
        }

        console.log("cookie DNE");
      } else {
        const setTokenRes = await axios.post(
          `${config.apiUrl}/auth/setToken`,
          { roomId: code.toUpperCase() },
          {
            withCredentials: true,
          }
        );

        if (setTokenRes.data?.token) {
          localStorage.setItem("auth_token", setTokenRes.data.token);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${setTokenRes.data.token}`;
        }
      }

      console.log("cookie exists");
      // If we're already in the SocketProvider context, we can navigate directly
      navigate("/student/gameLobby", {
        state: { roomCode: code.toUpperCase() },
      });
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Failed to join game. Please check your code and try again.");
      setIsLoading(false);
    }
  };

  return (
    <Layout
      title="Join Game"
      showBackButton={false}
      navigateLocation="/"
      showHomeButton={true}
      withConfirmation={false}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Join a Game
            </h1>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
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
            )}

            <form onSubmit={handleJoin} className="space-y-6">
              <Input
                label="Your Name"
                value={username}
                onChange={setUsername}
                placeholder="Enter your name"
                required={true}
              />

              <Input
                label="Game Code"
                value={code.toUpperCase()}
                onChange={setCode}
                placeholder="Enter game code"
                required={true}
              />

              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {isLoading ? "Joining..." : "Join Game"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
