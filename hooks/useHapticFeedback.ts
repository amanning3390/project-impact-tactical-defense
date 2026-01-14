import { useCallback } from "react";

type HapticIntensity = "light" | "medium" | "heavy";

export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn("Haptic feedback not supported:", error);
      }
    }
  }, []);

  const hapticFeedback = useCallback((intensity: HapticIntensity = "light") => {
    const patterns: Record<HapticIntensity, number> = {
      light: 10,
      medium: 20,
      heavy: 50,
    };

    vibrate(patterns[intensity]);
  }, [vibrate]);

  const hapticTick = useCallback(() => {
    vibrate(5);
  }, [vibrate]);

  const hapticSuccess = useCallback(() => {
    vibrate([10, 50, 10]);
  }, [vibrate]);

  const hapticError = useCallback(() => {
    vibrate([50, 100, 50]);
  }, [vibrate]);

  const hapticImpact = useCallback(() => {
    vibrate([20, 50, 100]);
  }, [vibrate]);

  return {
    hapticFeedback,
    hapticTick,
    hapticSuccess,
    hapticError,
    hapticImpact,
  };
}
