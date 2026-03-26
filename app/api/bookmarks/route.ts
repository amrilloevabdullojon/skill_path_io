import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { prisma } from "@/lib/prisma";

async function resolveRequestUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}

export const GET = withErrorHandler(async () => {
  const user = await resolveRequestUser();
  if (!user) throw Errors.unauthorized();

  const bookmarks = await prisma.userBookmark.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 120,
  });

  return apiOk({ bookmarks });
});

export const POST = withErrorHandler(async (request: Request) => {
  const user = await resolveRequestUser();
  if (!user) throw Errors.unauthorized();

  const body = (await request.json()) as {
    title?: string;
    href?: string;
    type?: "lesson" | "module" | "quiz" | "mission";
    tag?: string;
  };

  const title = body.title?.trim() ?? "";
  const href = body.href?.trim() ?? "";
  if (!title || !href) throw Errors.validation("title and href are required.");
  if (title.length > 200) throw Errors.validation("title must be 200 characters or fewer.");
  if (href.length > 500) throw Errors.validation("href must be 500 characters or fewer.");
  if (!/^(\/|https?:\/\/)/.test(href)) throw Errors.validation("href must be a relative path or https URL.");

  const type =
    body.type === "module" || body.type === "quiz" || body.type === "mission"
      ? body.type
      : "lesson";
  const tag = (body.tag?.trim() || "General").slice(0, 50);

  const existing = await prisma.userBookmark.findFirst({
    where: { userId: user.id, title, href },
  });

  if (existing) return apiOk({ bookmark: existing });

  const created = await prisma.userBookmark.create({
    data: { userId: user.id, title, href, type, tag },
  });

  return apiOk({ bookmark: created }, 201);
});

export const DELETE = withErrorHandler(async (request: Request) => {
  const user = await resolveRequestUser();
  if (!user) throw Errors.unauthorized();

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) throw Errors.validation("id is required.");

  await prisma.userBookmark.deleteMany({ where: { id, userId: user.id } });

  return apiOk({ ok: true });
});
