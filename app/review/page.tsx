import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { SpeedReviewMode } from "@/components/review/speed-review-mode";
import { buildSpeedReviewCards } from "@/features/review/speed-review";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Быстрая проверка — Levio",
  description: "Повторяйте сохраненные закладки и заметки в режиме быстрых флеш-карточек.",
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
    lessonRef: row.lessonRef || row.moduleRef || "Общая заметка",
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
    <section className="page-shell relative isolate overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[130px] pointer-events-none -z-10" />
      
      <SpeedReviewMode cards={cards} />
    </section>
  );
}
