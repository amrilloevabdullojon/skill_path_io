import { SkillBranch, categoryAccent } from "@/lib/skill-tree/tree";

type SkillTreeViewProps = {
  branches: SkillBranch[];
  compact?: boolean;
};

export function SkillTreeView({ branches, compact = false }: SkillTreeViewProps) {
  return (
    <div className="space-y-4">
      {branches.map((branch) => (
        <section key={branch.id} className="surface-subtle space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">{branch.title}</h3>
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${categoryAccent(branch.category)}`}>
              {branch.category}
            </span>
          </div>

          <div className={compact ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 md:grid-cols-3"}>
            {branch.children.map((child) => (
              <article key={child.id} className="content-card p-3">
                <p className="text-sm font-semibold text-foreground">{child.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{child.description}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
