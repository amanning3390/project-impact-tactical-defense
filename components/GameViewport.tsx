"use client";

import { useState, useEffect } from "react";
import { CoordinateDials } from "./CoordinateDials";
import { LaunchButton } from "./LaunchButton";
import { BatteryDisplay } from "./BatteryDisplay";
import { OutcomeAnimation } from "./OutcomeAnimation";
import { WireframeGrid } from "./WireframeGrid";
import { PhaseIndicator } from "./PhaseIndicator";
import { useGameContract } from "@/lib/contractHooks";
import { getGamePhase } from "@/lib/gameLogic";
import { useToast } from "./NotificationToast";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  const {
    dailyCycle,
    userSubmission,
    matchResult,
    submitCoordinates,
    isSubmitting,
    isSubmitted,
    refetch,
  } = useGameContract();

  // Determine game state from contract and phase
  const phase = getGamePhase();
  const gameState: "idle" | "locked" | "strike" | "outcome" = 
    phase === "targeting" ? "idle" :
    phase === "locked" ? "locked" :
    phase === "strike" ? "strike" :
    phase === "outcome" ? "outcome" :
    "idle";

  const isLocked = userSubmission !== null || phase !== "targeting" || isSubmitting;

  // Update coordinates if user has already submitted
  useEffect(() => {
    if (userSubmission) {
      setCoordinates({
        x: userSubmission.x,
        y: userSubmission.y,
        z: userSubmission.z,
      });
    }
  }, [userSubmission]);

  // Refetch when phase changes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refetch every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

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

    if (isLocked || phase !== "targeting") {
      return;
    }

    setSubmitError(null);

    try {
      await submitCoordinates(coordinates.x, coordinates.y, coordinates.z);
      // Transaction submitted, state will update via hooks
      showToast({
        type: "success",
        message: "Coordinates submitted successfully!",
      });
      refetch();
    } catch (error: any) {
      console.error("Error submitting coordinates:", error);
      const errorMsg = error?.message || error?.shortMessage || "Failed to submit coordinates. Please try again.";
      setSubmitError(errorMsg);
      showToast({
        type: "error",
        message: errorMsg,
        action: {
          label: "Retry",
          onClick: handleLaunch,
        },
      });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Phase Indicator */}
      <PhaseIndicator />

      {/* 3D Wireframe Grid Visualization */}
      <div className="relative w-full h-96 border-2 border-primary/40 rounded-lg bg-black/50 overflow-hidden">
        <WireframeGrid
          userCoordinates={coordinates}
          winningCoordinates={
            dailyCycle?.coordinatesSet
              ? {
                  x: dailyCycle.winningX,
                  y: dailyCycle.winningY,
                  z: dailyCycle.winningZ,
                }
              : undefined
          }
          className="h-full"
        />
      </div>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Guest mode active. We will ask for a quick sign-in only when you launch a strike.
        </div>
      ) : null}

      {submitError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          Error: {submitError}
        </div>
      )}

      {isSubmitting && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-4 text-sm text-cyan-200">
          Submitting coordinates... Please confirm the transaction in your wallet.
        </div>
      )}

      {isSubmitted && userSubmission && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-200">
          ✓ Coordinates submitted successfully! ({userSubmission.x}, {userSubmission.y}, {userSubmission.z})
        </div>
      )}

      <CoordinateDials
        coordinates={coordinates}
        onChange={handleCoordinateChange}
        disabled={isLocked}
      />

      <LaunchButton
        onLaunch={handleLaunch}
        isLocked={isLocked || authPending || isSubmitting}
        gameState={gameState}
      />

      <BatteryDisplay />

      <OutcomeAnimation 
        gameState={gameState}
        dailyCycle={dailyCycle}
        userSubmission={userSubmission}
        matchResult={matchResult}
      />
    </div>
  );
}


