"use client";

import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface LaunchButtonProps {
  onLaunch: () => void;
  isLocked: boolean;
  gameState: "idle" | "locked" | "strike" | "outcome";
}

export function LaunchButton({ onLaunch, isLocked, gameState }: LaunchButtonProps) {
  const { hapticFeedback } = useHapticFeedback();
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (!isLocked || gameState === "outcome") {
      hapticFeedback("medium");
      onLaunch();
    }
  };

  const getButtonText = () => {
    if (gameState === "locked") return "🔒 LOCKED";
    if (gameState === "strike") return "⚡ THE STRIKE";
    if (gameState === "outcome") return "🔄 RE-ARM";
    return "🚀 LAUNCH";
  };

  const getButtonConfig = () => {
    if (isLocked && gameState !== "outcome") {
      return {
        bg: "bg-gray-700",
        text: "text-gray-400",
        border: "border-gray-600",
        shadow: "",
        animation: "",
        cursor: "cursor-not-allowed",
      };
    }

    switch (gameState) {
      case "strike":
        return {
          bg: "bg-error",
          text: "text-white",
          border: "border-error",
          shadow: "shadow-lg shadow-error/50",
          animation: "animate-neon-pulse",
          cursor: "cursor-pointer hover:bg-error-dark",
        };
      case "outcome":
        return {
          bg: "bg-success",
          text: "text-white",
          border: "border-success",
          shadow: "shadow-lg shadow-success/50",
          animation: "",
          cursor: "cursor-pointer hover:bg-success-dark",
        };
      default:
        return {
          bg: "bg-primary",
          text: "text-black",
          border: "border-primary",
          shadow: "shadow-neon-cyan-lg",
          animation: "animate-neon-pulse",
          cursor: "cursor-pointer hover:brightness-110",
        };
    }
  };

  const config = getButtonConfig();
  const disabled = isLocked && gameState !== "outcome";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full py-6 sm:py-8 px-8
        ${isMobile ? "text-2xl" : "text-3xl sm:text-4xl"}
        font-bold font-mono uppercase rounded-xl
        border-4 ${config.border}
        ${config.bg} ${config.text} ${config.shadow}
        ${config.animation}
        ${config.cursor}
        transition-all duration-300
        ${!disabled && "active:scale-95 active:shadow-none"}
        ${!disabled && "transform hover:scale-[1.02]"}
        touch-target
      `}
      aria-label={getButtonText()}
    >
      <div className="flex items-center justify-center gap-3">
        {getButtonText()}
      </div>

      {/* Loading bar for locked state */}
      {gameState === "locked" && (
        <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-warning animate-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
              backgroundSize: "200% 100%",
            }}
          ></div>
        </div>
      )}
    </button>
  );
}


