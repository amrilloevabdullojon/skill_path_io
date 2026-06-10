import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { StudioDashboard } from "@/components/admin/dashboard/studio-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
  robots: { index: false },
};

export type LiveFeedItem = {
  id: string;
  type: "AI_RESUME" | "AI_INTERVIEW" | "CODE_TINDER" | "MISSION_SUBMISSION";
  title: string;
  description: string;
  createdAt: Date;
};

export default async function AdminDashboardPage() {
  await requireAdminPermission("courses.read");

  let realStats = {
    users: 0,
    tracks: 0,
    publishedTracks: 0,
    draftTracks: 0,
    modules: 0,
    modulesWithoutLessons: 0,
    modulesWithoutQuiz: 0,
    lessons: 0,
    quizzes: 0,
    quizzesWithoutQuestions: 0,
    certificates: 0,
    missionSubmissions: 0,
    peerReviews: 0,
    aiResumesScanned: 0,
    aiInterviews: 0,
  };

  let liveFeed: LiveFeedItem[] = [];

  try {
    const [
      users, tracks, modules, lessons, quizzes, certificates, courseCertificates,
      publishedTracks, draftTracks, modulesWithoutLessons, modulesWithoutQuiz, quizzesWithoutQuestions,
      missionSubmissions, peerReviews, aiResumesScanned, aiInterviews,
      recentAiLogs, recentSubmissions, recentReviews
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.track.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.certificate.count(),
      prisma.courseCertificate.count(),
      prisma.track.count({ where: { status: "PUBLISHED" } }),
      prisma.track.count({ where: { status: "DRAFT" } }),
      prisma.module.count({ where: { lessons: { none: {} } } }),
      prisma.module.count({ where: { quiz: null } }),
      prisma.quiz.count({ where: { questions: { none: {} } } }),
      prisma.missionSubmission.count(),
      prisma.peerReview.count(),
      prisma.aiUsageLog.count({ where: { feature: "RESUME_SCAN" } }),
      prisma.aiUsageLog.count({ where: { feature: "AI_INTERVIEW" } }),

      // Live Feed Queries
      prisma.aiUsageLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.missionSubmission.findMany({
        take: 8,
        orderBy: { submittedAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, mission: { select: { title: true } } }
      }),
      prisma.peerReview.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { reviewer: { select: { name: true, email: true } }, submission: { include: { mission: { select: { title: true } } } } }
      })
    ]);

    realStats = {
      users,
      tracks,
      publishedTracks,
      draftTracks,
      modules,
      modulesWithoutLessons,
      modulesWithoutQuiz,
      lessons,
      quizzes,
      quizzesWithoutQuestions,
      certificates: certificates + courseCertificates,
      missionSubmissions,
      peerReviews,
      aiResumesScanned,
      aiInterviews,
    };

    // Format feed items
    const feedItems: LiveFeedItem[] = [];

    recentAiLogs.forEach(log => {
      feedItems.push({
        id: `ai-${log.id}`,
        type: log.feature === "RESUME_SCAN" ? "AI_RESUME" : "AI_INTERVIEW",
        title: log.feature === "RESUME_SCAN" ? "AI Resume Scan" : "AI Interview Session",
        description: "Anonymous user triggered AI processing",
        createdAt: log.createdAt,
      });
    });

    recentSubmissions.forEach(sub => {
      feedItems.push({
        id: `sub-${sub.id}`,
        type: "MISSION_SUBMISSION",
        title: "Code Mission Submitted",
        description: `${sub.user.name || sub.user.email} submitted "${sub.mission.title}"`,
        createdAt: sub.submittedAt,
      });
    });

    recentReviews.forEach(rev => {
      feedItems.push({
        id: `rev-${rev.id}`,
        type: "CODE_TINDER",
        title: "Code Tinder Match",
        description: `${rev.reviewer.name || rev.reviewer.email} reviewed "${rev.submission.mission.title}"`,
        createdAt: rev.createdAt,
      });
    });

    // Sort combined feed and keep top 10
    liveFeed = feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

  } catch {
    // Dashboard stays functional in local mock mode when PostgreSQL is temporarily unavailable.
  }

  return <StudioDashboard realStats={realStats} liveFeed={liveFeed} />;
}
