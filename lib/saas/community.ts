import "server-only";

import { prisma } from "@/lib/prisma";
import { CommunityDiscussion, PeerFeedbackItem } from "@/types/saas";

function truncate(text: string, maxLength = 180) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

export async function getCommunityDiscussions(): Promise<CommunityDiscussion[]> {
  try {
    const threads = await prisma.discussionThread.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      take: 24,
    });

    return threads.map((thread) => {
      const scope: CommunityDiscussion["scope"] =
        thread.moduleRef.toLowerCase().includes("mission") ? "mission" : "track";
      const scopeRef = thread.moduleRef || (thread.track ? thread.track.toLowerCase() : "general");

      return {
        id: thread.id,
        title: thread.title,
        body: truncate(thread.body),
        scope,
        scopeRef,
        author: thread.user.name,
        replyCount: thread._count.comments,
        createdAt: thread.createdAt.toISOString(),
      };
    });
  } catch {
    return [];
  }
}

export async function getPeerFeedbackQueue(): Promise<PeerFeedbackItem[]> {
  try {
    const submissions = await prisma.missionSubmission.findMany({
      where: {
        score: {
          not: null,
        },
      },
      orderBy: { submittedAt: "desc" },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      take: 12,
    });

    return submissions.map((submission) => ({
      id: submission.id,
      missionId: submission.mission.id,
      reviewer: submission.user.name,
      summary: `Submission "${submission.mission.title}" reviewed with score ${submission.score ?? 0}.`,
      helpfulVotes: Math.max(1, Math.round((submission.score ?? 0) / 10)),
    }));
  } catch {
    return [];
  }
}
