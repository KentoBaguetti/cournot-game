import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../socket";

export default function StudentJoin() {
  const [code, setCode] = useState<string>("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const socket = useSocket();

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const codeValue = codeRef.current ? codeRef.current.value : "";
    setCode(codeValue);

    const usernameValue = usernameRef.current ? usernameRef.current.value : "";
    setUsername(usernameValue);

    try {
      // Authenticate to get JWT
      await axios.post(
        "http://localhost:3001/auth/login",
        {
          username: usernameValue,
          roomId: codeValue,
        },
        { withCredentials: true }
      );

      // If we're already in the SocketProvider context, we can navigate directly
      navigate("/student/gameLobby", { state: { roomCode: codeValue } });
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Failed to join game. Please check your code and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Join a Game</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleJoin} className="w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            required={true}
            ref={usernameRef}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Game Code
          </label>
          <input
            type="text"
            placeholder="Enter game code"
            ref={codeRef}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {isLoading ? "Joining..." : "Join Game"}
          </button>
        </div>
      </form>
    </div>
  );
}
