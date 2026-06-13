import { describe, expect, it } from "vitest";

import {
  TrackDetailSchema,
  TrackParamsSchema,
  TracksCatalogSchema,
  TracksQuerySchema,
} from "@/lib/contracts/tracks";

describe("tracks contract: TracksQuerySchema", () => {
  it("applies defaults when params are absent", () => {
    const parsed = TracksQuerySchema.parse({});
    expect(parsed).toEqual({ includeCourseEntities: true, includeDraftCourses: false });
  });

  it("coerces truthy/falsy string params", () => {
    expect(TracksQuerySchema.parse({ includeCourseEntities: "0" }).includeCourseEntities).toBe(
      false,
    );
    expect(TracksQuerySchema.parse({ includeDraftCourses: "1" }).includeDraftCourses).toBe(true);
    expect(TracksQuerySchema.parse({ includeDraftCourses: "true" }).includeDraftCourses).toBe(true);
    expect(TracksQuerySchema.parse({ includeCourseEntities: "false" }).includeCourseEntities).toBe(
      false,
    );
  });

  it("rejects non-boolean-like values", () => {
    expect(TracksQuerySchema.safeParse({ includeCourseEntities: "maybe" }).success).toBe(false);
  });
});

describe("tracks contract: TracksCatalogSchema", () => {
  it("accepts a minimal valid catalog", () => {
    const result = TracksCatalogSchema.safeParse({ source: "mixed", courses: [] });
    expect(result.success).toBe(true);
  });

  it("accepts a fully-populated course", () => {
    const result = TracksCatalogSchema.safeParse({
      source: "prisma-track",
      courses: [
        {
          id: "c1",
          slug: "qa-foundations",
          title: "QA Foundations",
          shortTitle: "QA",
          description: "desc",
          shortDescription: "short",
          category: "QA",
          level: "BEGINNER",
          estimatedDuration: 600,
          status: "PUBLISHED",
          visibility: "PUBLIC",
          source: "prisma-track",
          tags: ["qa"],
          icon: "shield",
          color: "#6366f1",
          modules: [],
          skills: ["testing"],
          careerImpact: null,
          estimatedWeeks: 6,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown category", () => {
    const result = TracksCatalogSchema.safeParse({
      source: "mixed",
      courses: [{ category: "PHYSICS" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("tracks contract: track detail", () => {
  it("requires a non-empty slug", () => {
    expect(TrackParamsSchema.safeParse({ slug: "qa-foundations" }).success).toBe(true);
    expect(TrackParamsSchema.safeParse({ slug: "" }).success).toBe(false);
    expect(TrackParamsSchema.safeParse({}).success).toBe(false);
  });

  it("wraps a single course under `course`", () => {
    const result = TrackDetailSchema.safeParse({
      course: {
        id: "c1",
        slug: "qa-foundations",
        title: "QA Foundations",
        shortTitle: "QA",
        description: "desc",
        shortDescription: "short",
        category: "QA",
        level: "BEGINNER",
        estimatedDuration: 600,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        source: "prisma-track",
        tags: [],
        icon: "shield",
        color: "#6366f1",
        modules: [],
      },
    });
    expect(result.success).toBe(true);
  });
});
