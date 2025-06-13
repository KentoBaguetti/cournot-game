import React, { useRef, useState, useEffect } from "react";
import { useSocket } from "../socket";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentJoin() {
  const [code, setCode] = useState<string>("");
  const [username, setUsername] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {}, []);

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const codeValue = codeRef.current ? codeRef.current.value : "";
    setCode(codeValue);
    console.log(codeValue);

    const usernameValue = usernameRef.current ? usernameRef.current.value : "";
    setUsername(usernameValue);
    console.log(usernameValue);

    let token = localStorage.get("jwt") || null;

    if (!token) {
      const response = await axios.post("http://localhost:3001/setToken", {
        userId: socket?.id,
        username: usernameValue,
        room: codeValue,
      });

      token = response.data.token;
    }

    localStorage.setItem("jwt", token);

    socket?.emit("game:join", { roomId: codeValue, gameType: "testgame" });

    navigate("/studentGame");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Student Join Page</h1>

      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Username"
          required={true}
          ref={usernameRef}
        />
        <input type="text" placeholder="Enter Game join code" ref={codeRef} />
        <button type="submit">Submit Code</button>
      </form>
      <div>
        <p>Submitted username: {username}</p>
        <p>Submitted Code: {code}</p>
      </div>
    </div>
  );
}
