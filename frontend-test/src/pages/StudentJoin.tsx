import React, { useRef, useState } from "react";
import { useSocket } from "../socket";
import { useNavigate } from "react-router-dom";

export default function StudentJoin() {
  const [code, setCode] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const socket = useSocket();

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputValue = inputRef.current ? inputRef.current.value : "";
    setCode(inputValue);
    console.log(inputValue);
    socket?.emit("game:join", { roomId: inputValue, gameType: "testgame" });
    navigate("/studentGame");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Student Join Page</h1>
      <form onSubmit={handleJoin}>
        <input type="text" placeholder="Enter Game join code" ref={inputRef} />
        <button type="submit">Submit Code</button>
      </form>
      <div>Submitted Code: {code}</div>
    </div>
  );
}
