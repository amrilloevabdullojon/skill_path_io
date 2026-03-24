import { LearningPlan } from "@/types/personalization";

export function buildPlannerForecast(plan: LearningPlan) {
  const totalMinutes = plan.tasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const weeklyCapacity = plan.weeklyHours * 60;
  const loadPercent = weeklyCapacity > 0 ? Math.min(Math.round((totalMinutes / weeklyCapacity) * 100), 100) : 0;

  return {
    totalMinutes,
    weeklyCapacity,
    loadPercent,
    realistic: loadPercent <= 85,
    recommendation:
      loadPercent > 90
        ? "Reduce one low-priority task or spread work across two weeks."
        : "Plan is realistic if you keep your weekly cadence.",
  };
}

export function rebuildPlanWithGoal(plan: LearningPlan, goal: string, weeklyHours: number): LearningPlan {
  const updated = { ...plan };
  updated.goal = goal;
  updated.weeklyHours = weeklyHours;
  updated.workload = weeklyHours >= 8 ? "Intense" : weeklyHours >= 5 ? "Balanced" : "Light";
  return updated;
}
