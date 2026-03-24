import { buildPlannerForecast, rebuildPlanWithGoal } from "@/features/planner/plan-builder";
import { LearningPlan } from "@/types/personalization";

export function plannerForecast(plan: LearningPlan) {
  return buildPlannerForecast(plan);
}

export function updatePlanGoal(plan: LearningPlan, goal: string, weeklyHours: number) {
  return rebuildPlanWithGoal(plan, goal, weeklyHours);
}
