import { AdaptiveSignal, AdaptiveSuggestion } from "@/types/personalization";

function priority(value: number): AdaptiveSuggestion["priority"] {
  if (value >= 75) return "Low";
  if (value >= 55) return "Medium";
  return "High";
}

export function buildAdaptiveSuggestions(signal: AdaptiveSignal): AdaptiveSuggestion[] {
  const suggestions: AdaptiveSuggestion[] = [];

  if (signal.quizAccuracy < 75) {
    suggestions.push({
      id: "adaptive-remedial-quiz",
      title: "Reinforce weak quiz topics",
      reason: `Quiz accuracy is ${signal.quizAccuracy}%.`,
      action: "Review key lesson blocks and retake the weakest quiz module.",
      priority: priority(signal.quizAccuracy),
      href: "/review",
      type: "remedial",
    });
  }

  if (signal.simulationPerformance < 70) {
    suggestions.push({
      id: "adaptive-practice-sim",
      title: "Practice real-work simulation",
      reason: `Simulation performance is ${signal.simulationPerformance}%.`,
      action: "Complete one focused simulation with AI feedback.",
      priority: priority(signal.simulationPerformance),
      href: "/missions",
      type: "practice",
    });
  }

  if (signal.skippedLessons >= 2) {
    suggestions.push({
      id: "adaptive-review-skipped",
      title: "Recover skipped lessons",
      reason: `${signal.skippedLessons} lessons were skipped recently.`,
      action: "Use speed review cards and complete a short recap quiz.",
      priority: "High",
      href: "/review",
      type: "review",
    });
  }

  if (signal.quizAccuracy >= 82 && signal.simulationPerformance >= 78) {
    suggestions.push({
      id: "adaptive-accelerate",
      title: "Acceleration path unlocked",
      reason: "Strong outcomes in quizzes and simulations.",
      action: "Skip optional recap and move to challenge mission.",
      priority: "Low",
      href: "/missions",
      type: "acceleration",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "adaptive-keep-pace",
      title: "Maintain learning velocity",
      reason: "Performance is stable across modules.",
      action: "Continue next module and keep weekly review habit.",
      priority: "Medium",
      href: "/planner",
      type: "practice",
    });
  }

  return suggestions.slice(0, 5);
}

export function buildRecoveryPlan(signal: AdaptiveSignal) {
  const focus = signal.frequentMistakes.slice(0, 3);
  return [
    `Review lesson on: ${focus[0] ?? "core concept"}`,
    "Redo the related quiz and target 80%+",
    "Complete one practical mission in the same topic",
    "Open AI mentor and request simplified explanation",
  ];
}
