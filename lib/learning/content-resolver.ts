import "server-only";

import { prisma } from "@/lib/prisma";
import { tracksSeed } from "@/lib/data/tracks";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import {
  adaptPrismaCourseToRuntimeCourse,
  adaptPrismaTrackToRuntimeCourse,
  adaptSeedTrackToRuntimeCourse,
} from "@/lib/learning/content-adapters";
import { RuntimeCatalog, RuntimeCourse } from "@/lib/learning/content-types";

type ResolverOptions = {
  includeDraftCourses?: boolean;
  includeCourseEntities?: boolean;
};

const trackInclude = {
  modules: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
      },
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  },
};

const courseInclude = {
  modules: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
        include: {
          blocks: {
            orderBy: { order: "asc" as const },
          },
        },
      },
      quizzes: {
        include: {
          questions: true,
        },
      },
      assignments: true,
      simulations: true,
    },
  },
};

function fallbackSeedCatalog(): RuntimeCatalog {
  return {
    source: "seed-track",
    courses: tracksSeed.map(adaptSeedTrackToRuntimeCourse),
  };
}

export async function resolveRuntimeCatalog(options: ResolverOptions = {}): Promise<RuntimeCatalog> {
  const includeDraftCourses = Boolean(options.includeDraftCourses);
  const includeCourseEntities = Boolean(options.includeCourseEntities);

  try {
    const [tracks, courses] = await Promise.all([
      prisma.track.findMany({
        orderBy: { title: "asc" },
        include: trackInclude,
      }),
      includeCourseEntities
        ? prisma.course.findMany({
            where: includeDraftCourses ? undefined : { status: "PUBLISHED" },
            orderBy: { title: "asc" },
            include: courseInclude,
          })
        : Promise.resolve([]),
    ]);

    const runtimeTracks = tracks.map(adaptPrismaTrackToRuntimeCourse);
    const runtimeCourses = courses.map(adaptPrismaCourseToRuntimeCourse);
    const merged = [...runtimeTracks, ...runtimeCourses];

    if (merged.length === 0) {
      if (isDemoModeEnabled()) {
        return fallbackSeedCatalog();
      }
      return {
        source: "prisma-track",
        courses: [],
      };
    }

    return {
      source: runtimeCourses.length > 0 ? "mixed" : "prisma-track",
      courses: merged,
    };
  } catch {
    if (isDemoModeEnabled()) {
      return fallbackSeedCatalog();
    }
    return {
      source: "prisma-track",
      courses: [],
    };
  }
}

export async function resolveRuntimeCourseBySlug(
  slug: string,
  options: ResolverOptions = {},
): Promise<RuntimeCourse | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  try {
    const track = await prisma.track.findUnique({
      where: { slug: normalizedSlug },
      include: trackInclude,
    });
    if (track) {
      return adaptPrismaTrackToRuntimeCourse(track);
    }
  } catch {
    // Fall through to safe fallback sources.
  }

  if (options.includeCourseEntities) {
    try {
      const course = await prisma.course.findUnique({
        where: { slug: normalizedSlug },
        include: courseInclude,
      });
      if (course) {
        if (!options.includeDraftCourses && course.status !== "PUBLISHED") {
          return null;
        }
        return adaptPrismaCourseToRuntimeCourse(course);
      }
    } catch {
      // Keep fallback behavior.
    }
  }

  if (isDemoModeEnabled()) {
    const seedTrack = tracksSeed.find((track) => track.slug === normalizedSlug);
    if (seedTrack) {
      return adaptSeedTrackToRuntimeCourse(seedTrack);
    }
  }

  return null;
}

export async function resolveRuntimeCourseById(
  courseId: string,
  options: Pick<ResolverOptions, "includeDraftCourses"> = {},
): Promise<RuntimeCourse | null> {
  const normalizedId = courseId.trim();
  if (!normalizedId) {
    return null;
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: normalizedId },
      include: courseInclude,
    });
    if (!course) {
      return null;
    }
    if (!options.includeDraftCourses && course.status !== "PUBLISHED") {
      return null;
    }
    return adaptPrismaCourseToRuntimeCourse(course);
  } catch {
    return null;
  }
}
