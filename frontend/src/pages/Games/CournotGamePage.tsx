import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Slider } from "../../components/Slider";
import { DemandCurve } from "../../components/DemandCurve";
import { EndOfRoundModal } from "../../components/EndOfRoundModal";
import { useSocket } from "../../socket";

interface RoundHistoryItem {
  round: number;
  totalProduction: number;
  yourProduction: number;
  marketPrice: number;
  costPerBarrel: number;
  yourProfit: number;
}

export default function CournotGamePage() {
  const socket = useSocket();

  const [userQuantity, setUserQuantity] = useState<number>(0);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [userProfit, setUserProfit] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [recievedGameData, setRecievedGameData] = useState<boolean>(false);
  const [roundNo, setRoundNo] = useState<number>(1);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [individualProductCost, setIndividualProductCost] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [x, setX] = useState<number>(0);
  const [simulatedQuantity, setSimulatedQuantity] = useState<number>(1);
  const [totalProductionQuantity, setTotalProductionQuantity] =
    useState<number>(0);
  const [numberOfFirms, setNumberOfFirms] = useState<number>(0);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [roundHistory] = useState<RoundHistoryItem[]>([
    // TEMP: Sample data for history
    {
      round: 1,
      totalProduction: 14,
      yourProduction: 5,
      marketPrice: 16,
      costPerBarrel: 6,
      yourProfit: 50,
    },
    {
      round: 2,
      totalProduction: 9,
      yourProduction: 0,
      marketPrice: 21,
      costPerBarrel: 6,
      yourProfit: 0,
    },
  ]);

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
      setIndividualProductCost(data.z);
      setNumberOfFirms(data.numberOfFirms);
      setTotalProductionQuantity(Math.round(data.totalProductionQuantity));
      setSimulatedQuantity(1);
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
      ({ totalQuantity, individualProductCost }) => {
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
  const calculateMarketPrice = (
    perUnitCost: number,
    totalMarketProduction: number
  ) => {
    return Math.max(0, perUnitCost - totalMarketProduction);
  };

  const simulatedPrice = calculateMarketPrice(x, simulatedQuantity);

  // Use a safe default value for max production in case totalProductionQuantity is 0
  const maxProductionForSimulation = Math.round(
    totalProductionQuantity > 0 ? totalProductionQuantity : x > 0 ? x : 30
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background elements - oil rig silhouettes */}
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
                <h1 className="text-2xl font-bold">Oil Barrel Production</h1>
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
              {/* History Button */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
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
                History
              </button>

              {/* Timer */}
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

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Key Info Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-xl p-3 mb-2">
                <div className="text-sm text-blue-600 font-medium">
                  Per Barrel Cost
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                ${individualProductCost}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-xl p-3 mb-2">
                <div className="text-sm text-blue-600 font-medium">
                  Maximum Production
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {Math.round(totalProductionQuantity / numberOfFirms)}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-xl p-3 mb-2">
                <div className="text-sm text-blue-600 font-medium">
                  Total Firms
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {numberOfFirms}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Panel - Production Control */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Production</h2>
              <div className="text-6xl font-bold mb-4">
                Barrels: {userQuantity}
              </div>
            </div>

            {!isReady ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">0</span>
                  <span className="text-xl">Max</span>
                </div>
                <Slider
                  value={userQuantity}
                  onChange={setUserQuantity}
                  min={0}
                  max={Math.round(
                    Math.min(x, totalProductionQuantity / numberOfFirms)
                  )}
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
                  <span className="font-bold">{userQuantity}</span> Barrels
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
          <div>
            {/* Market Simulator */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Barrel Price Calculator
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-100 rounded-xl p-4 text-center">
                  <div className="text-sm text-blue-800 mb-1">
                    Market Production
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    {simulatedQuantity}
                  </div>
                </div>

                <div className="bg-blue-100 rounded-xl p-4 text-center">
                  <div className="text-sm text-blue-800 mb-1">Market Price</div>
                  <div className="text-3xl font-bold text-blue-900">
                    ${simulatedPrice}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Adjust the total market production to see how it affects the
                  Barrel price.
                </p>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">0</span>
                  <span className="text-sm text-gray-600">
                    {maxProductionForSimulation}
                  </span>
                </div>

                <Slider
                  value={simulatedQuantity}
                  onChange={setSimulatedQuantity}
                  min={0}
                  max={maxProductionForSimulation}
                />
              </div>
            </div>

            {/* Demand Curve */}
            <DemandCurve
              simulatedQuantity={simulatedQuantity}
              maxProduction={maxProductionForSimulation}
              x={x}
              perUnitCost={individualProductCost}
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden relative">
            {/* Close button */}
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="bg-blue-700 text-white p-6">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mr-3"
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
                <h2 className="text-2xl font-bold">Round History</h2>
              </div>
              <p className="text-blue-200 mt-1">
                View your performance across all rounds
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="py-3 px-4 text-left text-blue-700 rounded-l-lg">
                        Round
                      </th>
                      <th className="py-3 px-4 text-left text-blue-700">
                        Total Production
                      </th>
                      <th className="py-3 px-4 text-left text-blue-700">
                        Your Production
                      </th>
                      <th className="py-3 px-4 text-left text-blue-700">
                        Barrel Price
                      </th>
                      <th className="py-3 px-4 text-left text-blue-700">
                        Cost Per Barrel
                      </th>
                      <th className="py-3 px-4 text-left text-blue-700 rounded-r-lg">
                        Your Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundHistory.map((round, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4">{round.round}</td>
                        <td className="py-4 px-4">{round.totalProduction}</td>
                        <td className="py-4 px-4">{round.yourProduction}</td>
                        <td className="py-4 px-4">${round.marketPrice}</td>
                        <td className="py-4 px-4">${round.costPerBarrel}</td>
                        <td className="py-4 px-4">${round.yourProfit}</td>
                      </tr>
                    ))}
                    {/* Add placeholder rows for future rounds */}
                    {[...Array(5 - roundHistory.length)].map((_, index) => (
                      <tr
                        key={`placeholder-${index}`}
                        className="border-b border-gray-100"
                      >
                        <td className="py-4 px-4">
                          {roundHistory.length + index + 1}
                        </td>
                        <td className="py-4 px-4">-</td>
                        <td className="py-4 px-4">-</td>
                        <td className="py-4 px-4">-</td>
                        <td className="py-4 px-4">-</td>
                        <td className="py-4 px-4">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 flex justify-end">
              <Button
                onClick={() => setShowHistoryModal(false)}
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
