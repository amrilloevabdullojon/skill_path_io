import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { prisma } from "@/lib/prisma";

async function resolvePortfolioId(userEmail: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  if (!user) throw Errors.unauthorized();

  const portfolio = await prisma.portfolio.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
    select: { id: true },
  });

  return portfolio.id;
}

/** POST /api/portfolio/projects — add a project */
export const POST = withErrorHandler(async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw Errors.unauthorized();

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    skillsUsed?: string[];
    source?: string;
    sourceRef?: string;
    resultSummary?: string;
    isPublic?: boolean;
  };

  if (!body.title?.trim()) throw Errors.validation("title is required");

  const portfolioId = await resolvePortfolioId(session.user.email);

  const count = await prisma.portfolioProject.count({ where: { portfolioId } });
  const project = await prisma.portfolioProject.create({
    data: {
      portfolioId,
      title: body.title.trim(),
      description: body.description ?? "",
      skillsUsed: body.skillsUsed ?? [],
      source: body.source ?? "manual",
      sourceRef: body.sourceRef ?? "",
      resultSummary: body.resultSummary ?? "",
      isPublic: body.isPublic ?? true,
      order: count,
    },
  });

  return apiOk({ project }, 201);
});
