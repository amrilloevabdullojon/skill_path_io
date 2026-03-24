import { getServerSession } from "next-auth";

import { BookmarksBoard } from "@/components/bookmarks/bookmarks-board";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserBookmark } from "@/types/personalization";

function mapBookmarkType(value: string): UserBookmark["type"] {
  if (value === "module" || value === "quiz" || value === "mission") {
    return value;
  }
  return "lesson";
}

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
    : null;
  const rows = user
    ? await prisma.userBookmark.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 120,
      })
    : [];

  const initialBookmarks: UserBookmark[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    href: row.href,
    type: mapBookmarkType(row.type),
    tag: row.tag || "General",
  }));

  return (
    <section className="page-shell">
      <BookmarksBoard initialBookmarks={initialBookmarks} />
    </section>
  );
}
