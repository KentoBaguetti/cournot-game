import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../socket";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function GameLobby() {
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const { roomCode } = location.state;
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const hasJoinedGame = useRef(false);
  const startGame = useRef(false);

  useEffect(() => {}, []);

  useEffect(() => {
    if (!socket) return;

    // emits
    if (!hasJoinedGame.current) {
      socket.emit("game:join", { roomId: roomCode });
      hasJoinedGame.current = true;
    }

    // listeners
    socket.on("server:listUsers", (data: string[]) => {
      setAllPlayers(data);
    });
    socket.on("game:start", () => {
      startGame.current = true;
      navigate("/games/jankenpo");
    });

    // cleanup
    return () => {
      socket.off("server:listUsers");
      socket.off("game:start");
    };
  }, [socket, roomCode, navigate]);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Game Lobby</h1>
      <div>
        <h3>Room Code: {roomCode}</h3>
        <h3>Player List:</h3>
        {allPlayers.map((player) => (
          <div key={player}>{player}</div>
        ))}
      </div>
    </div>
  );
}
