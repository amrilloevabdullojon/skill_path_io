import { GrowthShareCard } from "@/types/saas";

type BuildGrowthCardsInput = {
  origin: string;
  profileHandle: string;
  recentAchievement: string | null;
  leaderboardRank: number | null;
};

export function buildGrowthShareCards(input: BuildGrowthCardsInput): GrowthShareCard[] {
  const profileUrl = `${input.origin}/profile/${input.profileHandle}`;
  const achievementParam = input.recentAchievement ? encodeURIComponent(input.recentAchievement) : "";

  return [
    {
      id: "share-portfolio",
      title: "Share portfolio",
      description: "Publish your latest mission artifacts and portfolio highlights.",
      shareUrl: `${profileUrl}?view=portfolio`,
      channelHint: "linkedin",
    },
    {
      id: "share-achievement",
      title: "Share achievement",
      description: input.recentAchievement
        ? `Highlight badge: ${input.recentAchievement}`
        : "Show your newest badge and milestone.",
      shareUrl: `${profileUrl}?badge=${achievementParam}`,
      channelHint: "x",
    },
    {
      id: "share-leaderboard",
      title: "Share leaderboard rank",
      description: input.leaderboardRank
        ? `Current rank: #${input.leaderboardRank}`
        : "Show your weekly leaderboard progress.",
      shareUrl: `${input.origin}/leaderboard`,
      channelHint: "internal",
    },
    {
      id: "share-skill-profile",
      title: "Share public skill profile",
      description: "Send your public profile URL to recruiters and peers.",
      shareUrl: profileUrl,
      channelHint: "linkedin",
    },
  ];
}
