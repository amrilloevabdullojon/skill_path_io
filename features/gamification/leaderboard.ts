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
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  email: string;
  xp: number;
  level: string;
  completedModules: number;
  certificates: number;
};

export function buildLeaderboard(users: LeaderboardUser[]): LeaderboardRow[] {
  const rows = users
    .map((user) => {
      const completedModules = user.progresses.filter((item) => item.status === ProgressStatus.COMPLETED).length;
      const xp = calculateXpFromProgress(
        user.progresses,
        user.certificates,
        completedModules * 3,
        Math.floor(completedModules / 2),
      ).totalXp;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        xp,
        level: getLevelByXp(xp),
        completedModules,
        certificates: user.certificates,
      };
    })
    .sort((a, b) => b.xp - a.xp);

  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}
