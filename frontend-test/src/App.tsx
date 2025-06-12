import "./App.css";
import { useState, useEffect } from "react";
import socket from "./socket";

function App() {
  const [message, setMessage] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    socket.on("server-response", (data) => {
      setMessage(data);
    });

    return () => {
      socket.off("server-response");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("client-message", inputValue);
    setInputValue("");
  };

  const createAndJoinGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("game:create", { roomId: "testgame1", gameType: "testgame" });
  };

  const joinGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("game:join", { roomId: "testgame1", host: false });
  };

  const handleCheckUsers = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("game:checkRoles", { roomId: "testgame1" });
  };

  const expandGameSize = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("game:expandSize", {
      roomId: "testgame1",
      setting: "maxPlayers",
      size: 3,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <p className="">Test page</p>
      <p>{message}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <form onSubmit={createAndJoinGame}>
        <p>Create a Test game</p>
        <button type="submit">Create Test game and join the game</button>
      </form>
      <form onSubmit={joinGame}>
        <p>join game</p>
        <button type="submit">join the game</button>
      </form>
      <form onSubmit={handleCheckUsers}>
        <p>Check users</p>
        <button type="submit">Check users</button>
      </form>
      <form onSubmit={expandGameSize}>
        <button type="submit">expand game size</button>
      </form>
    </div>
  );
}

export default App;
