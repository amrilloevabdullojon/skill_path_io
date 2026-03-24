import { NextResponse } from "next/server";
import { TrackCategory } from "@prisma/client";

import { buildJobMatches } from "@/lib/matching/jobs";
import { prisma } from "@/lib/prisma";
import { ensureFeature, resolveApiSubscriptionContext } from "@/lib/saas/api-access";
import { listMarketplaceRoles } from "@/lib/saas/marketplace";
import { buildSaasJobMatches } from "@/lib/saas/matching";
import { JobPosting, TrackTag } from "@/types/personalization";

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function mapTrack(value: TrackCategory | null | undefined): TrackTag {
  if (value === TrackCategory.BA) {
    return "BA";
  }
  if (value === TrackCategory.DA) {
    return "DA";
  }
  return "QA";
}

function parseTrackTag(value: string | null): TrackTag | null {
  if (value === "QA" || value === "BA" || value === "DA") {
    return value;
  }
  return null;
}

function mapJobLevel(value: string): JobPosting["level"] {
  if (value === "Intern" || value === "Junior+") {
    return value;
  }
  return "Junior";
}

export async function GET(request: Request) {
  const accessContext = await resolveApiSubscriptionContext();
  const marketplaceGate = ensureFeature(accessContext, "hiring.marketplace");

  const url = new URL(request.url);
  const track = parseTrackTag(url.searchParams.get("track"));
  const skills = url.searchParams.getAll("skill");
  const normalizedSkills = skills.length > 0 ? skills : ["SQL", "API Testing", "User Stories"];

  try {
    const jobRows = await prisma.jobPosting.findMany({
      where: { status: "PUBLISHED" },
      include: {
        role: {
          select: {
            track: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const runtimeJobs = jobRows.map((job) => ({
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
      preferredTrack: track ?? undefined,
    });

    if (!marketplaceGate.allowed) {
      return NextResponse.json({
        matches: matches.slice(0, 2),
        locked: true,
        upgradePlanId: marketplaceGate.upgradePlanId,
        message: "Upgrade to Career Accelerator to unlock full hiring marketplace matching.",
      });
    }

    const marketplaceRoles = await listMarketplaceRoles();
    const marketplaceMatches = buildSaasJobMatches({
      roles: marketplaceRoles,
      userSkills: normalizedSkills,
      portfolioSkills: normalizedSkills.slice(0, 3),
      missionOutcomes: [
        {
          title: "Mission signal",
          score: 74,
          skills: normalizedSkills.slice(0, 3),
        },
      ],
      readinessScore: 74,
    });

    return NextResponse.json({
      matches,
      marketplaceMatches,
      locked: false,
    });
  } catch {
    return NextResponse.json(
      {
        matches: [],
        marketplaceMatches: [],
        locked: !marketplaceGate.allowed,
        upgradePlanId: marketplaceGate.upgradePlanId,
      },
      { status: 200 },
    );
  }
}
