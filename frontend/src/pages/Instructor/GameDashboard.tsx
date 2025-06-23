import React, { useEffect, useState } from "react";
import { useSocket } from "../../socket";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

/**
 * Use axios+express for less common data retrievals such as game name and configs, things that might not change a lot
 * Use websockets for real time data such as game state, player data, etc.
 */

export default function GameDashboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("");
  const [playersArr, setPlayersArr] = useState<string[]>([]);
  const [startGame, setStartGame] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomsAndPlayers, setRoomsAndPlayers] = useState<
    Record<string, string[]>
  >({});

  const handleGameStart = () => {
    if (!socket) return;

    socket.emit("game:start");

    setStartGame(true);
  };

  const handleNavigateToDisplayGameInfo = () => {
    navigate("/instructor/displayGameInfo");
  };

  // initial mounts
  useEffect(() => {
    const getBasicGameInfo = async () => {
      const authmeRes = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });
      setHostName(authmeRes.data.user.username);
    };

    getBasicGameInfo();
  });

  // socket listeners
  useEffect(() => {
    if (!socket) return;

    // emits
    socket.emit("get:users", { includeHost: false });
    socket.emit("game:getInfo");
    socket.emit("get:listRoomsAndPlayers");

    // listeners
    socket.on("server:listUsers", (data) => {
      setPlayersArr(data);
    });
    socket.on("game:info", (data) => {
      setRoomCode(data.roomId);
    });
    socket.on("server:listRoomsAndPlayers", (data) => {
      console.log(`Type: ${typeof data}`);
      setRoomsAndPlayers(data);
    });

    if (startGame) {
      console.log("Starting game");
    }

    return () => {
      socket.off("server:listUsers");
      socket.off("game:info");
      socket.off("server:listRoomsAndPlayers");
    };
  }, [socket, startGame]);

  return (
    <Layout showHeader={true} title="Game Dashboard">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Game Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Welcome,{" "}
                <span className="font-medium text-blue-600">{hostName}</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="primary"
                onClick={handleGameStart}
                disabled={startGame || playersArr.length === 0}
              >
                {startGame ? "Game Started" : "Start Game"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleNavigateToDisplayGameInfo}
              >
                Display Game Info
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Room Information
              </h2>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Room Code: {roomCode}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-2">
                Connected Players ({playersArr.length})
              </h3>
              {playersArr.length > 0 ? (
                <div className="space-y-2">
                  {playersArr.map((player) => (
                    <div
                      key={player}
                      className="bg-white px-3 py-2 rounded-md border border-gray-200 flex items-center"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">
                          {player.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{player}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No players have joined yet
                </p>
              )}
            </div>
          </Card>

          <Card className="h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Breakout Rooms
            </h2>
            {Object.keys(roomsAndPlayers).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(roomsAndPlayers).map(([roomId, players]) => (
                  <div
                    key={roomId}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                  >
                    <h3 className="font-medium text-gray-700 mb-2">
                      Room: <span className="text-blue-600">{roomId}</span> (
                      {players.length} players)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {players.map((player) => (
                        <span
                          key={player}
                          className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm"
                        >
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No breakout rooms available
              </p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
