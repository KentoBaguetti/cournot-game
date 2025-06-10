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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit("client-message", inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Client</h1>
      <form onSubmit={handleSubmit}>
        <input
          autoComplete="off"
          id="input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        ></input>
        <button type="submit">Submit</button>
      </form>

      <p>Server says "{message}"</p>
    </div>
  );
}

export default App;
