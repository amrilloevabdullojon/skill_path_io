import { Badge, PublicProfileSnapshot } from "@/types/saas";

export function toPublicHandle(name: string, userId: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const suffix = userId.slice(-6);
  return `${base || "learner"}-${suffix}`;
}

type BuildPublicProfileInput = {
  handle: string;
  name: string;
  headline: string;
  skillRadar: Array<{ skill: string; value: number }>;
  badges: Badge[];
  missionOutcomes: Array<{ title: string; score: number }>;
  portfolioHighlights: string[];
  readinessScore: number;
};

export function buildPublicProfileSnapshot(input: BuildPublicProfileInput): PublicProfileSnapshot {
  return {
    handle: input.handle,
    name: input.name,
    headline: input.headline,
    skillRadar: input.skillRadar.slice(0, 8),
    badges: input.badges.slice(0, 10),
    missionOutcomes: input.missionOutcomes.slice(0, 6),
    portfolioHighlights: input.portfolioHighlights.slice(0, 6),
    readinessScore: Math.max(0, Math.min(input.readinessScore, 100)),
  };
}
