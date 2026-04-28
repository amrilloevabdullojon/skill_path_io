import { NotificationItem } from "@/types/saas";

type NotificationLabels = {
  missionTitle: string;
  summaryTitle: string;
  recommendationTitle: string;
  jobTitle: string;
  achievementTitle: string;
};

const DEFAULT_LABELS: NotificationLabels = {
  missionTitle: "New mission unlocked",
  summaryTitle: "Weekly learning summary",
  recommendationTitle: "AI recommendation",
  jobTitle: "Job opportunity matched",
  achievementTitle: "Achievement unlocked",
};

type BuildNotificationsInput = {
  unlockedMissionTitle: string | null;
  weeklySummaryText: string;
  recommendationTitle: string | null;
  topJobTitle: string | null;
  achievementTitle: string | null;
  labels?: NotificationLabels;
};

function createNotificationId(prefix: string, index: number) {
  return `${prefix}-${Date.now()}-${index}`;
}

export function buildDashboardNotifications(input: BuildNotificationsInput): NotificationItem[] {
  const labels = input.labels ?? DEFAULT_LABELS;
  const items: NotificationItem[] = [];

  if (input.unlockedMissionTitle) {
    items.push({
      id: createNotificationId("mission", 1),
      title: labels.missionTitle,
      body: input.unlockedMissionTitle,
      type: "mission",
      href: "/missions",
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  items.push({
    id: createNotificationId("summary", 2),
    title: labels.summaryTitle,
    body: input.weeklySummaryText,
    type: "summary",
    href: "/dashboard?tab=overview",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  });

  if (input.recommendationTitle) {
    items.push({
      id: createNotificationId("reco", 3),
      title: labels.recommendationTitle,
      body: input.recommendationTitle,
      type: "recommendation",
      href: "/dashboard?tab=skills#ai",
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      isRead: false,
    });
  }

  if (input.topJobTitle) {
    items.push({
      id: createNotificationId("job", 4),
      title: labels.jobTitle,
      body: input.topJobTitle,
      type: "job",
      href: "/marketplace",
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      isRead: false,
    });
  }

  if (input.achievementTitle) {
    items.push({
      id: createNotificationId("achievement", 5),
      title: labels.achievementTitle,
      body: input.achievementTitle,
      type: "achievement",
      href: "/dashboard?tab=skills#xp",
      createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      isRead: false,
    });
  }

  return items;
}
