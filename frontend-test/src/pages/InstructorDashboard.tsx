import React, { useEffect, useState } from "react";
import { useSocket } from "../socket";

export default function InstructorDashboard() {
  const socket = useSocket();
  const [players, setPlayers] = useState([]);
  const [roomsAndPlayers, setRoomsAndPlayers] = useState(null); // Map<string, string[]>

  useEffect(() => {
    socket?.on("game:listUsers", (players) => {
      setPlayers(players);
    });
    socket?.on("game:listRoomsAndPlayers", (roomsAndPlayers) => {
      setRoomsAndPlayers(roomsAndPlayers);
    });
  }, [socket]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("game:listUsers");
  };

  const onSubmitRoomsAndPlayers = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("game:listRoomsAndPlayers");
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
        <form onSubmit={onSubmitRoomsAndPlayers}>
          <button type="submit">View rooms and players</button>
        </form>
        <p>
          {Object.entries(roomsAndPlayers || {}).map(([roomId, players]) => (
            <div key={roomId}>
              <h4>{roomId}</h4>
              <p>{(players as string[]).join(", ")}</p>
            </div>
          ))}
        </p>
      </div>
    </div>
  );
}
