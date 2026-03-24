"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Search } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

export function TemplatesManager() {
  const router = useRouter();
  const templates = useCourseBuilderStore((state) => state.templates);
  const createFromTemplate = useCourseBuilderStore((state) => state.createFromTemplate);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((template) => {
      if (!q) return true;
      return (
        template.title.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.tags.join(" ").toLowerCase().includes(q)
      );
    });
  }, [query, templates]);

  function handleCreateFromTemplate(templateId: string) {
    const courseId = createFromTemplate(templateId);
    if (courseId) {
      router.push(`/admin/courses/${courseId}/builder`);
    }
  }

  return (
    <section className="surface-elevated space-y-4 p-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">Course Templates</h1>
        <p className="text-sm text-slate-400">QA, BA, DA and custom blueprint templates for fast course creation.</p>
      </header>

      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
        <input
          className="input-base pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates"
        />
      </label>

      {filtered.length === 0 ? (
        <StatePanel title="No templates found" description="Clear search or save a course as template first." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <article key={template.id} className="surface-subtle space-y-3 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-100">{template.title}</p>
                <p className="mt-1 text-xs text-slate-400">{template.description}</p>
              </div>
              <div className="text-xs text-slate-500">
                <p>Category: {template.category}</p>
                <p>Modules: {template.blueprint.modules}</p>
                <p>Lessons per module: {template.blueprint.lessonsPerModule}</p>
                <p>Quizzes: {template.blueprint.quizzes}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <button type="button" className="btn-primary w-full gap-2" onClick={() => handleCreateFromTemplate(template.id)}>
                <Copy className="h-4 w-4" />
                Create from template
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
