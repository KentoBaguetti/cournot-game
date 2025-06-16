import React, { useEffect } from "react";
import { useSocket } from "../socket";
// import { useNavigate } from "react-router-dom";

export default function StudentGamePage() {
  const socket = useSocket();
  // const navigate = useNavigate();

  useEffect(() => {
    // const currentGameRoom: string | null = localStorage.getItem("gameRoomCode");
    // socket?.emit("game:join", { roomId: currentGameRoom });

    socket?.emit("game:checkRoles");
  }, [socket]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket?.emit("game:checkRoles");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>StudentGamePage</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <button type="submit">Leave</button>
        </form>
      </div>
    </div>
  );
}
