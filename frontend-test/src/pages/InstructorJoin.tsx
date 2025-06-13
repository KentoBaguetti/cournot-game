import React, { useState, useEffect } from "react";
import { generateJoinCode } from "../utils";
import { useSocket } from "../socket";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function InstructorJoin() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    setJoinCode(generateJoinCode());
  }, []);

  const handleNewJoinCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJoinCode(generateJoinCode());
  };

  const handleCreateGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let token = localStorage.getItem("jwt") || null;

    if (!token) {
      const response = await axios.post("http://localhost:3001/setToken", {
        userId: socket?.id,
        username: "TempInstructor",
        room: joinCode,
      });

      token = response.data.token;
    }

    localStorage.setItem("jwt", token ?? "");
    console.log(joinCode);
    socket?.emit("game:create", { roomId: joinCode, gameType: "testgame" });

    navigate("/instructorDashboard");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Instructor Join Page</h1>
      <div>
        <h2>Join Code: {joinCode}</h2>
        <form onSubmit={handleNewJoinCode}>
          <button type="submit">Generate new join code</button>
        </form>
        <form onSubmit={handleCreateGame}>
          <button type="submit">Create Game</button>
        </form>
      </div>
    </div>
  );
}
