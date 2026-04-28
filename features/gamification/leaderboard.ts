import { ProgressStatus } from "@prisma/client";

import { calculateXpFromProgress, getLevelByXp } from "@/lib/progress/xp";

type LeaderboardProgress = {
  status: ProgressStatus;
  score: number | null;
};

type LeaderboardUser = {
  id: string;
  name: string;
  email: string;
  progresses: LeaderboardProgress[];
  certificates: number;
  streak: { currentStreak: number } | null;
};

export type LeagueTier = "Diamond" | "Gold" | "Silver" | "Bronze";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  email: string;
  xp: number;
  level: string;
  completedModules: number;
  certificates: number;
  streak: number;
  league: LeagueTier;
};

export type GroupedLeaderboard = Record<LeagueTier, LeaderboardRow[]>;

export function buildLeaderboard(users: LeaderboardUser[]): GroupedLeaderboard {
  const rowList = users
    .map((user) => {
      const completedModules = user.progresses.filter((item) => item.status === ProgressStatus.COMPLETED).length;
      const xp = calculateXpFromProgress(
        user.progresses,
        user.certificates,
        completedModules * 3,
        Math.floor(completedModules / 2),
      ).totalXp;
      const streak = user.streak?.currentStreak || 0;

      let league: LeagueTier = "Bronze";
      if (xp >= 1500 && streak >= 3) {
        league = "Diamond";
      } else if (xp >= 800 && streak >= 1) {
        league = "Gold";
      } else if (xp >= 300) {
        league = "Silver";
      }

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        xp,
        level: getLevelByXp(xp),
        completedModules,
        certificates: user.certificates,
        streak,
        league,
      };
    })
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.streak - a.streak;
    });

  const grouped: GroupedLeaderboard = {
    Diamond: [],
    Gold: [],
    Silver: [],
    Bronze: [],
  };

  ["Diamond", "Gold", "Silver", "Bronze"].forEach((tier) => {
    const list = rowList.filter((r) => r.league === tier);
    list.forEach((row, idx) => {
      grouped[tier as LeagueTier].push({ ...row, rank: idx + 1 });
    });
  });

  return grouped;
}
