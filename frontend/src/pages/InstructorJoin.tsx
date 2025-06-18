import React, { useEffect, useState } from "react";
import { useSocket } from "../socket";
import { useNavigate } from "react-router-dom";

export default function InstructorJoin() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    socket?.on("game:gameCreated", ({ roomId }: { roomId: string }) => {
      setRoomId(roomId);
    });
  }, [socket]);

  const handleCreateGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket?.emit("host:createGame", { gameType: "jankenpo" });

    //navigate("/instructorDashboard");
  };

  const navigateToDashboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("/instructorDashboard");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Instructor Join Page</h1>
      <div>
        <h2>Room ID: {roomId}</h2>
        <form onSubmit={handleCreateGame}>
          <button type="submit">Create Game</button>
        </form>
        <form>
          <button type="button" onClick={navigateToDashboard}>
            Navigate to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
