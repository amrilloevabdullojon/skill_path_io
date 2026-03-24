import { ProductTourStep } from "@/types/saas";

export const productTourSteps: ProductTourStep[] = [
  {
    id: "tour-dashboard",
    title: "Dashboard overview",
    description: "Track learning progress, XP, and weekly priorities in one place.",
    targetId: "hero",
  },
  {
    id: "tour-radar",
    title: "Skill radar",
    description: "See strongest and weakest skills, then set the next focus.",
    targetId: "skills",
  },
  {
    id: "tour-missions",
    title: "Mission system",
    description: "Complete real-work missions and convert output into portfolio artifacts.",
    targetId: "missions",
  },
  {
    id: "tour-roadmap",
    title: "Career roadmap",
    description: "Use readiness scoring and job matching to move toward target role.",
    targetId: "career",
  },
];
