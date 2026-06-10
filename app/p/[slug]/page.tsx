import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";

function sourceLabel(source: string) {
  if (source === "mission") return "Миссия";
  if (source === "quiz") return "Квиз";
  if (source === "simulation") return "Симуляция";
  if (source === "certificate") return "Сертификат";
  if (source === "module") return "Модуль";
  return "Проект";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: resolvedParams.slug },
    include: { user: { select: { name: true } } },
  });

  if (!portfolio || !portfolio.isPublic) {
    return { title: "Портфолио не найдено" };
  }

  return {
    title: `${portfolio.user.name} — Портфолио Levio`,
    description:
      portfolio.summary ||
      `Публичное портфолио ${portfolio.user.name}: навыки, учебные проекты и практические артефакты из Levio.`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: resolvedParams.slug },
    include: {
      user: { select: { name: true } },
      projects: { where: { isPublic: true }, orderBy: { order: "asc" } },
    },
  });

  if (!portfolio || !portfolio.isPublic) {
    notFound();
  }

  const projects = portfolio.projects;
  const skills = Array.from(new Set(projects.flatMap((project) => project.skillsUsed))).slice(0, 16);
  const readiness = Math.min(100, Math.round(projects.length * 14 + skills.length * 6));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="surface-elevated space-y-6 p-5 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                <BadgeCheck className="h-4 w-4" />
                Verified by Levio
              </div>
              <h1 className="page-title leading-tight">{portfolio.user.name}</h1>
              {portfolio.headline ? (
                <p className="text-xl font-semibold text-foreground">{portfolio.headline}</p>
              ) : (
                <p className="text-xl font-semibold text-foreground">Learning portfolio</p>
              )}
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {portfolio.summary ||
                  "Профиль собран из учебных модулей, практических миссий и проверяемых артефактов Levio."}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 p-4 sm:min-w-[240px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Готовность профиля</p>
              <p className="mt-2 text-4xl font-semibold text-foreground">{readiness}%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${readiness}%` }} />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="surface-elevated space-y-4 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Навыки
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Навыки появятся после публикации проектов.</p>
              )}
            </section>

            <section className="surface-elevated space-y-3 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                Проверяемые факты
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {projects.length} опубликованных артефактов
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {skills.length} подтверждённых навыков
              </p>
            </section>
          </aside>

          <section className="surface-elevated space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Артефакты</h2>
              <p className="mt-1 text-sm text-muted-foreground">Работы, которые показывают практический уровень ученика.</p>
            </div>

            {projects.length > 0 ? (
              <div className="grid gap-3">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-lg border border-border bg-background/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {sourceLabel(project.source)} · {project.createdAt.toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.skillsUsed.map((skill) => (
                        <span key={skill} className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {project.resultSummary ? (
                      <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 text-sm leading-relaxed text-foreground">
                        <span className="font-semibold">Результат: </span>
                        {project.resultSummary}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                Автор пока не опубликовал артефакты.
              </p>
            )}
          </section>
        </section>

        <footer className="mt-8 flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Портфолио собрано в Levio на основе учебной практики.</span>
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary">
            Открыть Levio
            <ExternalLink className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
