import React, { useState, useEffect } from "react";
import { useSocket } from "../../socket";
// import { useNavigate } from "react-router-dom";

export default function CreateJankenpoGamePage() {
  const socket = useSocket();
  // const navigate = useNavigate();

  const [roundLength, setRoundLength] = useState(0);
  const [maxRounds, setMaxRounds] = useState(0);
  const [indefinite, setIndefinite] = useState(false);
  const [maxPlayersPerRoom, setMaxPlayersPerRoom] = useState(0);

  useEffect(() => {}, [socket]);

  const handleCreateGame = () => {
    socket?.emit("test", {
      data: {
        roundLength,
        maxRounds,
        indefinite,
        maxPlayersPerRoom,
      },
    });
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
        <h4>Indeinite Game (Overrides max rounds)</h4>
        <input
          type="checkbox"
          value={indefinite ? "Yes" : "No"}
          onChange={(e) => setIndefinite(e.target.checked)}
        />
        <h4>Max Players Per Room</h4>
        <input
          type="number"
          value={maxPlayersPerRoom}
          onChange={(e) => setMaxPlayersPerRoom(Number(e.target.value))}
        />
        <button onClick={handleCreateGame}>Create Game</button>
      </div>
    </div>
  );
}
