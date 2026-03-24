import { buildAdaptiveSuggestions, buildRecoveryPlan } from "@/features/adaptive-learning/engine";
import { AdaptiveSignal } from "@/types/personalization";

export function getAdaptivePath(signal: AdaptiveSignal) {
  return {
    suggestions: buildAdaptiveSuggestions(signal),
    recoveryPlan: buildRecoveryPlan(signal),
  };
}
