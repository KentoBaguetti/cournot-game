import React, { useState, useEffect, useRef } from "react";

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = "",
  showValue = true,
  label,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    const newValue = Math.floor((position * (max - min) + min) / step) * step;

    onChange(Math.min(Math.max(newValue, min), max));
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateValue(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 0) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    if (touch) {
      updateValue(touch.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const handleStart = () => {
    setIsDragging(true);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showValue && (
            <span className="text-sm font-medium text-blue-600">{value}</span>
          )}
        </div>
      )}
      <div className="relative h-10">
        <div
          ref={trackRef}
          className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 rounded-full bg-gray-200 cursor-pointer"
          onClick={handleTrackClick}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              updateValue(e.touches[0].clientX);
            }
            handleStart();
          }}
        >
          {/* Filled track */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-grab ${
            isDragging ? "cursor-grabbing" : ""
          }`}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        />

        {/* Value labels */}
        <div className="absolute top-8 left-0 right-0 flex justify-between text-xs text-white">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};
