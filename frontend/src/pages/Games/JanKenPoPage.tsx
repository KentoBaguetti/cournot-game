import React, { useState, useEffect } from "react";
import { useSocket } from "../../socket";

export default function JanKenPoPage() {
  const socket = useSocket();
  const [userAction, setUserAction] = useState<string>("");
  const [opponentAction, setOpponentAction] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    // emits
    if (userAction) {
      socket.emit("player:move", { action: userAction });
    }

    // listeners
    socket.on("game:checkMove", ({ action }: { action: string }) => {
      setOpponentAction(action);
    });

    // cleanup
    return () => {
      socket.off("game:checkMove");
    };
  }, [socket, userAction]);

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
