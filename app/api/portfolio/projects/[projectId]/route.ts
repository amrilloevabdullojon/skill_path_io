import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { prisma } from "@/lib/prisma";

type Params = { params: { projectId: string } };

async function resolveProject(projectId: string, userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  if (!user) throw Errors.unauthorized();

  const project = await prisma.portfolioProject.findUnique({
    where: { id: projectId },
    include: { portfolio: { select: { userId: true } } },
  });

  if (!project) throw Errors.notFound("Project not found");
  if (project.portfolio.userId !== user.id) throw Errors.forbidden();

  return project;
}

/** PATCH /api/portfolio/projects/[projectId] — update a project */
export const PATCH = withErrorHandler(async (request: Request, { params }: Params) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw Errors.unauthorized();

  const project = await resolveProject(params.projectId, session.user.email);

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    skillsUsed?: string[];
    resultSummary?: string;
    isPublic?: boolean;
    order?: number;
  };

  const updated = await prisma.portfolioProject.update({
    where: { id: project.id },
    data: {
      title: body.title ?? project.title,
      description: body.description ?? project.description,
      skillsUsed: body.skillsUsed ?? (project.skillsUsed as string[]),
      resultSummary: body.resultSummary ?? project.resultSummary,
      isPublic: body.isPublic ?? project.isPublic,
      order: body.order ?? project.order,
      updatedAt: new Date(),
    },
  });

  return apiOk({ project: updated });
});

/** DELETE /api/portfolio/projects/[projectId] — delete a project */
export const DELETE = withErrorHandler(async (_request: Request, { params }: Params) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw Errors.unauthorized();

  const project = await resolveProject(params.projectId, session.user.email);

  await prisma.portfolioProject.delete({ where: { id: project.id } });

  return apiOk({ deleted: true });
});
