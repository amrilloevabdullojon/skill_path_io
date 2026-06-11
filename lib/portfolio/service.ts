import {
  type CreateProjectInput,
  type Portfolio,
  type PortfolioProject,
  type UpdatePortfolioInput,
} from "@/lib/contracts/portfolio";
import { prisma } from "@/lib/prisma";

/**
 * Portfolio domain service. Returns contract DTOs (ISO dates). A portfolio row
 * is created on demand so the API always has a stable shape to return.
 */

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  skillsUsed: string[];
  source: string;
  sourceRef: string;
  resultSummary: string;
  isPublic: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type PortfolioRow = {
  id: string;
  headline: string;
  summary: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
  projects: ProjectRow[];
};

function toProjectDto(row: ProjectRow): PortfolioProject {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    skillsUsed: row.skillsUsed,
    source: row.source,
    sourceRef: row.sourceRef,
    resultSummary: row.resultSummary,
    isPublic: row.isPublic,
    order: row.order,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPortfolioDto(row: PortfolioRow): Portfolio {
  return {
    id: row.id,
    headline: row.headline,
    summary: row.summary,
    isPublic: row.isPublic,
    publicSlug: row.publicSlug,
    projects: row.projects.map(toProjectDto),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const withProjects = { projects: { orderBy: { order: "asc" as const } } };

export async function getOrCreatePortfolio(userId: string): Promise<Portfolio> {
  const row = await prisma.portfolio.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: withProjects,
  });
  return toPortfolioDto(row);
}

export async function updatePortfolio(
  userId: string,
  input: UpdatePortfolioInput,
): Promise<Portfolio> {
  const row = await prisma.portfolio.upsert({
    where: { userId },
    create: {
      userId,
      headline: input.headline ?? "",
      summary: input.summary ?? "",
      isPublic: input.isPublic ?? false,
      publicSlug: input.publicSlug ?? null,
    },
    update: {
      ...(input.headline !== undefined ? { headline: input.headline } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
      ...(input.publicSlug !== undefined ? { publicSlug: input.publicSlug } : {}),
    },
    include: withProjects,
  });
  return toPortfolioDto(row);
}

export async function addProject(
  userId: string,
  input: CreateProjectInput,
): Promise<PortfolioProject> {
  const portfolio = await prisma.portfolio.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });

  const order = await prisma.portfolioProject.count({ where: { portfolioId: portfolio.id } });
  const row = await prisma.portfolioProject.create({
    data: {
      portfolioId: portfolio.id,
      title: input.title,
      description: input.description,
      skillsUsed: input.skillsUsed,
      source: input.source,
      sourceRef: input.sourceRef,
      resultSummary: input.resultSummary,
      isPublic: input.isPublic,
      order,
    },
  });
  return toProjectDto(row);
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await prisma.portfolioProject.deleteMany({
    where: { id: projectId, portfolio: { userId } },
  });
}
