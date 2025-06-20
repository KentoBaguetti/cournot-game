import React, { useEffect, useState } from "react";
import { useSocket } from "../../socket";
import axios from "axios";

/**
 * Use axios+express for less common data retrievals such as game name and configs, things that might not change a lot
 * Use websockets for real time data such as game state, player data, etc.
 */

export default function GameDashboard() {
  const socket = useSocket();
  const [hostName, setHostName] = useState("");
  const [playersArr, setPlayersArr] = useState<string[]>([]);
  const [startGame, setStartGame] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomsAndPlayers, setRoomsAndPlayers] = useState<
    Record<string, string[]>
  >({});

  const handleGameStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!socket) return;

    socket.emit("game:start");

    setStartGame(true);
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
    <div className="flex flex-col justify-center items-center">
      <h1>Game Dashboard</h1>
      <h2>Hello, {hostName}</h2>
      <div>
        <h1>Room Code: {roomCode}</h1>
        <h3>Player List:</h3>
        {playersArr.map((player) => (
          <div key={player}>{player}</div>
        ))}
      </div>
      <div>
        <h3>Breakout Rooms Info:</h3>
        {Object.entries(roomsAndPlayers).map(([roomId, players]) => (
          <div key={roomId}>
            {roomId}: {players.join(", ")}
          </div>
        ))}
      </div>
      <button onClick={handleGameStart}>Start Game</button>
    </div>
  );
}
