import type { TrackCategory, TrackStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// ─── Write operations for admin track actions ─────────────────────────────────

export async function trackCreate(data: {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: TrackCategory;
  status: TrackStatus;
  estimatedWeeks?: number | null;
  skills?: string[];
  learningOutcomes?: string[];
  careerImpact?: string | null;
}) {
  const { estimatedWeeks, skills, learningOutcomes, careerImpact, ...rest } = data;
  return prisma.track.create({
    data: {
      ...rest,
      ...(estimatedWeeks != null ? { estimatedWeeks } : {}),
      ...(skills !== undefined ? { skills } : {}),
      ...(learningOutcomes !== undefined ? { learningOutcomes } : {}),
      ...(careerImpact ? { careerImpact } : {}),
    },
  });
}

export async function trackUpdate(
  id: string,
  data: {
    title: string;
    description: string;
    color: string;
    category: TrackCategory;
    status?: TrackStatus;
    estimatedWeeks?: number;
    skills?: string[];
    learningOutcomes?: string[];
    careerImpact?: string | null;
  },
) {
  const { status, estimatedWeeks, skills, learningOutcomes, careerImpact, ...rest } = data;
  return prisma.track.update({
    where: { id },
    data: {
      ...rest,
      ...(status ? { status } : {}),
      ...(estimatedWeeks !== undefined ? { estimatedWeeks } : {}),
      ...(skills !== undefined ? { skills } : {}),
      ...(learningOutcomes !== undefined ? { learningOutcomes } : {}),
      ...(careerImpact !== null ? { careerImpact } : {}),
    },
  });
}

export async function trackDelete(id: string) {
  return prisma.track.delete({ where: { id } });
}
