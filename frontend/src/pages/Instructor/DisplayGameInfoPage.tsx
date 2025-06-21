import React, { useEffect, useState } from "react";
import { useSocket } from "../../socket";
import { useNavigate } from "react-router-dom";

export default function DisplayGameInfoPage() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (!socket) return;

    // emits
    socket.emit("game:getInfo");

    // listeners
    socket.on("game:info", (data) => {
      setRoomCode(data.roomId);
    });

    // cleanup

    return () => {
      socket.off("game:info");
    };
  }, [socket]);

  const handleNavigateToDashboard = () => {
    navigate("/instructor/gameDashboard");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Room Code: {roomCode}</h1>
      <button onClick={handleNavigateToDashboard}>Navigate to Dashboard</button>
    </div>
  );
}
