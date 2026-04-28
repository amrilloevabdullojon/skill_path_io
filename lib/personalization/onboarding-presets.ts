import { TrackTag } from "@/types/personalization";

const profileTrackMap: Record<TrackTag, string> = {
  QA: "QA Инженер",
  BA: "Бизнес-Аналитик",
  DA: "Data Аналитик",
};

export function starterTrackByProfession(profession: TrackTag) {
  return profileTrackMap[profession];
}

export function buildStarterRoadmap(profession: TrackTag) {
  if (profession === "QA") {
    return ["Основы тестирования", "Тест-дизайн", "API тестирование", "Симуляция баг-трекера", "Финальный вызов QA"];
  }
  if (profession === "BA") {
    return ["Основы BA", "Сбор требований", "Создание User Story", "Симуляция встреч с заказчиком", "Финальный вызов BA"];
  }
  return ["Основы аналитики", "SQL для аналитиков", "Проектирование метрик", "Датасет Симуляция", "Финальный вызов DA"];
}
