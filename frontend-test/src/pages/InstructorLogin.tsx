import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function InstructorLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const usernameValue = usernameRef.current ? usernameRef.current.value : "";
    const passwordValue = passwordRef.current ? passwordRef.current.value : "";

    setUsername(usernameValue);
    setPassword(passwordValue);

    let token = localStorage.getItem("jwt") || null;

    if (!token) {
      const response = await axios.post("http://localhost:3001/setToken", {
        username: usernameValue,
      });
      token = response.data.token;
    }

    localStorage.setItem("jwt", token ?? "");

    navigate("/instructor");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>InstructorLogin</h1>
      <div>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            ref={usernameRef}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            ref={passwordRef}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
