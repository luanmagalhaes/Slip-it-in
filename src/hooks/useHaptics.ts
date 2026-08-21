"use client";

import { useCallback } from "react";

type HapticPattern = "tap" | "success" | "alert";

const patterns: Record<HapticPattern, number | number[]> = {
  tap: 12,
  success: [16, 40, 26],
  alert: [30, 50, 30, 50],
};

export function useHaptics() {
  return useCallback((pattern: HapticPattern) => {
    if (typeof window === "undefined" || !("vibrate" in window.navigator)) {
      return;
    }

    try {
      window.navigator.vibrate(patterns[pattern]);
    } catch {
      return;
    }
  }, []);
}
