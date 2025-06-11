import React from 'react';

interface DemandCurveProps {
  totalProduction: number;
  maxProduction: number;
  baseDemand: number;
  currentPrice: number;
}

export const DemandCurve: React.FC<DemandCurveProps> = ({
  totalProduction,
  maxProduction,
  baseDemand,
  currentPrice,
}) => {
  const width = 300;
  const height = 200;
  const padding = 40;

  // Calculate curve points
  const points: string[] = [];
  for (let x = 0; x <= maxProduction; x += 1) {
    const price = Math.max(0, baseDemand - x);
    const plotX = padding + (x / maxProduction) * (width - 2 * padding);
    const plotY = height - padding - (price / baseDemand) * (height - 2 * padding);
    points.push(`${plotX},${plotY}`);
  }

  // Current point
  const currentX = padding + (totalProduction / maxProduction) * (width - 2 * padding);
  const currentY = height - padding - (currentPrice / baseDemand) * (height - 2 * padding);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Barrel Price Calculator</h3>
        <div className="bg-blue-100 px-4 py-2 rounded-xl">
          <span className="text-sm text-blue-600 font-semibold">Market Price</span>
          <div className="text-2xl font-bold text-blue-800">${currentPrice}</div>
        </div>
      </div>
      
      <svg width={width} height={height} className="border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} 
              stroke="#374151" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} 
              stroke="#374151" strokeWidth="2" />
        
        {/* Demand curve */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        
        {/* Current point */}
        <circle
          cx={currentX}
          cy={currentY}
          r="6"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        
        {/* Labels */}
        <text x={width/2} y={height - 10} textAnchor="middle" className="text-xs fill-gray-600 font-semibold">
          Total Market Production
        </text>
        <text x={15} y={height/2} textAnchor="middle" className="text-xs fill-gray-600 font-semibold" 
              transform={`rotate(-90 15 ${height/2})`}>
          Barrel Price
        </text>
      </svg>
      
      <div className="mt-4 bg-blue-800 rounded-xl p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-200">Total Market Production:</span>
          <span className="font-bold text-xl">{totalProduction}</span>
        </div>
        <div className="w-full bg-blue-600 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-300 to-blue-100 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalProduction / maxProduction) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-blue-200 mt-1">
          <span>1</span>
          <span>{maxProduction}</span>
        </div>
      </div>
    </div>
  );
};