import type { Metadata } from "next";

import { BugReportSimulation } from "@/components/simulation/bug-report-simulation";

export const metadata: Metadata = {
  title: "Bug Tracker Simulation — SkillPath Academy",
  description: "QA simulation: practice writing clear, reproducible bug reports in a realistic tracker.",
};

export default function BugTrackerSimulationPage() {
  return <BugReportSimulation />;
}
