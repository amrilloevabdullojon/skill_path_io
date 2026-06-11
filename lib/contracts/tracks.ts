import { z } from "zod";

import type { RuntimeCatalog } from "@/lib/learning/content-types";

import { booleanParam } from "@/lib/contracts/params";

/**
 * Contract for `GET /api/v1/tracks`.
 *
 * These Zod schemas are the single source of truth for the endpoint's request
 * and response shapes. They drive runtime validation today and OpenAPI/client
 * generation next. The response schema is kept in sync with the internal
 * `RuntimeCatalog` type via the compile-time assertion at the bottom of this file.
 */

// ── Request ──────────────────────────────────────────────────────────────────

export const TracksQuerySchema = z.object({
  /** Include Course-authored entities (published studio courses), not just Tracks. */
  includeCourseEntities: booleanParam(true),
  /** Include not-yet-published (draft) courses. Off by default for learners. */
  includeDraftCourses: booleanParam(false),
});

export type TracksQuery = z.infer<typeof TracksQuerySchema>;

// ── Response ─────────────────────────────────────────────────────────────────

export const RuntimeStatusSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
  "UNKNOWN",
]);
export const RuntimeVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]);
const RuntimeCategorySchema = z.enum([
  "QA",
  "BA",
  "DA",
  "PRODUCT",
  "MANAGEMENT",
  "GENERAL",
]);
const RuntimeLevelSchema = z.enum([
  "BEGINNER",
  "JUNIOR",
  "INTERMEDIATE",
  "ADVANCED",
  "UNKNOWN",
]);
const RuntimeContentSourceSchema = z.enum([
  "prisma-track",
  "prisma-course",
  "studio-course",
  "seed-track",
]);

const RuntimeLessonBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string(),
  order: z.number(),
  config: z.record(z.string(), z.unknown()),
});

export const RuntimeLessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  body: z.string(),
  lessonType: z.string(),
  estimatedDuration: z.number(),
  status: RuntimeStatusSchema,
  blocks: z.array(RuntimeLessonBlockSchema),
});

const RuntimeQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
  correctAnswer: z.array(z.string()),
});

const RuntimeQuizSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  description: z.string(),
  passingScore: z.number(),
  status: RuntimeStatusSchema,
  questions: z.array(RuntimeQuestionSchema),
});

export const RuntimeMissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  scenario: z.string(),
  objective: z.string(),
  xpReward: z.number(),
  difficulty: z.string(),
  status: RuntimeStatusSchema,
});

export const RuntimeSimulationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  simulationType: z.string(),
  xpReward: z.number(),
  difficulty: z.string(),
  status: RuntimeStatusSchema,
});

const RuntimeModuleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  estimatedDuration: z.number(),
  xpReward: z.number(),
  status: RuntimeStatusSchema,
  visibility: RuntimeVisibilitySchema,
  content: z.record(z.string(), z.unknown()),
  lessons: z.array(RuntimeLessonSchema),
  quiz: RuntimeQuizSchema.nullable(),
  missions: z.array(RuntimeMissionSchema),
  simulations: z.array(RuntimeSimulationSchema),
});

export const TrackCourseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  shortTitle: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  category: RuntimeCategorySchema,
  level: RuntimeLevelSchema,
  estimatedDuration: z.number(),
  status: RuntimeStatusSchema,
  visibility: RuntimeVisibilitySchema,
  source: RuntimeContentSourceSchema,
  tags: z.array(z.string()),
  icon: z.string(),
  color: z.string(),
  modules: z.array(RuntimeModuleSchema),
  // Extended DB-backed fields (present when source === "prisma-track")
  skills: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  careerImpact: z.string().nullable().optional(),
  estimatedWeeks: z.number().nullable().optional(),
});

export type TrackCourse = z.infer<typeof TrackCourseSchema>;

export const TracksCatalogSchema = z.object({
  source: z.union([RuntimeContentSourceSchema, z.literal("mixed")]),
  courses: z.array(TrackCourseSchema),
});

export type TracksCatalogResponse = z.infer<typeof TracksCatalogSchema>;

// ── Single track (detail) ────────────────────────────────────────────────────

export const TrackParamsSchema = z.object({
  slug: z.string().min(1, "slug is required"),
});

export const TrackDetailSchema = z.object({
  course: TrackCourseSchema,
});
export type TrackDetailResponse = z.infer<typeof TrackDetailSchema>;

/**
 * Compile-time guard: the internal RuntimeCatalog must satisfy the published
 * contract. If the runtime type drifts from this schema, typecheck fails here.
 */
type _AssertCatalogMatchesContract = RuntimeCatalog extends TracksCatalogResponse
  ? true
  : never;
const _assertCatalogMatchesContract: _AssertCatalogMatchesContract = true;
void _assertCatalogMatchesContract;
