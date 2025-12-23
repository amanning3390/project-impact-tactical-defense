"use client";

interface LaunchButtonProps {
  onLaunch: () => void;
  isLocked: boolean;
  gameState: "idle" | "locked" | "strike" | "outcome";
}

export function LaunchButton({ onLaunch, isLocked, gameState }: LaunchButtonProps) {
  const getButtonText = () => {
    if (gameState === "locked") return "LOCKED";
    if (gameState === "strike") return "THE STRIKE";
    if (gameState === "outcome") return "RE-ARM";
    return "LAUNCH";
  };

  const getButtonClass = () => {
    const base = "w-full py-6 px-8 text-3xl font-bold rounded-lg transition-all duration-300 ";
    if (isLocked) {
      return base + "bg-gray-600 text-gray-300 cursor-not-allowed";
    }
    return base + "bg-cyan-500 hover:bg-cyan-600 text-black shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70";
  };

  return (
    <button
      onClick={onLaunch}
      disabled={isLocked && gameState !== "outcome"}
      className={getButtonClass()}
    >
      {getButtonText()}
    </button>
  );
}


