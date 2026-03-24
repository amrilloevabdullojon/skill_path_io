import "server-only";

import { TrackCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { CandidateProfile, MarketplaceRole, RoleApplication } from "@/types/saas";

declare global {
  // eslint-disable-next-line no-var
  var skillPathMarketplaceApplications: RoleApplication[] | undefined;
}

const localApplications = global.skillPathMarketplaceApplications ?? [];

if (!global.skillPathMarketplaceApplications) {
  global.skillPathMarketplaceApplications = localApplications;
}

function nowIso() {
  return new Date().toISOString();
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function minReadinessFromTrack(track: TrackCategory | null | undefined) {
  if (track === TrackCategory.BA) {
    return 65;
  }
  if (track === TrackCategory.DA) {
    return 68;
  }
  return 60;
}

export async function listMarketplaceRoles(): Promise<MarketplaceRole[]> {
  try {
    const postings = await prisma.jobPosting.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        role: {
          select: {
            track: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return postings.map((job) => ({
      id: `market-${job.id}`,
      title: job.title,
      company: job.company,
      location: job.location,
      requiredSkills: parseStringArray(job.requiredSkills),
      minReadinessScore: minReadinessFromTrack(job.role?.track),
      status: "OPEN",
    }));
  } catch {
    return [];
  }
}

export function listMarketplaceApplications(candidateUserId?: string) {
  if (!candidateUserId) {
    return [...localApplications];
  }
  return localApplications.filter((item) => item.candidateUserId === candidateUserId);
}

export function submitRoleApplication(input: {
  roleId: string;
  candidateUserId: string;
  portfolioUrl: string;
}) {
  const existing = localApplications.find(
    (item) => item.roleId === input.roleId && item.candidateUserId === input.candidateUserId,
  );
  if (existing) {
    return existing;
  }

  const created: RoleApplication = {
    id: `app-${Date.now()}`,
    roleId: input.roleId,
    candidateUserId: input.candidateUserId,
    portfolioUrl: input.portfolioUrl,
    createdAt: nowIso(),
    status: "SUBMITTED",
  };

  localApplications.unshift(created);
  return created;
}

export function buildCandidateProfile(input: {
  userId: string;
  name: string;
  publicHandle: string;
  readinessScore: number;
  skills: string[];
  badges: string[];
  portfolioHighlights: string[];
}): CandidateProfile {
  return {
    userId: input.userId,
    name: input.name,
    publicHandle: input.publicHandle,
    readinessScore: input.readinessScore,
    skills: input.skills.slice(0, 8),
    badges: input.badges.slice(0, 8),
    portfolioHighlights: input.portfolioHighlights.slice(0, 5),
  };
}
