import React, { useState, useEffect } from "react";
import { useSocket } from "../../socket";
import { useNavigate } from "react-router-dom";

export default function CreateJankenpoGamePage() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roundLength, setRoundLength] = useState(0);
  const [maxRounds, setMaxRounds] = useState(0);
  const [maxPlayersPerRoom, setMaxPlayersPerRoom] = useState(0);

  useEffect(() => {}, [socket]);

  const handleCreateGame = () => {
    socket?.emit("test", {
      data: {
        roundLength,
        maxRounds,
        maxPlayersPerRoom,
      },
    });
    socket?.emit("host:createGame", {
      gameType: "jankenpo",
      gameConfigs: {
        roundLength: roundLength || 1,
        maxRounds: maxRounds || 1,
        maxPlayersPerRoom: maxPlayersPerRoom || 1,
      },
    });
    navigate("/instructor/gameDashboard");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Create a new Jankenpo Game</h1>
      <div>
        <h4>Round Length</h4>
        <input
          type="number"
          value={roundLength}
          onChange={(e) => setRoundLength(Number(e.target.value))}
        />
        <h4>Max Rounds</h4>
        <input
          type="number"
          value={maxRounds}
          onChange={(e) => setMaxRounds(Number(e.target.value))}
        />
        <h4>Max Players Per Room</h4>
        <input
          type="number"
          value={maxPlayersPerRoom}
          onChange={(e) => setMaxPlayersPerRoom(Number(e.target.value))}
        />
        <br></br>
        <button onClick={handleCreateGame}>Create Game</button>
      </div>
    </div>
  );
}
