import React, { useEffect } from "react";
import { useSocket } from "../socket";

export default function StudentGamePage() {
  const socket = useSocket();

  useEffect(() => {
    const currentGameRoom: string | null = localStorage.getItem("gameRoomCode");
    socket?.emit("game:join", { roomId: currentGameRoom });
  }, [socket]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket?.emit("client-message", "waddup");
    socket?.emit("game:checkRoles");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>StudentGamePage</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <button type="submit">Send hello</button>
        </form>
      </div>
    </div>
  );
}
