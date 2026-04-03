import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, Clock3, Minus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { updateModuleDetailAction } from "@/app/admin/actions";
import { DuplicateModuleButton } from "@/components/admin/modules/duplicate-module-button";
import { SubmitModuleButton } from "@/components/admin/modules/submit-module-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getModuleDetail } from "@/lib/admin/modules/queries";

export const metadata: Metadata = {
  title: "Edit Module — Admin",
  robots: { index: false },
};

type Props = { params: { id: string } };

export default async function ModuleDetailPage({ params }: Props) {
  await requireAdminPermission("courses.write");
  const t = await getTranslations("admin.modules");

  const mod = await getModuleDetail(params.id);

  if (!mod) notFound();

  return (
    <section className="page-shell">
      <PageHeader
        kicker={t("shared.kicker")}
        title={mod.title}
        description={t("detail.description", {
          track: mod.track.title,
          lessons: mod._count.lessons,
          duration: mod.duration,
        })}
        actionLabel={t("shared.backToModules")}
        actionHref="/admin/modules"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* ── Edit form ─────────────────────────────────────────── */}
        <section className="surface-elevated space-y-5 p-5 sm:p-7">
          <h2 className="section-title">{t("detail.editMetadata")}</h2>

          <form action={updateModuleDetailAction} className="space-y-5">
            <input type="hidden" name="moduleId" value={mod.id} />

            {/* Track (read-only) */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">{t("shared.track")}</p>
              <p className="text-sm text-foreground">{mod.track.title}</p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="mod-title" className="text-sm font-medium text-foreground">
                {t("shared.title")} <span className="text-rose-400">*</span>
              </label>
              <input
                id="mod-title"
                name="title"
                type="text"
                required
                maxLength={200}
                defaultValue={mod.title}
                className="input-base w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="mod-desc" className="text-sm font-medium text-foreground">
                {t("shared.description")}
              </label>
              <textarea
                id="mod-desc"
                name="description"
                rows={4}
                maxLength={1000}
                defaultValue={mod.description ?? ""}
                placeholder={t("shared.descriptionPlaceholder")}
                className="input-base w-full resize-none py-2"
              />
            </div>

            {/* Order + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="mod-order" className="text-sm font-medium text-foreground">
                  {t("shared.order")} <span className="text-rose-400">*</span>
                </label>
                <input
                  id="mod-order"
                  name="order"
                  type="number"
                  required
                  min={1}
                  max={999}
                  defaultValue={mod.order}
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mod-duration" className="text-sm font-medium text-foreground">
                  {t("shared.durationMinutes")} <span className="text-rose-400">*</span>
                </label>
                <input
                  id="mod-duration"
                  name="duration"
                  type="number"
                  required
                  min={1}
                  max={600}
                  defaultValue={mod.duration}
                  className="input-base w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <SubmitModuleButton label={t("detail.saveChanges")} pendingLabel={t("detail.savingChanges")} />
              <Link href="/admin/modules" className="btn-secondary">
                {t("shared.cancel")}
              </Link>
              <span className="ml-auto">
                <DuplicateModuleButton moduleId={mod.id} />
              </span>
            </div>
          </form>
        </section>

        {/* ── Side info ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Stats */}
          <section className="surface-elevated space-y-3 p-5">
            <h2 className="section-title">{t("detail.stats")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="surface-subtle space-y-0.5 p-3">
                <p className="text-xs text-muted-foreground">{t("shared.lessons")}</p>
                <p className="text-xl font-semibold text-foreground">{mod._count.lessons}</p>
              </div>
              <div className="surface-subtle space-y-0.5 p-3">
                <p className="text-xs text-muted-foreground">{t("detail.completions")}</p>
                <p className="text-xl font-semibold text-foreground">{mod._count.userProgresses}</p>
              </div>
              <div className="surface-subtle space-y-0.5 p-3">
                <p className="text-xs text-muted-foreground">{t("shared.durationMinutes")}</p>
                <p className="flex items-center gap-1 text-xl font-semibold text-foreground">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  {mod.duration} {t("shared.durationShort")}
                </p>
              </div>
              <div className="surface-subtle space-y-0.5 p-3">
                <p className="text-xs text-muted-foreground">{t("shared.quiz")}</p>
                <p className="text-sm font-semibold text-foreground">
                  {mod.quiz ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("detail.passScore", { score: mod.quiz.passingScore })}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Minus className="h-4 w-4" />
                      {t("shared.none")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Lessons list */}
          <section className="surface-elevated space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="section-title">
                {t("shared.lessons")}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({mod._count.lessons})
                </span>
              </h2>
              <Link
                href="/admin/lessons"
                className="text-xs text-sky-300 hover:underline"
              >
                {t("detail.manageAll")}
              </Link>
            </div>

            {mod.lessons.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t("detail.noLessons")}</p>
                <Link
                  href="/admin/lessons"
                  className="btn-secondary inline-flex w-full justify-center text-xs"
                >
                  {t("detail.addLessons")}
                </Link>
              </div>
            ) : (
              <>
                <ol className="space-y-1.5">
                  {mod.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-border/80 hover:bg-card/60"
                    >
                      <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {lesson.order}.
                      </span>
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-foreground">{lesson.title}</span>
                      <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {lesson.type}
                      </span>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/admin/lessons"
                  className="btn-secondary inline-flex w-full justify-center text-xs"
                >
                  {t("detail.addOrEditLessons")}
                </Link>
              </>
            )}
          </section>

          {/* Preview link */}
          <section className="surface-elevated p-5">
            <h2 className="section-title mb-3">{t("detail.studentView")}</h2>
            <Link
              href={`/tracks/${mod.track.slug}/modules/${mod.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex w-full justify-center gap-2"
            >
              {t("detail.openModulePage")}
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
}
