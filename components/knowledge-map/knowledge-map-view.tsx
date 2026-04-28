import { GitBranchPlus, Lock, Sparkles } from "lucide-react";

import { knowledgeCompletion, nextRecommendedNode } from "@/features/knowledge-map/map";
import { KnowledgeNode } from "@/types/personalization";

export function KnowledgeMapView({ nodes }: { nodes: KnowledgeNode[] }) {
  const completion = knowledgeCompletion(nodes);
  const nextNode = nextRecommendedNode(nodes);

  const grouped = nodes.reduce<Record<string, KnowledgeNode[]>>((acc, node) => {
    const key = node.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(node);
    return acc;
  }, {});

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Карта знаний</p>
        <h1 className="page-title">Зависимости, открытые навыки и следующие темы</h1>
        <p className="section-description">Визуализируй: что завершено, что заблокировано и что открыть следующим.</p>
      </header>

      <section className="surface-elevated space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Выполнено: {completion.completed}/{completion.total} узлов ({completion.percent}%)</p>
          {nextNode ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/35 bg-indigo-500/12 px-3 py-1 text-xs text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Рекомендуется: {nextNode.title}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {Object.entries(grouped).map(([category, list]) => (
          <article key={category} className="surface-elevated space-y-3 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <GitBranchPlus className="h-4 w-4 text-violet-300" />
              {category}
            </p>
            <div className="space-y-2">
              {list.map((node) => (
                <div key={node.id} className="content-card px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{node.title}</p>
                    {node.locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wide">
                    {node.completed ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2 py-0.5 text-emerald-200">Завершено</span>
                    ) : node.locked ? (
                      <span className="chip-neutral px-2 py-0.5">Заблокировано</span>
                    ) : (
                      <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-amber-200">Доступно</span>
                    )}
                    {node.recommended ? (
                      <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2 py-0.5 text-indigo-200">Рекомендуется</span>
                    ) : null}
                  </div>
                  {node.dependencies.length > 0 ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">Зависит от: {node.dependencies.join(", ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
