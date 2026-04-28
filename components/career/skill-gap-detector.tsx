import { Target } from "lucide-react";

type SkillGapDetectorProps = {
  targetRole: string;
  userSkills: string[];
  requiredSkills: string[];
  recommendedModules: string[];
};

export function SkillGapDetector({
  targetRole,
  userSkills,
  requiredSkills,
  recommendedModules,
}: SkillGapDetectorProps) {
  const normalizedUserSkills = userSkills.map((skill) => skill.toLowerCase());
  const gaps = requiredSkills.filter((skill) => !normalizedUserSkills.includes(skill.toLowerCase()));

  return (
    <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-4 p-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="text-lg font-semibold text-foreground">Анализ пробелов в навыках</h2>
        <span className="inline-flex items-center gap-1 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <Target className="h-4 w-4" />
          {targetRole}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="surface-subtle space-y-2 p-3">
          <p className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">Имеющиеся навыки</p>
          <div className="flex flex-wrap gap-1.5">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-emerald-400/25 bg-emerald-500/12 px-2 py-0.5 text-[11px] text-emerald-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-subtle space-y-2 p-3">
          <p className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">Пробелы</p>
          {gaps.length === 0 ? (
            <p className="text-sm font-bold text-emerald-400">Для этой роли пробелов не найдено.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {gaps.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-amber-400/50 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="surface-subtle space-y-2 p-3">
        <p className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">Рекомендованные модули</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {recommendedModules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

