import { ProgressStatus } from "@prisma/client";

export type LevelTier = "Beginner" | "Explorer" | "Professional" | "Expert" | "Master";

export type XpBreakdown = {
  lessonXp: number;
  quizXp: number;
  progressXp: number;
  simulationXp: number;
  certificateXp: number;
  totalXp: number;
};

export const LEVEL_THRESHOLDS: Array<{ level: LevelTier; minXp: number }> = [
  { level: "Beginner", minXp: 0 },
  { level: "Explorer", minXp: 500 },
  { level: "Professional", minXp: 1200 },
  { level: "Expert", minXp: 2200 },
  { level: "Master", minXp: 3500 },
];

const XP_RULES = {
  LESSON_COMPLETED: 30,
  QUIZ_PASSED: 80,
  MODULE_IN_PROGRESS: 30,
  MODULE_COMPLETED_BONUS: 50,
  SIMULATION_COMPLETED: 140,
  CERTIFICATE_EARNED: 260,
} as const;

type ProgressLike = {
  status: ProgressStatus;
  score: number | null;
};

export function calculateXpFromProgress(
  progresses: ProgressLike[],
  certificateCount: number,
  completedLessonsEstimate: number,
  completedSimulations = 0,
): XpBreakdown {
  let progressXp = 0;
  let quizXp = 0;

  for (const progress of progresses) {
    if (progress.status === ProgressStatus.IN_PROGRESS) {
      progressXp += XP_RULES.MODULE_IN_PROGRESS;
    }

    if (progress.status === ProgressStatus.COMPLETED) {
      progressXp += XP_RULES.MODULE_COMPLETED_BONUS;
    }

    if ((progress.score ?? 0) >= 70) {
      quizXp += XP_RULES.QUIZ_PASSED;
    }
  }

  const lessonXp = completedLessonsEstimate * XP_RULES.LESSON_COMPLETED;
  const simulationXp = completedSimulations * XP_RULES.SIMULATION_COMPLETED;
  const certificateXp = certificateCount * XP_RULES.CERTIFICATE_EARNED;
  const totalXp = lessonXp + quizXp + progressXp + simulationXp + certificateXp;

  return {
    lessonXp,
    quizXp,
    progressXp,
    simulationXp,
    certificateXp,
    totalXp,
  };
}

export function getLevelByXp(totalXp: number): LevelTier {
  const tier = [...LEVEL_THRESHOLDS].reverse().find((item) => totalXp >= item.minXp);
  return tier?.level ?? "Beginner";
}

export function getNextLevelTarget(totalXp: number) {
  const currentLevel = getLevelByXp(totalXp);
  const currentIndex = LEVEL_THRESHOLDS.findIndex((tier) => tier.level === currentLevel);
  const nextTier = LEVEL_THRESHOLDS[currentIndex + 1] ?? null;

  if (!nextTier) {
    return {
      currentLevel,
      nextLevel: null,
      xpIntoLevel: totalXp - LEVEL_THRESHOLDS[currentIndex].minXp,
      xpNeededForNext: 0,
      progressPercent: 100,
    };
  }

  const currentMin = LEVEL_THRESHOLDS[currentIndex].minXp;
  const span = nextTier.minXp - currentMin;
  const xpIntoLevel = Math.max(totalXp - currentMin, 0);
  const progressPercent = span > 0 ? Math.min(Math.round((xpIntoLevel / span) * 100), 100) : 100;

  return {
    currentLevel,
    nextLevel: nextTier.level,
    xpIntoLevel,
    xpNeededForNext: Math.max(nextTier.minXp - totalXp, 0),
    progressPercent,
  };
}
