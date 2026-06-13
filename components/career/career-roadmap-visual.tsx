import { CheckCircle2, Circle } from "lucide-react";

type CareerRoadmapVisualProps = {
  readinessScore: number;
};

type Stage = {
  id: string;
  title: string;
  description: string;
  unlockOutcome: string;
  threshold: number;
};

const stages: Stage[] = [
  {
    id: "beginner",
    title: "Новичок",
    description: "Настройка профиля и стартовых целей.",
    unlockOutcome: "Персональный Roadmap",
    threshold: 10,
  },
  {
    id: "foundations",
    title: "Фундамент",
    description: "Прохождение базовых модулей теории.",
    unlockOutcome: "Бейдж базовых знаний",
    threshold: 30,
  },
  {
    id: "practice",
    title: "Практика",
    description: "Квизы и практические чекпоинты.",
    unlockOutcome: "Подтверждение практики",
    threshold: 50,
  },
  {
    id: "missions",
    title: "ИИ-Миссии",
    description: "Решение реальных рабочих сценариев.",
    unlockOutcome: "Артефакты в портфолио",
    threshold: 65,
  },
  {
    id: "interview-ready",
    title: "Готовность к интервью",
    description: "Собеседование с ИИ-ментором.",
    unlockOutcome: "Оценка сильных и слабых сторон",
    threshold: 78,
  },
  {
    id: "job-ready",
    title: "Готовность к офферу",
    description: "Закрытие остаточных компетенций.",
    unlockOutcome: "Доступ к премиум вакансиям",
    threshold: 90,
  },
];

export function CareerRoadmapVisual({ readinessScore }: CareerRoadmapVisualProps) {
  return (
    <section className="surface-elevated border border-border/50 bg-card rounded-2xl space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">Карьерный Трек</h2>
        <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          готовность: <span className="text-foreground">{readinessScore}%</span>
        </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const unlocked = readinessScore >= stage.threshold;
          return (
            <div key={stage.id} className="space-y-2">
              <article
                className={`surface-subtle p-3 ${
                  unlocked ? "border-emerald-400/25 bg-emerald-500/8" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stage.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{stage.description}</p>
                    <p className="mt-1.5 text-[11px] uppercase tracking-wider font-bold text-indigo-400">Награда: <span className="text-foreground font-medium capitalize-none">{stage.unlockOutcome}</span></p>
                  </div>
                  <span className="mt-0.5">
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                </div>
              </article>
              {index < stages.length - 1 ? <div className="mx-2 h-4 border-l border-border" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

