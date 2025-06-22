import React, { useState, useEffect } from "react";
import { useSocket } from "../../socket";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export default function JanKenPoPage() {
  const socket = useSocket();
  const [userAction, setUserAction] = useState<string>("");
  const [opponentAction, setOpponentAction] = useState<string>("");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    // emits
    if (userAction) {
      socket.emit("player:move", { action: userAction });
    }

    // listeners
    socket.on("game:checkMove", ({ action }: { action: string }) => {
      setOpponentAction(action);

      // Determine the result
      if (userAction === opponentAction) {
        setResult("draw");
      } else if (
        (userAction === "rock" && action === "scissors") ||
        (userAction === "paper" && action === "rock") ||
        (userAction === "scissors" && action === "paper")
      ) {
        setResult("win");
      } else {
        setResult("lose");
      }
    });

    // cleanup
    return () => {
      socket.off("game:checkMove");
    };
  }, [socket, userAction, opponentAction]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "rock":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        );
      case "paper":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "scissors":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0 0L9.121 9.121"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getResultMessage = () => {
    if (!result) return null;

    let message = "";
    let colorClass = "";

    switch (result) {
      case "win":
        message = "You Win!";
        colorClass = "text-green-600";
        break;
      case "lose":
        message = "You Lose!";
        colorClass = "text-red-600";
        break;
      case "draw":
        message = "It's a Draw!";
        colorClass = "text-yellow-600";
        break;
      default:
        return null;
    }

    return (
      <div className={`text-center mt-6 ${colorClass}`}>
        <h2 className="text-2xl font-bold">{message}</h2>
      </div>
    );
  };

  return (
    <Layout showHeader={true} title="Jan-Ken-Po Game">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Rock Paper Scissors
          </h1>
          <p className="mt-2 text-lg text-gray-600">Make your move!</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Choice
              </h2>
              <div className="h-32 flex items-center justify-center">
                {userAction ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      {getActionIcon(userAction)}
                    </div>
                    <span className="text-lg font-medium capitalize">
                      {userAction}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Make your selection below
                  </p>
                )}
              </div>
            </Card>

            <Card className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Opponent's Choice
              </h2>
              <div className="h-32 flex items-center justify-center">
                {opponentAction ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                      {getActionIcon(opponentAction)}
                    </div>
                    <span className="text-lg font-medium capitalize">
                      {opponentAction}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Waiting for opponent...
                  </p>
                )}
              </div>
            </Card>
          </div>

          {getResultMessage()}

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Choose Your Move
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setUserAction("rock")}
                variant={userAction === "rock" ? "primary" : "secondary"}
                className="flex items-center"
              >
                <span className="mr-2">Rock</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>
              <Button
                onClick={() => setUserAction("paper")}
                variant={userAction === "paper" ? "primary" : "secondary"}
                className="flex items-center"
              >
                <span className="mr-2">Paper</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </Button>
              <Button
                onClick={() => setUserAction("scissors")}
                variant={userAction === "scissors" ? "primary" : "secondary"}
                className="flex items-center"
              >
                <span className="mr-2">Scissors</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0 0L9.121 9.121"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
