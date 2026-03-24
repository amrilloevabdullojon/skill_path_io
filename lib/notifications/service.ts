import "server-only";

import { prisma } from "@/lib/prisma";
import { NotificationItem } from "@/types/saas";

/**
 * Builds a real notification feed for a user by querying the database
 * for recent events: completed modules, certificates, mission submissions,
 * new job postings, and active weekly quests.
 */
export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  const items: NotificationItem[] = [];

  try {
    const [recentProgress, certificates, missionSubmissions, newJobs, quests] = await Promise.all([
      // Recently completed modules
      prisma.userProgress.findMany({
        where: { userId, status: "COMPLETED" },
        include: { module: { include: { track: true } } },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      // Recently issued certificates
      prisma.certificate.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { issuedAt: "desc" },
        take: 3,
      }),
      // Recent mission submissions
      prisma.missionSubmission.findMany({
        where: { userId },
        include: { mission: true },
        orderBy: { submittedAt: "desc" },
        take: 3,
      }),
      // New published job postings (last 7 days)
      prisma.jobPosting.findMany({
        where: {
          status: "PUBLISHED",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      // Active weekly quests
      prisma.weeklyQuest.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
    ]);

    // Certificates → high-priority notifications
    for (const cert of certificates) {
      items.push({
        id: `cert-${cert.id}`,
        title: "Сертификат получен",
        body: `Вы завершили трек «${cert.track.title}» и получили сертификат.`,
        type: "achievement",
        href: "/dashboard?tab=skills#xp",
        createdAt: cert.issuedAt.toISOString(),
        isRead: false,
      });
    }

    // Recent module completions
    for (const progress of recentProgress) {
      if (!progress.completedAt) continue;
      items.push({
        id: `progress-${progress.id}`,
        title: "Модуль завершён",
        body: `«${progress.module.title}» из трека «${progress.module.track.title}»`,
        type: "summary",
        href: `/tracks/${progress.module.track.slug}`,
        createdAt: progress.completedAt.toISOString(),
        isRead: false,
      });
    }

    // Mission submissions
    for (const submission of missionSubmissions) {
      items.push({
        id: `mission-${submission.id}`,
        title: "Миссия отправлена",
        body: submission.mission.title,
        type: "mission",
        href: "/missions",
        createdAt: submission.submittedAt.toISOString(),
        isRead: false,
      });
    }

    // New job postings
    for (const job of newJobs) {
      items.push({
        id: `job-${job.id}`,
        title: "Новая вакансия",
        body: `${job.title} — ${job.company}`,
        type: "job",
        href: "/marketplace",
        createdAt: job.createdAt.toISOString(),
        isRead: false,
      });
    }

    // Active quests
    for (const quest of quests) {
      items.push({
        id: `quest-${quest.id}`,
        title: "Активное задание",
        body: quest.title,
        type: "recommendation",
        href: "/dashboard?tab=overview#quests",
        createdAt: quest.createdAt.toISOString(),
        isRead: false,
      });
    }
  } catch {
    // Graceful degradation if DB is unavailable
    return [];
  }

  // Sort by recency and cap at 10
  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
}
