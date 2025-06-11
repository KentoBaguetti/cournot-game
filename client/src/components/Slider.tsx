import React, { useCallback } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = '',
  showValue = true,
  label,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  // Use useCallback to prevent unnecessary re-renders and improve responsiveness
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-white">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer slider focus:outline-none"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #d1d5db ${percentage}%, #d1d5db 100%)`
          }}
        />
        {showValue && (
          <div 
            className="absolute -top-8 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm font-semibold pointer-events-none"
            style={{ left: `${percentage}%` }}
          >
            {value}
          </div>
        )}
      </div>
      <div className="flex justify-between text-sm text-white/80">
        <span>{min}</span>
        <span>Max</span>
      </div>
    </div>
  );
};