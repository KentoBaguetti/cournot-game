import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Slider } from "../../components/Slider";
import { DemandCurve } from "../../components/DemandCurve";
import { EndOfRoundModal } from "../../components/EndOfRoundModal";
import { useSocket } from "../../socket";

export default function CournotGamePage() {
  const socket = useSocket();

  const [userQuantity, setUserQuantity] = useState<number>(0);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [userProfit, setUserProfit] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [recievedGameData, setRecievedGameData] = useState<boolean>(false);
  const [roundNo, setRoundNo] = useState<number>(1);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [monopolyProfit, setMonopolyProfit] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [individualProductCost, setIndividualProductCost] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [z, setZ] = useState<number>(0);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [simulatedQuantity, setSimulatedQuantity] = useState<number>(0);
  const [maxProduction] = useState<number>(20); // Default max production

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (userQuantity) {
      const marketPrice = calculateMarketPrice(x, userQuantity);
      setMarketPrice(marketPrice);
    }

    // emits
    if (userQuantity && isReady) {
      socket.emit("player:move", { action: userQuantity });
    }

    if (!isReady) {
      socket.emit("player:unready");
    }

    if (!recievedGameData) {
      socket.emit("player:getGameData");
      setRecievedGameData(true);
    }

    //listeners
    socket.on("server:cournotInfo", (data) => {
      console.log("cournot info", data);
      setX(data.x);
      setY(data.y);
      setZ(data.z);
      // Initialize simulated quantity to 0
      setSimulatedQuantity(0);
    });

    socket.on("server:userRoundEnd", ({ userProfit }) => {
      setUserProfit(userProfit);
      setShowEndModal(true);
    });

    socket.on("server:roundStart", ({ roundNo }) => {
      setRoundNo(roundNo);
      setIsReady(false);
      setUserQuantity(0);
    });

    socket.on("server:timerUpdate", ({ remainingTime }) => {
      setTimeRemaining(remainingTime);
      const [minutes, seconds] = parseTimeRemaining(remainingTime);
      setMinutes(minutes);
      setSeconds(seconds);
    });

    socket.on(
      "server:roomRoundEnd",
      ({
        totalProfit,
        monopolyProfit,
        totalQuantity,
        individualProductCost,
      }) => {
        setTotalProfit(totalProfit);
        setMonopolyProfit(monopolyProfit);
        setTotalQuantity(totalQuantity);
        setIndividualProductCost(individualProductCost);
      }
    );

    // cleanup
    return () => {
      socket.off("server:cournotInfo");
      socket.off("server:userRoundEnd");
      socket.off("server:roundStart");
      socket.off("server:timerUpdate");
      socket.off("server:roomRoundEnd");
    };
  }, [
    socket,
    userQuantity,
    x,
    isReady,
    recievedGameData,
    roundNo,
    timeRemaining,
  ]);

  // parse the remaining seconds into minutes and seconds
  const parseTimeRemaining = (remainingTime: number): [number, number] => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return [minutes, seconds];
  };

  const handleSubmitProduction = () => {
    setIsReady(!isReady);
    console.log(userQuantity);
  };

  const handleNextRound = () => {
    setShowEndModal(false);
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // this helper method will be for the market price calculator to aid students
  const calculateMarketPrice = (x: number, totalMarketProduction: number) => {
    return Math.max(0, x - totalMarketProduction);
  };

  // Calculate simulated profit
  const calculateProfit = (quantity: number, price: number, cost: number) => {
    return quantity * (price - cost);
  };

  const simulatedPrice = calculateMarketPrice(x, simulatedQuantity);
  const simulatedProfit = calculateProfit(
    simulatedQuantity,
    simulatedPrice,
    individualProductCost
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-20 w-32 h-32 bg-blue-500/20 transform rotate-12"></div>
        <div className="absolute right-20 top-32 w-24 h-24 bg-blue-500/20 transform -rotate-12"></div>
        <div className="absolute left-1/3 bottom-20 w-28 h-28 bg-blue-500/20 transform rotate-6"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-700 rounded-xl px-4 py-2">
                <h1 className="text-2xl font-bold">Kasper Production</h1>
              </div>
              <div className="text-blue-200">Round {roundNo}</div>
              {/* Connection Status */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  socket ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {socket ? "Connected" : "Disconnected"}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`px-4 py-2 rounded-xl font-medium flex items-center space-x-2 ${
                  timeRemaining > 30
                    ? "bg-green-500 text-white"
                    : timeRemaining > 10
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatTime(minutes, seconds)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Game Info */}
          <div className="space-y-6">
            {/* Game Parameters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Game Parameters
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-3 mb-2">
                    <div className="text-sm text-blue-600 font-medium">
                      Base Demand (X)
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{x}</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-3 mb-2">
                    <div className="text-sm text-blue-600 font-medium">
                      Fixed Cost (Y)
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{y}</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-xl p-3 mb-2">
                    <div className="text-sm text-blue-600 font-medium">
                      Variable Cost (Z)
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{z}</div>
                </div>
              </div>
            </div>

            {/* Room Data */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Room Data
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Profit:</span>
                  <span className="font-medium text-gray-900">
                    ${totalProfit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monopoly Profit:</span>
                  <span className="font-medium text-gray-900">
                    ${monopolyProfit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium text-gray-900">
                    {totalQuantity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost Per Kasper:</span>
                  <span className="font-medium text-gray-900">
                    ${individualProductCost}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Production Control */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Production</h2>
              <div className="text-6xl font-bold mb-4">
                Kasper: {userQuantity}
              </div>
            </div>

            {!isReady ? (
              <div className="space-y-8">
                <Slider
                  value={userQuantity}
                  onChange={setUserQuantity}
                  min={0}
                  max={Math.min(x, maxProduction)}
                  className="mb-8"
                />

                <Button
                  onClick={handleSubmitProduction}
                  variant="success"
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 text-xl"
                  disabled={timeRemaining === 0 || !socket}
                >
                  {!socket ? "Disconnected" : "Produce"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Production Submitted!
                </h3>
                <p className="text-white/80 mb-4">
                  You chose to produce{" "}
                  <span className="font-bold">{userQuantity}</span> Kaspers
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-sm">Waiting for other players...</p>
                </div>
                <Button
                  onClick={handleSubmitProduction}
                  variant="warning"
                  className="mt-4"
                >
                  Unconfirm
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Market Simulator & Demand Curve */}
          <div className="space-y-6">
            {/* Market Simulator */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Market Simulator
              </h3>
              <p className="text-gray-600 mb-4">
                Use this slider to simulate different market scenarios.
              </p>
              <Slider
                value={simulatedQuantity}
                onChange={setSimulatedQuantity}
                min={0}
                max={Math.min(x, maxProduction)}
                label="Simulated Production"
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-800 font-medium">
                    Simulated Price:
                  </span>
                  <span className="text-blue-800 font-bold text-xl">
                    ${simulatedPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">
                    Simulated Profit:
                  </span>
                  <span className="text-blue-800 font-bold text-xl">
                    ${simulatedProfit}
                  </span>
                </div>
              </div>
            </div>

            {/* Demand Curve */}
            <DemandCurve
              simulatedQuantity={simulatedQuantity}
              maxProduction={Math.min(x * 2, maxProduction * 2)}
              x={x}
              calculateMarketPrice={calculateMarketPrice}
            />
          </div>
        </div>
      </div>

      {/* End of Round Modal */}
      <EndOfRoundModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        roundData={{
          roundNumber: roundNo,
          totalProduction: totalQuantity,
          yourProduction: userQuantity,
          marketPrice: marketPrice,
          individualProductCost: individualProductCost,
          yourProfit: userProfit,
          isLastRound: roundNo >= 5,
        }}
        onNextRound={handleNextRound}
      />
    </div>
  );
}
