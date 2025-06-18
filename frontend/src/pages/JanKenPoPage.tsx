import React, { useState, useEffect } from "react";
import { useSocket } from "../socket";

export default function JanKenPoPage() {
  const socket = useSocket();
  const [userAction, setUserAction] = useState<string>("");
  const [opponentAction, setOpponentAction] = useState<string>("");

  useEffect(() => {
    socket?.emit("player:move", { action: userAction });
    socket?.emit("game:checkMove");
  }, [socket, userAction]);

  useEffect(() => {
    if (!socket) return;

    const handleCheckMove = ({ move }: { move: string }) => {
      setOpponentAction(move);
    };

    socket.on("game:checkMove", handleCheckMove);

    return () => {
      socket.off("game:checkMove", handleCheckMove);
    };
  }, [socket]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="">
        <h2>Your action: {userAction}</h2>
        <h3>Opponent action: {opponentAction}</h3>
        <button onClick={() => setUserAction("rock")}>Rock</button>
        <button onClick={() => setUserAction("paper")}>Paper</button>
        <button onClick={() => setUserAction("scissors")}>Scissors</button>
      </div>
      <div className="flex flex-row"></div>
    </div>
  );
}
