import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Users, Play, Copy, Check, BarChart3 } from "lucide-react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useSocket } from "../../socket";
import axios from "axios";

export default function GameDashboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const roomId = location.state?.roomId;

  const [hostName, setHostName] = useState("");
  const [playersArr, setPlayersArr] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomCode, setRoomCode] = useState(roomId || "");
  const [roomsAndPlayers, setRoomsAndPlayers] = useState<
    Record<string, string[]>
  >({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleGameStart = () => {
    if (!socket) return;
    socket.emit("game:start");
    setGameStarted(true);
  };

  const copyGameCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Initial data fetch
  useEffect(() => {
    const getBasicGameInfo = async () => {
      try {
        const authmeRes = await axios.get("http://localhost:3001/auth/me", {
          withCredentials: true,
        });
        setHostName(authmeRes.data.user.username);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getBasicGameInfo();
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Emit requests for data
    socket.emit("get:users", { includeHost: false });
    socket.emit("game:getInfo");
    socket.emit("get:listRoomsAndPlayers");

    // Set up listeners
    const handleListUsers = (data: string[]) => {
      setPlayersArr(data);
    };

    const handleGameInfo = (data: { roomId: string }) => {
      setRoomCode(data.roomId);
    };

    const handleListRoomsAndPlayers = (data: Record<string, string[]>) => {
      setRoomsAndPlayers(data);
    };

    socket.on("server:listUsers", handleListUsers);
    socket.on("game:info", handleGameInfo);
    socket.on("server:listRoomsAndPlayers", handleListRoomsAndPlayers);

    return () => {
      socket.off("server:listUsers", handleListUsers);
      socket.off("game:info", handleGameInfo);
      socket.off("server:listRoomsAndPlayers", handleListRoomsAndPlayers);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading game dashboard...</p>
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
                <h1 className="text-3xl font-bold">Game Dashboard</h1>
                <p className="text-blue-200">
                  Welcome,{" "}
                  <span className="font-semibold text-white">{hostName}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/instructorDashboard")}
              variant="secondary"
              icon={ArrowLeft}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Game Code Card */}
        <Card className="mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Game Code
            </h2>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-4">
              <div className="text-4xl font-mono font-bold text-orange-600 mb-2">
                {roomCode}
              </div>
              <p className="text-orange-700 text-sm">
                Share this code with students to join
              </p>
            </div>
            <Button
              onClick={copyGameCode}
              variant="secondary"
              icon={copiedCode ? Check : Copy}
              className={copiedCode ? "bg-green-100 text-green-700" : ""}
            >
              {copiedCode ? "Copied!" : "Copy Code"}
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Players List */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Players ({playersArr.length})
              </h3>
            </div>

            <div className="space-y-3">
              {playersArr.length > 0 ? (
                playersArr.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200"
                  >
                    <span className="font-medium text-gray-900">{player}</span>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No players have joined yet. Share the game code above!
                </p>
              )}
            </div>
          </Card>

          {/* Breakout Rooms */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Breakout Rooms
            </h3>

            <div className="space-y-4">
              {Object.keys(roomsAndPlayers).length > 0 ? (
                Object.entries(roomsAndPlayers).map(([roomId, players]) => (
                  <div key={roomId} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-2">
                      {roomId}
                    </div>
                    <div className="text-sm text-gray-600">
                      Players:{" "}
                      {players.length > 0 ? players.join(", ") : "Empty"}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No breakout rooms created yet
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Game Controls */}
        <Card className="mt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Game Controls
            </h3>

            {!gameStarted ? (
              <div>
                <p className="text-gray-600 mb-6">
                  Ready to start the game? Make sure all players have joined.
                </p>
                <Button
                  onClick={handleGameStart}
                  variant="success"
                  icon={Play}
                  size="lg"
                  disabled={!socket || playersArr.length === 0}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  Start Game
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="text-green-800 font-semibold mb-2">
                  Game Started!
                </div>
                <p className="text-green-600 text-sm">
                  The game is now active. Players can begin playing.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
