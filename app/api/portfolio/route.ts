import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { prisma } from "@/lib/prisma";

/** GET /api/portfolio — get current user's portfolio */
export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw Errors.unauthorized();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw Errors.unauthorized();

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    include: {
      projects: { orderBy: { order: "asc" } },
    },
  });

  return apiOk({ portfolio });
});

/** POST /api/portfolio — create or update portfolio metadata */
export const POST = withErrorHandler(async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw Errors.unauthorized();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw Errors.unauthorized();

  const body = (await request.json()) as {
    headline?: string;
    summary?: string;
    isPublic?: boolean;
    publicSlug?: string;
  };

  const portfolio = await prisma.portfolio.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      headline: body.headline ?? "",
      summary: body.summary ?? "",
      isPublic: body.isPublic ?? false,
      publicSlug: body.publicSlug ?? null,
    },
    update: {
      headline: body.headline,
      summary: body.summary,
      isPublic: body.isPublic,
      publicSlug: body.publicSlug,
      updatedAt: new Date(),
    },
    include: {
      projects: { orderBy: { order: "asc" } },
    },
  });

  return apiOk({ portfolio });
});
