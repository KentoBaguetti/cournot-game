import React, { useEffect, useState } from "react";
import { useSocket } from "../../socket";
// import { useNavigate } from "react-router-dom";

export default function StudentGamePage() {
  const socket = useSocket();
  // const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState("Temp message");

  useEffect(() => {
    // const currentGameRoom: string | null = localStorage.getItem("gameRoomCode");
    // socket?.emit("game:join", { roomId: currentGameRoom });

    socket?.on("server-message", (msg) => {
      setServerMessage(msg);
    });
  }, [socket]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket?.emit("test:emitToRoom", { msg: "Hello from client" });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>StudentGamePage</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <h1>{serverMessage}</h1>
          <button type="submit">Emit to same room</button>
        </form>
      </div>
    </div>
  );
}
