import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../socket";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function GameLobby() {
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const { roomCode } = location.state;
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [isWaiting, setIsWaiting] = useState(true);
  const hasJoinedGame = useRef(false);
  const startGame = useRef(false);

  useEffect(() => {
    if (!socket) return;

    // emits
    if (!hasJoinedGame.current) {
      socket.emit("game:join", { roomId: roomCode });
      hasJoinedGame.current = true;
    }

    // listeners
    socket.on("server:listUsers", (data: string[]) => {
      setAllPlayers(data);
    });

    socket.on(
      "game:start",
      ({ gameInfo }: { gameInfo: { gameType: string } }) => {
        startGame.current = true;
        setIsWaiting(false);
        navigate(`/games/${gameInfo.gameType}`);
      }
    );

    // cleanup
    return () => {
      socket.off("server:listUsers");
      socket.off("game:start");
    };
  }, [socket, roomCode, navigate]);

  return (
    <Layout
      title="Game Lobby"
      showBackButton={false}
      showHomeButton={true}
      withConfirmation={true}
      confirmationMessage="Are you sure you want to leave the game lobby? You will be removed from the game."
      roomId={roomCode}
      leaveGameOnNavigate={true}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Waiting for Game to Start
          </h1>
          <p className="text-gray-600">
            The instructor will start the game when all players have joined.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Room Code: <span className="text-blue-600">{roomCode}</span>
            </h2>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Players in Lobby ({allPlayers.length})
            </h3>

            <div className="space-y-3">
              {allPlayers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Waiting for players to join...
                </p>
              ) : (
                allPlayers.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="font-medium text-blue-600">
                        {player.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{player}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            {isWaiting ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">
                  Waiting for instructor to start the game...
                </p>
              </div>
            ) : (
              <Button variant="primary" size="lg">
                Game Starting...
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
