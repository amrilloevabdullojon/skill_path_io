import { TrackCategory } from "@prisma/client";

import { withErrorHandler } from "@/lib/api/error-handler";
import { respond } from "@/lib/api/v1/http";
import { CommandResponseSchema } from "@/lib/contracts/command";
import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mapTrackTag(value: string | TrackCategory | null | undefined): "QA" | "BA" | "DA" {
  if (value === TrackCategory.BA || value === "BA") return "BA";
  if (value === TrackCategory.DA || value === "DA") return "DA";
  return "QA";
}

/** GET /api/v1/command — lightweight catalog (tracks, missions, jobs) for the command palette. */
export const GET = withErrorHandler(async () => {
  const [catalog, missions, jobs] = await Promise.all([
    resolveRuntimeCatalog({ includeCourseEntities: true }),
    prisma.learningMission.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, roleContext: true, category: true },
      take: 60,
    }),
    prisma.jobPosting.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: { role: { select: { track: true } } },
      take: 60,
    }),
  ]);

  return respond(CommandResponseSchema, {
    tracks: catalog.courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      modules: course.modules.map((moduleItem) => ({
        id: moduleItem.id,
        title: moduleItem.title,
        description: moduleItem.description,
        order: moduleItem.order,
      })),
    })),
    missions: missions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      roleContext: mission.roleContext,
      category: mapTrackTag(mission.category),
    })),
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      level: job.level,
      location: job.location,
      roleTrack: mapTrackTag(job.role?.track),
    })),
  });
});
