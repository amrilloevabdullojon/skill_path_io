import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { SpeedReviewMode } from "@/components/review/speed-review-mode";
import { buildSpeedReviewCards } from "@/features/review/speed-review";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Speed Review — SkillPath Academy",
  description: "Review your saved bookmarks and notes in rapid flashcard mode.",
  robots: { index: false },
};
import { prisma } from "@/lib/prisma";
import { UserBookmark, UserNote } from "@/types/personalization";

function mapTrack(moduleRef: string): UserNote["track"] {
  const normalized = moduleRef.toLowerCase();
  if (normalized.includes("ba") || normalized.includes("business")) {
    return "BA";
  }
  if (normalized.includes("da") || normalized.includes("data") || normalized.includes("sql")) {
    return "DA";
  }
  return "QA";
}

function mapBookmarkType(value: string): UserBookmark["type"] {
  if (value === "module" || value === "quiz" || value === "mission") {
    return value;
  }
  return "lesson";
}

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
    : null;
  const [noteRows, bookmarkRows] = user
    ? await Promise.all([
        prisma.userNote.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 80,
        }),
        prisma.userBookmark.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 80,
        }),
      ])
    : [[], []];

  const notes: UserNote[] = noteRows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    track: mapTrack(row.moduleRef),
    lessonRef: row.lessonRef || row.moduleRef || "General note",
    createdAt: row.createdAt.toISOString(),
  }));
  const bookmarks: UserBookmark[] = bookmarkRows.map((row) => ({
    id: row.id,
    title: row.title,
    href: row.href,
    type: mapBookmarkType(row.type),
    tag: row.tag || "General",
  }));
  const cards = buildSpeedReviewCards(notes, bookmarks);

  return (
    <section className="page-shell">
      <SpeedReviewMode cards={cards} />
    </section>
  );
}
