import {
  BookmarkTypeSchema,
  type Bookmark,
  type BookmarkType,
  type CreateBookmarkInput,
} from "@/lib/contracts/bookmarks";
import { prisma } from "@/lib/prisma";

/**
 * Bookmark domain service. Framework-agnostic (no req/res), returns contract
 * DTOs (dates as ISO strings) so HTTP handlers stay thin and the API shape is
 * decoupled from the Prisma row.
 */

const MAX_BOOKMARKS = 120;

type BookmarkRow = {
  id: string;
  title: string;
  href: string;
  type: string;
  tag: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeType(value: string): BookmarkType {
  return BookmarkTypeSchema.safeParse(value).success ? (value as BookmarkType) : "lesson";
}

function toDto(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    title: row.title,
    href: row.href,
    type: normalizeType(row.type),
    tag: row.tag,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listBookmarks(userId: string): Promise<Bookmark[]> {
  const rows = await prisma.userBookmark.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: MAX_BOOKMARKS,
  });
  return rows.map(toDto);
}

export async function createBookmark(
  userId: string,
  input: CreateBookmarkInput,
): Promise<{ bookmark: Bookmark; created: boolean }> {
  const existing = await prisma.userBookmark.findFirst({
    where: { userId, title: input.title, href: input.href },
  });
  if (existing) {
    return { bookmark: toDto(existing), created: false };
  }

  const row = await prisma.userBookmark.create({
    data: {
      userId,
      title: input.title,
      href: input.href,
      type: input.type,
      tag: input.tag,
    },
  });
  return { bookmark: toDto(row), created: true };
}

export async function deleteBookmark(userId: string, id: string): Promise<void> {
  await prisma.userBookmark.deleteMany({ where: { id, userId } });
}
