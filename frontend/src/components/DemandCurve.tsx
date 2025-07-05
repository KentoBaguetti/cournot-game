import React from "react";

interface DemandCurveProps {
  simulatedQuantity: number;
  maxProduction: number;
  x: number;
  perUnitCost: number;
  calculateMarketPrice: (x: number, totalProduction: number) => number;
}

export const DemandCurve: React.FC<DemandCurveProps> = ({
  simulatedQuantity,
  maxProduction,
  x,
  perUnitCost,
  calculateMarketPrice,
}) => {
  const width = 300;
  const height = 200;
  const padding = 40;

  // Calculate points for the demand curve
  const points: string[] = [];
  for (let q = 0; q <= maxProduction; q += 1) {
    const price = calculateMarketPrice(perUnitCost, q);
    const plotX = padding + (q / maxProduction) * (width - 2 * padding);
    const plotY =
      height - padding - (price / perUnitCost) * (height - 2 * padding);
    points.push(`${plotX},${plotY}`);
  }

  // Simulated point
  const simulatedPrice = calculateMarketPrice(perUnitCost, simulatedQuantity);
  const simulatedX =
    padding + (simulatedQuantity / maxProduction) * (width - 2 * padding);
  const simulatedY =
    height - padding - (simulatedPrice / perUnitCost) * (height - 2 * padding);

  // Check if simulated is near origin
  const isSimulatedNearOrigin = simulatedQuantity < maxProduction * 0.05;

  // Check if price is near max or min to avoid label overlap with axis labels
  const isPriceNearMax = simulatedPrice > perUnitCost * 0.85;
  const isPriceNearMin = simulatedPrice < perUnitCost * 0.15;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Barrel Price Chart
        </h3>
        <div className="flex items-center">
          <div className="flex items-center space-x-2 mr-3">
            <div className="w-3 h-3 rounded-full bg-blue-300 border-2 border-blue-600"></div>
            <span className="text-xs text-blue-800">
              Barrels: {simulatedQuantity}
            </span>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-xl">
            <span className="text-xs text-blue-800 whitespace-nowrap">
              P={x}-Q
            </span>
          </div>
        </div>
      </div>

      <svg
        width={width}
        height={height}
        className="border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mx-auto"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Demand curve */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#1e40af"
          strokeWidth="3"
          className="drop-shadow-sm"
        />

        {/* Axis labels and tick marks */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-xs fill-gray-600 font-medium"
        >
          Total Market Production (Quantity)
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          className="text-xs fill-gray-600 font-medium"
          transform={`rotate(-90 15 ${height / 2})`}
        >
          Market Price ($)
        </text>

        {/* Tick marks */}
        <line
          x1={padding}
          y1={height - padding}
          x2={padding}
          y2={height - padding + 5}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <text
          x={padding}
          y={height - padding + 15}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          0
        </text>

        <line
          x1={width - padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding + 5}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <text
          x={width - padding}
          y={height - padding + 15}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          {maxProduction}
        </text>

        <line
          x1={padding - 5}
          y1={padding}
          x2={padding}
          y2={padding}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <text
          x={padding - 10}
          y={padding}
          textAnchor="end"
          className="text-xs fill-gray-600"
          dominantBaseline="middle"
        >
          ${x}
        </text>

        <line
          x1={padding - 5}
          y1={height - padding}
          x2={padding}
          y2={height - padding}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <text
          x={padding - 10}
          y={height - padding}
          textAnchor="end"
          className="text-xs fill-gray-600"
          dominantBaseline="middle"
        >
          $0
        </text>

        {/* Simulated point - always show */}
        <>
          {/* Dashed lines to axes */}
          <line
            x1={simulatedX}
            y1={simulatedY}
            x2={simulatedX}
            y2={height - padding}
            stroke="#93c5fd"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <line
            x1={simulatedX}
            y1={simulatedY}
            x2={padding}
            y2={simulatedY}
            stroke="#93c5fd"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Point */}
          <circle
            cx={simulatedX}
            cy={simulatedY}
            r="6"
            fill="#93c5fd"
            stroke="#2563eb"
            strokeWidth="2"
            className="drop-shadow-lg"
          />

          {/* Show label if not near origin */}
          {!isSimulatedNearOrigin && (
            <text
              x={simulatedX}
              y={height - padding + 15}
              textAnchor="middle"
              className="text-xs font-medium fill-blue-600"
            >
              {simulatedQuantity}
            </text>
          )}

          {/* Only show price label if not near max or min price (to avoid overlap with axis labels) */}
          {!isPriceNearMax && !isPriceNearMin && (
            <text
              x={padding - 10}
              y={simulatedY}
              textAnchor="end"
              className="text-xs font-medium fill-blue-600"
              dominantBaseline="middle"
            >
              ${simulatedPrice}
            </text>
          )}
        </>
      </svg>

      <div className="mt-4 text-xs text-gray-500 text-center">
        The chart shows how barrel price changes with total market production
      </div>
    </div>
  );
};
