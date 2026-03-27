import type { Metadata } from "next";

import { createTemplateAction } from "@/app/admin/actions";
import { DeleteTemplateButton } from "@/components/admin/templates/delete-template-button";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Templates — Admin",
  robots: { index: false },
};

export default async function AdminTemplatesPage() {
  await requireAdminPermission("templates.manage");

  const templates = await prisma.courseTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sourceCourse: { select: { id: true, title: true } },
    },
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Course Templates"
        description="Reusable blueprints for quickly spinning up new courses."
      />

      {/* ── New template form ──────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          New template
        </h2>
        <form action={createTemplateAction} className="grid gap-3 md:grid-cols-[1fr_1fr_200px_auto]">
          <input
            name="title"
            required
            placeholder="Template title…"
            className="input-base"
          />
          <input
            name="description"
            required
            placeholder="Short description…"
            className="input-base"
          />
          <input
            name="category"
            required
            placeholder="Category (e.g. QA, BA)"
            className="input-base"
          />
          <SubmitModuleButton label="Create template" />
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {templates.length} template{templates.length !== 1 ? "s" : ""}
        </p>

        {templates.length === 0 ? (
          <EmptyState
            title="No templates found"
            description="No course templates have been created yet."
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[800px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Category</th>
                  <th className="px-3 py-3 text-left">Source Course</th>
                  <th className="px-3 py-3 text-left">Tags</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => {
                  const tags = Array.isArray(tpl.tags) ? (tpl.tags as string[]) : [];
                  const visibleTags = tags.slice(0, 3);
                  const extraCount = tags.length - visibleTags.length;

                  return (
                    <tr key={tpl.id} className="table-row">
                      <td className="px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{tpl.title}</p>
                        <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                          {tpl.description}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {tpl.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {tpl.sourceCourse ? tpl.sourceCourse.title : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {visibleTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {extraCount > 0 && (
                              <span className="inline-flex rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                +{extraCount} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {tpl.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        <DeleteTemplateButton
                          templateId={tpl.id}
                          templateTitle={tpl.title}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
