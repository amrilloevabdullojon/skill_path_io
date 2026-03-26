import type { Metadata } from "next";

import { BaSimulationForm } from "@/components/simulation/ba-simulation-form";

export const metadata: Metadata = {
  title: "BA Simulation — SkillPath Academy",
  description: "Business Analyst simulation: practice requirements gathering and stakeholder communication.",
};

export default function BaSimulationPage() {
  return <BaSimulationForm />;
}
