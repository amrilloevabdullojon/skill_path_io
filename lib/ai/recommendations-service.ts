import { buildDefaultAdaptiveSignal } from "@/lib/personalization/adaptive-defaults";
import { getAdaptivePath } from "@/lib/recommendations/adaptive-path";
import { AdaptiveSignal } from "@/types/personalization";

export function buildUnifiedAiRecommendations(input?: Partial<AdaptiveSignal>) {
  const signal = buildDefaultAdaptiveSignal(input);

  const adaptive = getAdaptivePath(signal);
  return {
    suggestions: adaptive.suggestions,
    recoveryPlan: adaptive.recoveryPlan,
  };
}
