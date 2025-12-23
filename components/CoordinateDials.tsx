"use client";

interface CoordinateDialsProps {
  coordinates: { x: number; y: number; z: number };
  onChange: (axis: "x" | "y" | "z", value: number) => void;
  disabled: boolean;
}

export function CoordinateDials({ coordinates, onChange, disabled }: CoordinateDialsProps) {
  const handleChange = (axis: "x" | "y" | "z", value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      onChange(axis, numValue);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      {(["x", "y", "z"] as const).map((axis) => (
        <div key={axis} className="text-center">
          <label className="block text-2xl font-bold mb-4 uppercase text-cyan-400">
            {axis} Axis
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              value={coordinates[axis]}
              onChange={(e) => handleChange(axis, e.target.value)}
              disabled={disabled}
              className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
            />
            <div className="mt-4 text-4xl font-mono text-cyan-300">
              {coordinates[axis]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


