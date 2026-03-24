"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

type AchievementLevel = "minor" | "major" | "legendary";

export function useAchievementToast() {
  const celebrate = useCallback((level: AchievementLevel = "minor") => {
    const configs: Record<AchievementLevel, confetti.Options[]> = {
      minor: [
        {
          particleCount: 60,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#38bdf8", "#818cf8", "#34d399"],
          scalar: 0.9,
        },
      ],
      major: [
        {
          particleCount: 80,
          spread: 60,
          origin: { x: 0.3, y: 0.65 },
          colors: ["#38bdf8", "#818cf8", "#f59e0b", "#34d399"],
        },
        {
          particleCount: 80,
          spread: 60,
          origin: { x: 0.7, y: 0.65 },
          colors: ["#38bdf8", "#818cf8", "#f59e0b", "#34d399"],
        },
      ],
      legendary: [
        {
          particleCount: 120,
          spread: 80,
          origin: { x: 0.2, y: 0.55 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#38bdf8"],
          shapes: ["star"],
        },
        {
          particleCount: 120,
          spread: 80,
          origin: { x: 0.8, y: 0.55 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#38bdf8"],
          shapes: ["star"],
        },
        {
          particleCount: 60,
          spread: 120,
          origin: { x: 0.5, y: 0.6 },
          colors: ["#c084fc", "#818cf8", "#38bdf8"],
        },
      ],
    };

    const shots = configs[level];
    shots.forEach((opts) => confetti(opts));
  }, []);

  return { celebrate };
}
