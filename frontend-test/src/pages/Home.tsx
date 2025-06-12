import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../socket";

export default function Home() {
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {}, [socket]);

  const studentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/student");
  };

  const instructorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/instructor");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Home</h1>
      <div className="flex flex-row">
        <form onSubmit={studentSubmit}>
          <button type="submit">Student</button>
        </form>
        <form onSubmit={instructorSubmit}>
          <button type="submit">Instructor</button>
        </form>
      </div>
    </div>
  );
}
