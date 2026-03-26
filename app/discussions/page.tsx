import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { DiscussionsHub } from "@/components/discussion/discussions-hub";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Discussions — SkillPath Academy",
  description: "Ask questions, share insights, and discuss learning topics with your peers.",
};
import { prisma } from "@/lib/prisma";
import { DiscussionThread } from "@/types/personalization";

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function formatRelative(date: Date) {
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const dynamic = "force-dynamic";

export default async function DiscussionsPage() {
  const session = await getServerSession(authOptions);
  const rows = session?.user?.email
    ? await prisma.discussionThread.findMany({
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
        take: 80,
      })
    : [];

  const threads: DiscussionThread[] = rows.map((row) => ({
    id: row.id,
    moduleTitle: row.moduleRef || row.track || "General discussion",
    title: row.title,
    author: row.user.name,
    replies: row._count.comments,
    lastActivity: formatRelative(row.updatedAt),
    tags: parseStringArray(row.tags),
  }));

  return (
    <section className="page-shell">
      <DiscussionsHub threads={threads} />
    </section>
  );
}
