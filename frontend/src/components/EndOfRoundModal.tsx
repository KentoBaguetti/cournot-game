import { Button } from "./Button";

interface EndOfRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundData: {
    roundNumber: number;
    totalProduction: number;
    yourProduction: number;
    marketPrice: number;
    individualProductCost: number;
    yourProfit: number;
    isLastRound: boolean;
  };
  onNextRound: () => void;
}

export function EndOfRoundModal({
  isOpen,
  onClose,
  roundData,
  onNextRound,
}: EndOfRoundModalProps) {
  if (!isOpen) return null;

  const {
    roundNumber,
    totalProduction,
    yourProduction,
    marketPrice,
    individualProductCost,
    yourProfit,
    isLastRound,
  } = roundData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-300 hover:text-blue-100 transition-colors z-10"
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
          <h2 className="text-2xl font-bold">End of Round</h2>
          <p className="text-blue-200 mt-1">Round {roundNumber} Results</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Market Summary */}
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <h3 className="text-sm text-blue-800 font-medium">
                Total
                <br />
                Production
              </h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {totalProduction}
              </p>
            </div>

            <div className="bg-blue-100 p-3 rounded-lg">
              <h3 className="text-sm text-blue-800 font-medium">
                Your
                <br />
                Production
              </h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {yourProduction}
              </p>
            </div>

            <div className="bg-blue-100 p-3 rounded-lg">
              <h3 className="text-sm text-blue-800 font-medium">
                Barrel
                <br />
                Price
              </h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${marketPrice}
              </p>
            </div>

            <div className="bg-blue-100 p-3 rounded-lg">
              <h3 className="text-sm text-blue-800 font-medium">
                Cost
                <br />
                Per Barrel
              </h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${individualProductCost}
              </p>
            </div>

            <div className="bg-blue-100 p-3 rounded-lg">
              <h3 className="text-sm text-blue-800 font-medium">
                Your
                <br />
                Profit
              </h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${yourProfit}
              </p>
            </div>
          </div>

          {/* Profit Calculation */}
          <div className="mt-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-200">Your Profit</p>
                <p className="text-4xl font-bold">${yourProfit}</p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  yourProfit > 0
                    ? "bg-green-500"
                    : yourProfit < 0
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              >
                {yourProfit > 0 ? (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : yourProfit < 0 ? (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-200">
              <p>Profit = Production × (Market Price - Unit Cost)</p>
              <p className="mt-1">
                ${yourProfit} = {yourProduction} × (${marketPrice} - $
                {individualProductCost})
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-end">
          <Button
            onClick={onNextRound}
            variant="primary"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLastRound ? "See Final Results" : "Next Round"}
          </Button>
        </div>
      </div>
    </div>
  );
}
