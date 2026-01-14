"use client";

import { useState, useEffect } from "react";
import { getGamePhase, getCurrentUTCHour } from "@/lib/gameLogic";
import { useIsMobile } from "@/hooks/useMediaQuery";

type Phase = "targeting" | "locked" | "strike" | "outcome" | "reset";

interface PhaseInfo {
  name: string;
  icon: string;
  color: string;
  nextPhaseTime: string;
}

const PHASE_INFO: Record<Phase, PhaseInfo> = {
  targeting: {
    name: "Targeting",
    icon: "🎯",
    color: "text-primary",
    nextPhaseTime: "21:00 UTC",
  },
  locked: {
    name: "Locked",
    icon: "🔒",
    color: "text-warning",
    nextPhaseTime: "22:00 UTC",
  },
  strike: {
    name: "The Strike",
    icon: "⚡",
    color: "text-error",
    nextPhaseTime: "23:00 UTC",
  },
  outcome: {
    name: "Outcome",
    icon: "📊",
    color: "text-success",
    nextPhaseTime: "00:00 UTC",
  },
  reset: {
    name: "Reset",
    icon: "🔄",
    color: "text-gray-400",
    nextPhaseTime: "21:00 UTC",
  },
};

export function PhaseIndicator() {
  const [phase, setPhase] = useState<Phase>(getGamePhase());
  const [expanded, setExpanded] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const updatePhase = () => {
      setPhase(getGamePhase());
      
      // Calculate time until next phase
      const currentHour = getCurrentUTCHour();
      const currentMinutes = new Date().getUTCMinutes();
      const currentSeconds = new Date().getUTCSeconds();
      
      let nextPhaseHour = 21;
      if (currentHour >= 21 && currentHour < 22) nextPhaseHour = 22;
      else if (currentHour >= 22 && currentHour < 23) nextPhaseHour = 23;
      else if (currentHour >= 23) nextPhaseHour = 24; // Next day
      
      const hoursUntil = (nextPhaseHour - currentHour + 24) % 24;
      const minutesUntil = 60 - currentMinutes - 1;
      const secondsUntil = 60 - currentSeconds;
      
      if (hoursUntil > 0) {
        setTimeUntilNext(`${hoursUntil}h ${minutesUntil}m`);
      } else {
        setTimeUntilNext(`${minutesUntil}m ${secondsUntil}s`);
      }
    };

    updatePhase();
    const interval = setInterval(updatePhase, 1000);

    return () => clearInterval(interval);
  }, []);

  const info = PHASE_INFO[phase];
  const progress = ((getCurrentUTCHour() % 24) / 24) * 100;

  return (
    <div 
      className={`
        ${isMobile ? "fixed top-4 right-4 z-50" : "mb-6"}
        ${expanded ? "w-64" : "w-auto"}
        transition-all duration-300
      `}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border-2
          ${expanded ? "border-primary" : "border-surface"}
          bg-black/80 backdrop-blur-sm
          hover:border-primary transition-colors
          ${isMobile ? "shadow-lg" : ""}
        `}
      >
        {/* Phase Icon */}
        <div className="relative">
          <div className={`text-2xl ${info.color}`}>{info.icon}</div>
          {/* Circular Progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-surface-light"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="100"
              strokeDashoffset={100 - progress}
              className={info.color}
            />
          </svg>
        </div>

        {/* Phase Info */}
        <div className="flex-1 text-left">
          <div className={`font-mono font-bold ${info.color}`}>{info.name}</div>
          {expanded && (
            <div className="text-xs text-gray-400 mt-1">
              Next: {timeUntilNext}
            </div>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        {!isMobile && (
          <div className="text-gray-500">
            {expanded ? "▼" : "▶"}
          </div>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 p-4 rounded-lg border border-surface bg-black/80 backdrop-blur-sm animate-slide-up">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Phase:</span>
              <span className={`font-mono ${info.color}`}>{info.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Phase:</span>
              <span className="font-mono text-primary">{info.nextPhaseTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time Until:</span>
              <span className="font-mono text-warning">{timeUntilNext}</span>
            </div>
          </div>

          {/* Phase Timeline */}
          <div className="mt-4 space-y-1">
            <div className="text-xs text-gray-500 mb-2">Daily Cycle:</div>
            {Object.entries(PHASE_INFO).map(([key, value]) => (
              <div
                key={key}
                className={`
                  flex items-center gap-2 text-xs p-1 rounded
                  ${phase === key ? "bg-surface" : ""}
                `}
              >
                <span>{value.icon}</span>
                <span className={phase === key ? value.color : "text-gray-500"}>
                  {value.name}
                </span>
                <span className="ml-auto text-gray-600">{value.nextPhaseTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
