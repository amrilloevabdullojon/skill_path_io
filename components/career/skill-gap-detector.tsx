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
    <section className="surface-elevated space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-100">Skill Gap Detector</h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
          <Target className="h-3.5 w-3.5 text-sky-300" />
          {targetRole}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="surface-subtle space-y-2 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Covered skills</p>
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
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Skill gaps</p>
          {gaps.length === 0 ? (
            <p className="text-sm text-emerald-200">No major gaps detected for this role.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {gaps.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="surface-subtle space-y-2 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Recommended modules</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {recommendedModules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

