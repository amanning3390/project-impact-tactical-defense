"use client";

import { useState, useEffect } from "react";
import { getGamePhase, getCurrentDay, type GameState } from "@/lib/gameLogic";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    currentDay: getCurrentDay(),
    phase: getGamePhase(),
  });

  useEffect(() => {
    const updatePhase = () => {
      setGameState((prev) => ({
        ...prev,
        phase: getGamePhase(),
        currentDay: getCurrentDay(),
      }));
    };

    // Update every minute to catch phase changes
    const interval = setInterval(updatePhase, 60000);
    updatePhase(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return gameState;
}


