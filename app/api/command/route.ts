import { NextResponse } from "next/server";
import { TrackCategory } from "@prisma/client";

import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function mapTrackTag(value: string | TrackCategory | null | undefined) {
  if (value === TrackCategory.BA || value === "BA") {
    return "BA";
  }
  if (value === TrackCategory.DA || value === "DA") {
    return "DA";
  }
  return "QA";
}

export async function GET() {
  try {
    const [catalog, missions, jobs] = await Promise.all([
      resolveRuntimeCatalog({ includeCourseEntities: true }),
      prisma.learningMission.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          roleContext: true,
          category: true,
        },
        take: 60,
      }),
      prisma.jobPosting.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: {
          role: {
            select: {
              track: true,
            },
          },
        },
        take: 60,
      }),
    ]);

    const tracks = catalog.courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      modules: course.modules.map((moduleItem) => ({
        id: moduleItem.id,
        title: moduleItem.title,
        description: moduleItem.description,
        order: moduleItem.order,
      })),
    }));

    const runtimeMissions = missions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      roleContext: mission.roleContext,
      category: mapTrackTag(mission.category),
    }));

    const runtimeJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      level: job.level,
      location: job.location,
      roleTrack: mapTrackTag(job.role?.track),
    }));

    return NextResponse.json({
      tracks,
      missions: runtimeMissions,
      jobs: runtimeJobs,
    });
  } catch {
    return NextResponse.json(
      {
        tracks: [],
        missions: [],
        jobs: [],
      },
      { status: 200 },
    );
  }
}
