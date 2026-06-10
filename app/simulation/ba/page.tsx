import type { Metadata } from "next";

import { BaSimulationForm } from "@/components/simulation/ba-simulation-form";

export const metadata: Metadata = {
  title: "Симулятор BA",
  description: "Симулятор Бизнес-Аналитика: практикуйтесь в сборе бизнес-требований и общении со стейкхолдерами.",
};

export default function BaSimulationPage() {
  return <BaSimulationForm />;
}
