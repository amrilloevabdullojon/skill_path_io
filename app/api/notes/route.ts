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

  const notes = await prisma.userNote.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 120,
  });

  return apiOk({ notes });
});

export const POST = withErrorHandler(async (request: Request) => {
  const user = await resolveRequestUser();
  if (!user) throw Errors.unauthorized();

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    lessonRef?: string;
    track?: "QA" | "BA" | "DA";
  };

  const title = body.title?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  if (!title || !content) throw Errors.validation("title and content are required.");

  const track = body.track === "BA" || body.track === "DA" ? body.track : "QA";
  const lessonRef = body.lessonRef?.trim() || "Manual note";

  const created = await prisma.userNote.create({
    data: {
      userId: user.id,
      title,
      content,
      moduleRef: `track:${track}`,
      lessonRef,
    },
  });

  return apiOk({ note: created }, 201);
});

export const DELETE = withErrorHandler(async (request: Request) => {
  const user = await resolveRequestUser();
  if (!user) throw Errors.unauthorized();

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) throw Errors.validation("id is required.");

  await prisma.userNote.deleteMany({ where: { id, userId: user.id } });

  return apiOk({ ok: true });
});
