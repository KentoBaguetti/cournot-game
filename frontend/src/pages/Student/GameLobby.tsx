import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../../socket";

interface GameInfo {
  gameType: string;
  roomName?: string;
  hostName?: string;
  maxPlayers?: number;
}

interface ReadyPlayer {
  playerId: string;
  playerName: string;
  isReady: boolean;
}

export default function GameLobby() {
  const socket = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [readyPlayers, setReadyPlayers] = useState<Record<string, boolean>>({});
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode } = location.state || {};

  useEffect(() => {
    // Add a check to see if we need to retry connecting
    if (!socket) {
      // Set a timeout to retry after a short delay
      const retryTimer = setTimeout(() => {
        setIsLoading(true); // Keep showing loading state
        // This will trigger a re-render and re-run this effect
        console.log("Retrying socket connection...");
      }, 1000);

      return () => clearTimeout(retryTimer);
    }

    if (!roomCode) {
      setError("No room code provided. Please go back and enter a valid code.");
      return;
    }

    console.log("Socket connected, joining game room:", roomCode);

    // Join the game room - only do this once when the component mounts
    socket.emit("game:join", { roomId: roomCode });

    // Listen for errors
    const handleError = (error: { message: string }) => {
      setError(error.message);
      setIsLoading(false);
    };

    // Listen for player list updates
    const handlePlayerList = (playerList: string[]) => {
      setPlayers(playerList);
      setIsLoading(false);
    };

    // Listen for game information
    const handleGameInfo = (info: GameInfo) => {
      setGameInfo(info);
      setIsLoading(false);
    };

    // Listen for ready status updates
    const handleReadyUpdate = (data: ReadyPlayer) => {
      setReadyPlayers((prev) => ({
        ...prev,
        [data.playerName]: data.isReady,
      }));
    };

    // Listen for game start
    const handleGameStart = () => {
      if (gameInfo) {
        // Navigate to the appropriate game page based on game type
        if (gameInfo.gameType === "jankenpo") {
          navigate("/janKenPo", { state: { roomId: roomCode } });
        } else if (gameInfo.gameType === "cournot") {
          navigate("/cournotGame", { state: { roomId: roomCode } });
        } else {
          navigate("/studentGame", { state: { roomId: roomCode } });
        }
      }
    };

    // Set up event listeners
    socket.on("game:error", handleError);
    socket.on("server:listUsers", handlePlayerList);
    socket.on("game:info", handleGameInfo);
    socket.on("player:readyUpdate", handleReadyUpdate);
    socket.on("game:start", handleGameStart);

    // Request game information
    socket.emit("game:getInfo", { roomId: roomCode });

    // Clean up event listeners when component unmounts
    return () => {
      socket.off("game:error", handleError);
      socket.off("server:listUsers", handlePlayerList);
      socket.off("game:info", handleGameInfo);
      socket.off("player:readyUpdate", handleReadyUpdate);
      socket.off("game:start", handleGameStart);
    };
  }, [socket, roomCode, navigate]);

  const handleReady = () => {
    if (socket) {
      socket.emit("player:ready", { isReady: true });
      setIsReady(true);
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit("game:leave", { roomId: roomCode });
      navigate("/student");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">Joining game room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate("/student")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {gameInfo?.gameType === "jankenpo"
            ? "Rock Paper Scissors"
            : gameInfo?.gameType === "cournot"
            ? "Cournot Game"
            : "Game"}{" "}
          Lobby
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Game Information</h2>
          <div className="bg-gray-50 p-3 rounded">
            <p>
              <span className="font-medium">Room Code:</span> {roomCode}
            </p>
            {gameInfo?.hostName && (
              <p>
                <span className="font-medium">Host:</span> {gameInfo.hostName}
              </p>
            )}
            {gameInfo?.roomName && (
              <p>
                <span className="font-medium">Room Name:</span>{" "}
                {gameInfo.roomName}
              </p>
            )}
            {gameInfo?.maxPlayers && (
              <p>
                <span className="font-medium">Max Players:</span>{" "}
                {gameInfo.maxPlayers}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Players ({players.length})
          </h2>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            {players.length > 0 ? (
              <ul className="space-y-1">
                {players.map((player, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {player}
                    </div>
                    {readyPlayers[player] && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Ready
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No other players have joined yet.</p>
            )}
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleReady}
            disabled={isReady}
            className={`flex-1 py-2 px-4 rounded font-bold ${
              isReady
                ? "bg-green-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isReady ? "Ready!" : "I'm Ready"}
          </button>

          <button
            onClick={handleLeave}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
