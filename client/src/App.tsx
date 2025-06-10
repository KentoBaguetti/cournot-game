import { useState, useEffect } from "react";
import socket from "./socket";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("server-response", (data) => {
      setMessage(data);
    });

    return () => {
      socket.off("server-response");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("client-message", "Message from client");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Client</h1>
      <button onClick={sendMessage}>Send Message</button>
      <p>Server says {message}</p>
    </div>
  );
}

export default App;
