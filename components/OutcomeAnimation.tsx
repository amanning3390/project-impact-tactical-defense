"use client";

interface OutcomeAnimationProps {
  gameState: "idle" | "locked" | "strike" | "outcome";
  dailyCycle?: {
    winningX: number;
    winningY: number;
    winningZ: number;
    coordinatesSet: boolean;
    totalParticipants: number;
    totalEntryFees: number;
  } | null;
  userSubmission?: {
    x: number;
    y: number;
    z: number;
  } | null;
  matchResult?: number | null;
}

export function OutcomeAnimation({ 
  gameState, 
  dailyCycle, 
  userSubmission,
  matchResult 
}: OutcomeAnimationProps) {
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
        {dailyCycle?.coordinatesSet && (
          <div className="mt-6 text-xl font-mono text-cyan-300">
            Winning Coordinates: ({dailyCycle.winningX}, {dailyCycle.winningY}, {dailyCycle.winningZ})
          </div>
        )}
      </div>
    );
  }

  // Outcome state
  if (gameState === "outcome") {
    const matches = matchResult ?? 0;
    const hasWinningCoords = dailyCycle?.coordinatesSet;
    const winningCoords = dailyCycle 
      ? { x: dailyCycle.winningX, y: dailyCycle.winningY, z: dailyCycle.winningZ }
      : null;
    const userCoords = userSubmission 
      ? { x: userSubmission.x, y: userSubmission.y, z: userSubmission.z }
      : null;

    // Check if there were any winners globally (if no 3/3 matches, Earth is destroyed)
    const hasGlobalWinners = dailyCycle && dailyCycle.totalParticipants > 0;

    if (!hasWinningCoords) {
      return (
        <div className="w-full p-8 text-center">
          <div className="text-4xl font-bold text-gray-400">
            Awaiting Results
          </div>
          <div className="mt-4 text-lg text-gray-500">
            Winning coordinates are being calculated...
          </div>
        </div>
      );
    }

    // Direct Hit (3/3)
    if (matches === 3) {
      return (
        <div className="w-full p-6 sm:p-8 text-center animate-impact-flash">
          <div className="text-4xl sm:text-5xl font-bold font-mono stable-era mb-4">
            🎯 DIRECT HIT!
          </div>
          <div className="text-xl sm:text-2xl text-primary mb-6 shadow-neon-cyan">
            Asteroid Pulverized
          </div>
          <div className="space-y-2 text-lg">
            <div className="text-gray-300">
              Your Coordinates: ({userCoords?.x ?? "?"}, {userCoords?.y ?? "?"}, {userCoords?.z ?? "?"})
            </div>
            <div className="text-cyan-400 font-mono">
              Winning: ({winningCoords?.x}, {winningCoords?.y}, {winningCoords?.z})
            </div>
            <div className="mt-4 text-xl text-yellow-400">
              🎉 Jackpot Winner! 🎉
            </div>
            {dailyCycle && dailyCycle.totalEntryFees > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                Jackpot: {(dailyCycle.totalEntryFees * 0.9 / 1e18).toFixed(2)} IMPACT
              </div>
            )}
          </div>
        </div>
      );
    }

    // Deflection (2/3)
    if (matches === 2) {
      return (
        <div className="w-full p-6 sm:p-8 text-center">
          <div className="text-3xl sm:text-4xl font-bold font-mono text-warning mb-4 shadow-neon-amber">
            ⚡ DEFLECTION
          </div>
          <div className="text-lg sm:text-xl text-gray-300 mb-6">
            Near Miss - Voucher Earned!
          </div>
          <div className="space-y-2 text-lg">
            <div className="text-gray-300">
              Your Coordinates: ({userCoords?.x ?? "?"}, {userCoords?.y ?? "?"}, {userCoords?.z ?? "?"})
            </div>
            <div className="text-cyan-400 font-mono">
              Winning: ({winningCoords?.x}, {winningCoords?.y}, {winningCoords?.z})
            </div>
            <div className="mt-4 text-lg text-yellow-300">
              You matched {matches}/3 coordinates
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Free Interceptor Voucher granted for next day
            </div>
          </div>
        </div>
      );
    }

    // Partial Match (1/3)
    if (matches === 1) {
      return (
        <div className="w-full p-6 sm:p-8 text-center">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-secondary mb-4">
            🎲 PARTIAL INTERCEPT
          </div>
          <div className="text-base sm:text-lg text-gray-300 mb-6">
            You matched {matches}/3 coordinates
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-gray-400">
              Your Coordinates: ({userCoords?.x ?? "?"}, {userCoords?.y ?? "?"}, {userCoords?.z ?? "?"})
            </div>
            <div className="text-cyan-400 font-mono">
              Winning: ({winningCoords?.x}, {winningCoords?.y}, {winningCoords?.z})
            </div>
          </div>
        </div>
      );
    }

    // No Match (0/3) or Global Failure
    const isGlobalFailure = hasGlobalWinners && dailyCycle && dailyCycle.totalParticipants > 0;
    
      return (
        <div className="w-full p-6 sm:p-8 text-center">
          {isGlobalFailure ? (
            <>
              <div className="text-4xl sm:text-5xl font-bold font-mono extinction-active mb-4">
                💀 EXTINCTION
              </div>
              <div className="text-xl sm:text-2xl text-extinction mb-6">
                Earth Destroyed
              </div>
              <div className="text-base sm:text-lg text-gray-300 mb-4">
                No direct hits were recorded worldwide
              </div>
              <div className="text-sm text-gray-500 bg-extinction-dark/20 border border-extinction/30 rounded px-4 py-2 inline-block">
                ⏱ Void State: 60 minutes
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-error mb-4">
                ✕ MISS
              </div>
              <div className="text-base sm:text-lg text-gray-300 mb-6">
                You matched {matches}/3 coordinates
              </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">
                Your Coordinates: ({userCoords?.x ?? "?"}, {userCoords?.y ?? "?"}, {userCoords?.z ?? "?"})
              </div>
              <div className="text-cyan-400 font-mono">
                Winning: ({winningCoords?.x}, {winningCoords?.y}, {winningCoords?.z})
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}


