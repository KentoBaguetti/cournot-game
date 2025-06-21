import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Home, Gamepad2 } from "lucide-react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useSocket } from "../../socket";

export default function GameLobby() {
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const { roomCode } = location.state || {};
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [gameInfo, setGameInfo] = useState<{
    gameType?: string;
    hostName?: string;
  }>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const hasJoinedGame = useRef(false);

  useEffect(() => {
    if (!roomCode) {
      navigate('/student');
      return;
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    if (!socket) {
      setConnectionStatus('connecting');
      return;
    }

    setConnectionStatus('connected');

    // Join game if not already joined
    if (!hasJoinedGame.current) {
      socket.emit("game:join", { roomId: roomCode });
      hasJoinedGame.current = true;
    }

    // Request game info
    socket.emit("game:getInfo");

    // Set up listeners
    const handleListUsers = (data: string[]) => {
      setAllPlayers(data);
    };

    const handleGameInfo = (data: {
      gameType: string;
      hostName: string;
      roomId: string;
    }) => {
      setGameInfo({
        gameType: data.gameType,
        hostName: data.hostName,
      });
    };

    const handleGameStart = () => {
      navigate("/games/jankenpo");
    };

    const handleGameError = (data: { message: string }) => {
      console.error("Game error:", data.message);
      setConnectionStatus('error');
    };

    socket.on("server:listUsers", handleListUsers);
    socket.on("game:info", handleGameInfo);
    socket.on("game:start", handleGameStart);
    socket.on("game:error", handleGameError);

    return () => {
      socket.off("server:listUsers", handleListUsers);
      socket.off("game:info", handleGameInfo);
      socket.off("game:start", handleGameStart);
      socket.off("game:error", handleGameError);
    };
  }, [socket, roomCode, navigate]);

  if (!roomCode) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Session</h1>
          <Button onClick={() => navigate('/student')}>Join a Game</Button>
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
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Game Lobby</h1>
                <p className="text-blue-200">
                  {gameInfo.gameType && `${gameInfo.gameType.charAt(0).toUpperCase() + gameInfo.gameType.slice(1)} Game`}
                  {gameInfo.hostName && ` • Host: ${gameInfo.hostName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500 text-white' 
                  : connectionStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </div>
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                icon={Home}
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Game Code Display */}
        <Card className="mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Code</h2>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="text-3xl font-mono font-bold text-orange-600">
                {roomCode}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Players List */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Players ({allPlayers.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {allPlayers.length > 0 ? (
                allPlayers.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200"
                  >
                    <span className="font-medium text-gray-900">{player}</span>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Waiting for players to join...</p>
                </div>
              )}
            </div>
          </Card>

          {/* Game Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Game Status</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="font-medium text-blue-900 mb-2">Waiting for Game to Start</div>
                <p className="text-blue-700 text-sm">
                  The instructor will start the game when all players are ready.
                </p>
              </div>

              {gameInfo.gameType && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="font-medium text-purple-900 mb-2">Game Type</div>
                  <p className="text-purple-700 text-sm">
                    {gameInfo.gameType.charAt(0).toUpperCase() + gameInfo.gameType.slice(1)}
                  </p>
                </div>
              )}

              {gameInfo.hostName && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="font-medium text-green-900 mb-2">Host</div>
                  <p className="text-green-700 text-sm">
                    {gameInfo.hostName}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {connectionStatus === 'error' && (
          <Card className="mt-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-red-800 mb-2">Connection Error</h3>
              <p className="text-red-600 text-sm mb-4">
                There was an issue connecting to the game. Please try refreshing the page.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="danger"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}