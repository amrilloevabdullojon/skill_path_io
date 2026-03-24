import { WeeklyQuest } from "@/types/personalization";

export function applyQuestProgress(quests: WeeklyQuest[], questId: string, increment = 1): WeeklyQuest[] {
  return quests.map((quest) => {
    if (quest.id !== questId) {
      return quest;
    }

    const progress = Math.min(quest.progress + increment, quest.goal);
    return {
      ...quest,
      progress,
      status: progress >= quest.goal ? "completed" : progress > 0 ? "in_progress" : "not_started",
    };
  });
}

export function questSummary(quests: WeeklyQuest[]) {
  const completed = quests.filter((quest) => quest.status === "completed");
  const totalReward = completed.reduce((sum, quest) => sum + quest.rewardXp, 0);
  const completionRate = quests.length > 0 ? Math.round((completed.length / quests.length) * 100) : 0;

  return {
    completedCount: completed.length,
    completionRate,
    totalReward,
  };
}
