import { TrackCategory } from "@prisma/client";

import type { JobsMatchResponse } from "@/lib/contracts/jobs";
import { buildJobMatches } from "@/lib/matching/jobs";
import { prisma } from "@/lib/prisma";
import { ensureFeature, resolveApiSubscriptionContext } from "@/lib/saas/api-access";
import { listMarketplaceRoles } from "@/lib/saas/marketplace";
import { buildSaasJobMatches } from "@/lib/saas/matching";
import type { JobPosting, TrackTag } from "@/types/personalization";

type AccessContext = Awaited<ReturnType<typeof resolveApiSubscriptionContext>>;

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapTrack(value: TrackCategory | null | undefined): TrackTag {
  if (value === TrackCategory.BA) return "BA";
  if (value === TrackCategory.DA) return "DA";
  return "QA";
}

function mapJobLevel(value: string): JobPosting["level"] {
  return value === "Intern" || value === "Junior+" ? value : "Junior";
}

/**
 * Build the job-matching result for a learner. Mirrors the legacy /api/jobs/match
 * behavior, including the marketplace feature gate and locked/upgrade payload.
 * Identity-aware via the supplied access context.
 */
export async function buildJobMatchResult(
  accessContext: AccessContext,
  options: { track?: TrackTag; skills: string[] },
): Promise<JobsMatchResponse> {
  const marketplaceGate = ensureFeature(accessContext, "hiring.marketplace");
  const normalizedSkills =
    options.skills.length > 0 ? options.skills : ["SQL", "API Testing", "User Stories"];

  try {
    const jobRows = await prisma.jobPosting.findMany({
      where: { status: "PUBLISHED" },
      include: { role: { select: { track: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const runtimeJobs: JobPosting[] = jobRows.map((job) => ({
      id: job.id,
      title: job.title,
      level: mapJobLevel(job.level),
      location: job.location,
      requiredSkills: parseStringArray(job.requiredSkills),
      description: parseStringArray(job.responsibilities).join("; ") || `Role at ${job.company}`,
      roleTrack: mapTrack(job.role?.track),
    }));

    const matches = buildJobMatches({
      jobs: runtimeJobs,
      userSkills: normalizedSkills,
      preferredTrack: options.track,
    });

    if (!marketplaceGate.allowed) {
      return {
        matches: matches.slice(0, 2),
        marketplaceMatches: [],
        locked: true,
        upgradePlanId: marketplaceGate.upgradePlanId,
        message: "Upgrade to Career Accelerator to unlock full hiring marketplace matching.",
      };
    }

    const marketplaceRoles = await listMarketplaceRoles();
    const marketplaceMatches = buildSaasJobMatches({
      roles: marketplaceRoles,
      userSkills: normalizedSkills,
      portfolioSkills: normalizedSkills.slice(0, 3),
      missionOutcomes: [{ title: "Mission signal", score: 74, skills: normalizedSkills.slice(0, 3) }],
      readinessScore: 74,
    });

    return { matches, marketplaceMatches, locked: false };
  } catch {
    return {
      matches: [],
      marketplaceMatches: [],
      locked: !marketplaceGate.allowed,
      upgradePlanId: marketplaceGate.upgradePlanId,
    };
  }
}
