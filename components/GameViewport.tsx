"use client";

import { useState } from "react";
import { CoordinateDials } from "./CoordinateDials";
import { LaunchButton } from "./LaunchButton";
import { BatteryDisplay } from "./BatteryDisplay";
import { OutcomeAnimation } from "./OutcomeAnimation";

interface GameViewportProps {
  isAuthenticated: boolean;
  onRequireAuth: () => Promise<void>;
  authPending: boolean;
}

export function GameViewport({
  isAuthenticated,
  onRequireAuth,
  authPending,
}: GameViewportProps) {
  const [coordinates, setCoordinates] = useState({ x: 5, y: 5, z: 5 });
  const [isLocked, setIsLocked] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "locked" | "strike" | "outcome">("idle");

  const handleCoordinateChange = (axis: "x" | "y" | "z", value: number) => {
    if (!isLocked) {
      setCoordinates((prev) => ({ ...prev, [axis]: value }));
    }
  };

  const handleLaunch = async () => {
    if (!isAuthenticated) {
      await onRequireAuth();
      return;
    }

    // TODO: Implement transaction submission with MiniKit auth context
    setIsLocked(true);
    setGameState("locked");
  };

  return (
    <div className="w-full space-y-8">
      <div className="relative w-full h-96 border-2 border-cyan-500 rounded-lg bg-black/50">
        {/* 3D Wireframe Grid Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-mono mb-4">
              Coordinate Space: 11³ = 1,331 possible points
            </div>
            <div className="text-lg text-gray-400">
              X: {coordinates.x} | Y: {coordinates.y} | Z: {coordinates.z}
            </div>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Guest mode active. We will ask for a quick sign-in only when you launch a strike.
        </div>
      ) : null}

      <CoordinateDials
        coordinates={coordinates}
        onChange={handleCoordinateChange}
        disabled={isLocked}
      />

      <LaunchButton
        onLaunch={handleLaunch}
        isLocked={isLocked || authPending}
        gameState={gameState}
      />

      <BatteryDisplay />

      <OutcomeAnimation gameState={gameState} />
    </div>
  );
}


