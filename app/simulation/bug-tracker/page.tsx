import type { Metadata } from "next";

import { BugReportSimulation } from "@/components/simulation/bug-report-simulation";

export const metadata: Metadata = {
  title: "Симулятор Баг-трекера — Levio",
  description: "QA симуляция: практикуйтесь в написании понятных и воспроизводимых баг-репортов в реалистичном баг-трекере.",
};

export default function BugTrackerSimulationPage() {
  return <BugReportSimulation />;
}
