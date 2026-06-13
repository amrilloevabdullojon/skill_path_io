import { z } from "zod";

import type { LearningPlan } from "@/types/personalization";

/** Contract for `POST /api/v1/planner/forecast`. */

export const PlannerTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["lesson", "quiz", "simulation", "review", "mission"]),
  durationMinutes: z.number(),
  day: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
});

export const LearningPlanSchema = z.object({
  id: z.string(),
  goal: z.string(),
  weeklyHours: z.number(),
  forecastDate: z.string(),
  workload: z.enum(["Light", "Balanced", "Intense"]),
  tasks: z.array(PlannerTaskSchema),
});

export const PlannerForecastRequestSchema = z.object({
  plan: LearningPlanSchema,
});
export type PlannerForecastRequest = z.infer<typeof PlannerForecastRequestSchema>;

export const PlannerForecastSchema = z.object({
  totalMinutes: z.number(),
  weeklyCapacity: z.number(),
  loadPercent: z.number(),
  realistic: z.boolean(),
  recommendation: z.string(),
});
export type PlannerForecast = z.infer<typeof PlannerForecastSchema>;

// Keep the schema in sync with the domain LearningPlan type both ways.
type _AssertPlanMatches = LearningPlan extends z.infer<typeof LearningPlanSchema>
  ? z.infer<typeof LearningPlanSchema> extends LearningPlan
    ? true
    : never
  : never;
const _assertPlanMatches: _AssertPlanMatches = true;
void _assertPlanMatches;
