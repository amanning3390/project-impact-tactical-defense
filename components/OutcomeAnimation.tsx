"use client";

interface OutcomeAnimationProps {
  gameState: "idle" | "locked" | "strike" | "outcome";
}

export function OutcomeAnimation({ gameState }: OutcomeAnimationProps) {
  if (gameState === "idle" || gameState === "locked") {
    return null;
  }

  if (gameState === "strike") {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-4xl font-bold text-cyan-400 animate-pulse">
          THE STRIKE
        </div>
        <div className="mt-4 text-lg text-gray-400">
          Calculating asteroid trajectory...
        </div>
      </div>
    );
  }

  // Outcome state - would show success or failure
  return (
    <div className="w-full p-8 text-center">
      <div className="text-4xl font-bold stable-era">
        OUTCOME CALCULATED
      </div>
    </div>
  );
}

