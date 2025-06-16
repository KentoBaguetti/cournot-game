import React, { useEffect, useState } from "react";
import { useSocket } from "../socket";

export default function InstructorDashboard() {
  const socket = useSocket();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket?.on("game:listUsers", (players) => {
      setPlayers(players);
    });
  }, [socket]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("game:listUsers");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Instructor Dashboard</h1>
      <div>
        <h3>View active players</h3>
        <p>{players.join(", ")}</p>
        <form onSubmit={onSubmit}>
          <button type="submit">Update players</button>
        </form>
      </div>
    </div>
  );
}
