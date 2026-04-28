import { ProductTourStep } from "@/types/saas";

export const productTourSteps: ProductTourStep[] = [
  {
    id: "tour-dashboard",
    title: "Обзор панели управления",
    description: "Следи за прогрессом обучения, XP и приоритетами недели в одном месте.",
    targetId: "hero",
  },
  {
    id: "tour-radar",
    title: "Радар навыков",
    description: "Видь сильные и слабые стороны, выбирай следующую зону роста.",
    targetId: "skills",
  },
  {
    id: "tour-missions",
    title: "Система миссий",
    description: "Выполняй реальные задачи и превращай результаты в артефакты портфолио.",
    targetId: "missions",
  },
  {
    id: "tour-roadmap",
    title: "Карьерный путь",
    description: "Используй оценку готовности и подбор вакансий для движения к целевой роли.",
    targetId: "career",
  },
];
