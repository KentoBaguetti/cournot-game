import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { Game } from "../../types";

export default function CreateGamePage() {
  const [games, setGames] = useState<Record<string, Game> | null>(null);

  const { gameId } = useParams();

  useEffect(() => {
    const getGames = async () => {
      const response = await axios.get(`http://localhost:3001/game/getGames`, {
        withCredentials: true,
      });
      setGames(response.data.games);
    };
    getGames();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>
        Create a new{" "}
        {games && gameId ? games?.[gameId]?.[1] + " Game" : "Connection Error"}
      </h1>
    </div>
  );
}
