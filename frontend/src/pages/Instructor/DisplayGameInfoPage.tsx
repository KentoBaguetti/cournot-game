import { useEffect, useState } from "react";
import { useSocket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function DisplayGameInfoPage() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (!socket) return;

    // emits
    socket.emit("game:getInfo");

    // listeners
    socket.on("game:info", (data) => {
      setRoomCode(data.roomId);
    });

    // cleanup
    return () => {
      socket.off("game:info");
    };
  }, [socket]);

  const handleNavigateToDashboard = () => {
    navigate("/instructor/gameDashboard");
  };

  return (
    <Layout showHeader={true} title="Game Information">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join the Game
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use the room code below to join this game session
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="text-center p-8">
            <div className="mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-lg text-gray-600 mb-2">Room Code</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-4xl font-bold tracking-widest text-blue-600">
                {roomCode}
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Share this code with students so they can join the game session
            </p>
            <Button onClick={handleNavigateToDashboard} variant="secondary">
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
