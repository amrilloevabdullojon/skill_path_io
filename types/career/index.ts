export type CareerReadinessCard = {
  score: number;
  level: "Beginner" | "Foundation" | "Junior-ready" | "Strong Junior" | "Pre-Middle";
  missingSkills: string[];
  strengths: string[];
  nextMilestone: string;
};

export type JobMatchCard = {
  id: string;
  title: string;
  matchPercent: number;
  missingRequirements: string[];
};
