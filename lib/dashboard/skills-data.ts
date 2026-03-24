import { TrackCategory } from "@prisma/client";

import { SKILL_TREE } from "@/lib/skill-tree/tree";
import { clamp } from "@/lib/dashboard/progress-data";

export type TrackSummaryLike = {
  category: TrackCategory;
  progressPercent: number;
  averageScore: number | null;
};

export type SkillRadarPoint = {
  skill: string;
  value: number;
};

export type SkillRadarSummary = {
  data: SkillRadarPoint[];
  strongestSkill: string;
  weakestSkill: string;
  nextFocus: string;
};

export type SkillTreePreviewBranch = {
  id: string;
  title: string;
  category: TrackCategory;
  unlocked: string[];
  locked: string[];
};

export type SkillTreePreview = {
  branches: SkillTreePreviewBranch[];
  unlockedCount: number;
  totalCount: number;
  nextUnlock: string | null;
};

export function buildSkillRadarData(
  trackSummaries: TrackSummaryLike[],
  overallProgress: number,
  quizAccuracy: number,
): SkillRadarSummary {
  const byCategory = new Map(trackSummaries.map((track) => [track.category, track]));
  const qa = byCategory.get(TrackCategory.QA);
  const ba = byCategory.get(TrackCategory.BA);
  const da = byCategory.get(TrackCategory.DA);

  const qaProgress = qa?.progressPercent ?? 0;
  const baProgress = ba?.progressPercent ?? 0;
  const daProgress = da?.progressPercent ?? 0;

  const qaScore = qa?.averageScore ?? quizAccuracy;
  const baScore = ba?.averageScore ?? quizAccuracy;
  const daScore = da?.averageScore ?? quizAccuracy;

  const data = [
    { skill: "Testing", value: clamp(Math.round(qaProgress * 0.72 + qaScore * 0.28), 5, 100) },
    { skill: "SQL", value: clamp(Math.round(daProgress * 0.65 + daScore * 0.35), 5, 100) },
    { skill: "API", value: clamp(Math.round(qaProgress * 0.7 + qaScore * 0.3), 5, 100) },
    {
      skill: "Business Analysis",
      value: clamp(Math.round(baProgress * 0.7 + baScore * 0.3), 5, 100),
    },
    { skill: "Analytics", value: clamp(Math.round(daProgress * 0.75 + baProgress * 0.25), 5, 100) },
    {
      skill: "Communication",
      value: clamp(Math.round(baProgress * 0.45 + overallProgress * 0.2 + quizAccuracy * 0.35), 5, 100),
    },
    { skill: "Automation", value: clamp(Math.round(qaProgress * 0.78 + qaScore * 0.22), 5, 100) },
  ];

  const strongest = [...data].sort((a, b) => b.value - a.value)[0];
  const weakest = [...data].sort((a, b) => a.value - b.value)[0];

  return {
    data,
    strongestSkill: strongest?.skill ?? "Testing",
    weakestSkill: weakest?.skill ?? "SQL",
    nextFocus: weakest ? `${weakest.skill} to 70+` : "Core skill consistency",
  };
}

export function buildSkillTreePreview(trackSummaries: TrackSummaryLike[]): SkillTreePreview {
  const progressByCategory = new Map(trackSummaries.map((track) => [track.category, track.progressPercent]));

  const branches = SKILL_TREE.map((branch) => {
    const categoryProgress = progressByCategory.get(branch.category) ?? 0;
    const unlockedCount =
      categoryProgress <= 0
        ? 0
        : Math.max(1, Math.min(branch.children.length, Math.floor((categoryProgress / 100) * branch.children.length)));

    const unlocked = branch.children.slice(0, unlockedCount).map((item) => item.title);
    const locked = branch.children.slice(unlockedCount).map((item) => item.title);

    return {
      id: branch.id,
      title: branch.title,
      category: branch.category,
      unlocked,
      locked,
    };
  });

  const unlockedCount = branches.reduce((sum, branch) => sum + branch.unlocked.length, 0);
  const totalCount = branches.reduce((sum, branch) => sum + branch.unlocked.length + branch.locked.length, 0);

  const nextUnlock =
    branches
      .filter((branch) => branch.locked.length > 0)
      .sort((a, b) => b.unlocked.length - a.unlocked.length)[0]
      ?.locked[0] ?? null;

  return {
    branches,
    unlockedCount,
    totalCount,
    nextUnlock,
  };
}

export function overallSkillLevelFromRadar(radar: SkillRadarSummary) {
  const average = Math.round(
    radar.data.reduce((sum, item) => sum + item.value, 0) / Math.max(radar.data.length, 1),
  );
  if (average >= 85) return "Expert";
  if (average >= 72) return "Professional";
  if (average >= 58) return "Explorer";
  return "Beginner";
}

