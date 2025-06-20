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

  useEffect(() => {
    const getBasicGameInfo = async () => {
      const authmeRes = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });
      setHostName(authmeRes.data.user.username);
    };

    getBasicGameInfo();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("player:listUsers");
    socket.on("server:listUsers", (data) => {
      setPlayersArr(data);
    });

    return () => {
      socket.off("server:listUsers");
    };
  }, [socket]);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Game Dashboard</h1>
      <h6>Hello, {hostName}</h6>
      <div>
        {playersArr.map((player) => (
          <div key={player}>{player}</div>
        ))}
      </div>
    </div>
  );
}
