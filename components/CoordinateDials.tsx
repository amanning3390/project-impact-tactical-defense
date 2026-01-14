"use client";

import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface CoordinateDialsProps {
  coordinates: { x: number; y: number; z: number };
  onChange: (axis: "x" | "y" | "z", value: number) => void;
  disabled: boolean;
}

export function CoordinateDials({ coordinates, onChange, disabled }: CoordinateDialsProps) {
  const { hapticTick } = useHapticFeedback();
  const isMobile = useIsMobile();

  const handleChange = (axis: "x" | "y" | "z", value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      if (coordinates[axis] !== numValue) {
        hapticTick();
        onChange(axis, numValue);
      }
    }
  };

  const handleIncrement = (axis: "x" | "y" | "z") => {
    if (coordinates[axis] < 10) {
      hapticTick();
      onChange(axis, coordinates[axis] + 1);
    }
  };

  const handleDecrement = (axis: "x" | "y" | "z") => {
    if (coordinates[axis] > 0) {
      hapticTick();
      onChange(axis, coordinates[axis] - 1);
    }
  };

  const axisColors = {
    x: "text-primary border-primary shadow-neon-cyan",
    y: "text-secondary border-secondary shadow-neon-amber",
    z: "text-success border-success",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
      {(["x", "y", "z"] as const).map((axis) => (
        <div key={axis} className="text-center">
          {/* Label */}
          <label 
            className={`block text-xl sm:text-2xl font-bold font-mono mb-3 sm:mb-4 uppercase ${axisColors[axis]}`}
            htmlFor={`dial-${axis}`}
          >
            {axis} Axis
          </label>

          {/* Dial Container */}
          <div className="relative bg-surface/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border-2 border-surface">
            {/* +/- Buttons for Mobile */}
            {isMobile && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => handleDecrement(axis)}
                  disabled={disabled || coordinates[axis] === 0}
                  className={`
                    touch-target px-6 py-3 rounded-lg font-bold text-lg
                    ${disabled || coordinates[axis] === 0
                      ? "bg-gray-700 text-gray-500"
                      : `bg-surface border-2 ${axisColors[axis].split(" ")[1]} text-white hover:bg-surface-light`
                    }
                    transition-all active:scale-95
                  `}
                  aria-label={`Decrease ${axis}`}
                >
                  −
                </button>
                <button
                  onClick={() => handleIncrement(axis)}
                  disabled={disabled || coordinates[axis] === 10}
                  className={`
                    touch-target px-6 py-3 rounded-lg font-bold text-lg
                    ${disabled || coordinates[axis] === 10
                      ? "bg-gray-700 text-gray-500"
                      : `bg-surface border-2 ${axisColors[axis].split(" ")[1]} text-white hover:bg-surface-light`
                    }
                    transition-all active:scale-95
                  `}
                  aria-label={`Increase ${axis}`}
                >
                  +
                </button>
              </div>
            )}

            {/* Slider with tick marks */}
            <div className="relative px-2">
              <input
                id={`dial-${axis}`}
                type="range"
                min="0"
                max="10"
                value={coordinates[axis]}
                onChange={(e) => handleChange(axis, e.target.value)}
                disabled={disabled}
                className={`
                  w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:${axisColors[axis].split(" ")[0].replace("text-", "bg-")}
                  [&::-webkit-slider-thumb]:${axisColors[axis].split(" ")[2]}
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:${axisColors[axis].split(" ")[0].replace("text-", "bg-")}
                  [&::-moz-range-thumb]:cursor-pointer
                `}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={coordinates[axis]}
              />

              {/* Tick marks */}
              <div className="flex justify-between mt-2 px-1">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className={`text-xs font-mono ${
                      coordinates[axis] === i
                        ? axisColors[axis].split(" ")[0]
                        : "text-gray-600"
                    }`}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Large Value Display */}
            <div
              className={`
                mt-4 text-5xl sm:text-6xl font-mono font-bold
                ${axisColors[axis].split(" ")[0]}
                ${!disabled && "animate-dial-tick"}
                transition-all duration-200
              `}
            >
              {coordinates[axis].toString().padStart(2, "0")}
            </div>

            {/* Validation Indicator */}
            <div className="mt-2 text-xs text-gray-500">
              Range: 0-10
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


