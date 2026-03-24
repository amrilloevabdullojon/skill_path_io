import { Achievement, Badge, LeaderboardEntry } from "@/types/saas";

type BuildAchievementsInput = {
  completedModules: number;
  missionSubmissions: number;
  strongestSkills: string[];
  totalXp: number;
  streakDays: number;
};

const badgeTones = ["sky", "emerald", "amber", "violet"] as const;

export function buildAchievements(input: BuildAchievementsInput): Achievement[] {
  const hasSql = input.strongestSkills.some((skill) => skill.toLowerCase().includes("sql"));
  const hasTesting = input.strongestSkills.some((skill) => skill.toLowerCase().includes("test"));
  const hasStory = input.strongestSkills.some(
    (skill) => skill.toLowerCase().includes("story") || skill.toLowerCase().includes("analytics"),
  );

  return [
    {
      id: "first-mission",
      title: "First Mission",
      description: "Complete your first mission submission.",
      unlocked: input.missionSubmissions >= 1,
      unlockedAt: input.missionSubmissions >= 1 ? new Date().toISOString() : null,
    },
    {
      id: "sql-explorer",
      title: "SQL Explorer",
      description: "Show strong SQL capability on your radar.",
      unlocked: hasSql,
      unlockedAt: hasSql ? new Date().toISOString() : null,
    },
    {
      id: "bug-hunter",
      title: "Bug Hunter",
      description: "Demonstrate testing and bug analysis competency.",
      unlocked: hasTesting,
      unlockedAt: hasTesting ? new Date().toISOString() : null,
    },
    {
      id: "data-storyteller",
      title: "Data Storyteller",
      description: "Showcase analytics communication ability.",
      unlocked: hasStory,
      unlockedAt: hasStory ? new Date().toISOString() : null,
    },
    {
      id: "streak-runner",
      title: "Streak Runner",
      description: "Maintain a 7-day learning streak.",
      unlocked: input.streakDays >= 7,
      unlockedAt: input.streakDays >= 7 ? new Date().toISOString() : null,
    },
    {
      id: "xp-pro",
      title: "XP Professional",
      description: "Reach 1200 total XP.",
      unlocked: input.totalXp >= 1200,
      unlockedAt: input.totalXp >= 1200 ? new Date().toISOString() : null,
    },
  ];
}

export function toBadges(achievements: Achievement[]): Badge[] {
  return achievements
    .filter((item) => item.unlocked)
    .map((item, index) => ({
      id: item.id,
      label: item.title,
      tone: badgeTones[index % badgeTones.length],
    }));
}

export function normalizeLeaderboard(entries: LeaderboardEntry[]) {
  return [...entries]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}
