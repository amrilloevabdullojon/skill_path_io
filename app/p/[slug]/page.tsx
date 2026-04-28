import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, BadgeCheck, Zap } from "lucide-react";

import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: params.slug },
    include: { user: { select: { name: true } } },
  });

  if (!portfolio || !portfolio.isPublic) {
    return { title: "Портфолио не найдено" };
  }

  return {
    title: `${portfolio.user.name} — Публичное Портфолио`,
    description: portfolio.summary || `Посмотрите верифицированное портфолио ${portfolio.user.name}, собранное на базе реальных задач из Levio.`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: { slug: string };
}) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { publicSlug: params.slug },
    include: {
      user: { select: { name: true } },
      projects: { orderBy: { order: "asc" } },
    },
  });

  if (!portfolio || !portfolio.isPublic) {
    notFound();
  }

  const projects = portfolio.projects;
  
  // Aggregate unique skills
  const allSkills = Array.from(new Set(projects.flatMap(p => p.skillsUsed)));

  return (
    <div className="relative min-h-screen bg-background selection:bg-sky-500/30">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        
        {/* Header Profile Section */}
        <header className="mb-12 space-y-5">
          <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full w-fit text-sky-400">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider uppercase">Верифицировано в Levio</span>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl tracking-tight">
            {portfolio.user.name}
          </h1>
          {portfolio.headline && (
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              {portfolio.headline}
            </p>
          )}
          {portfolio.summary && (
            <div className="max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground mt-4 border-l-2 border-border pl-4">
              {portfolio.summary}
            </div>
          )}
        </header>

        {/* Aggregate Skills */}
        {allSkills.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Ключевые компетенции
            </h2>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => (
                <span key={skill} className="rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects List Timeline */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/80 before:to-transparent">
          {projects.map((project, index) => (
            <article key={project.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              
              {/* Timeline marker */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-slate-800 text-sky-400 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-slate-700">
                {projects.length - index}
              </div>
              
              {/* Project Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-lg hover:border-sky-400/30">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-foreground leading-snug">{project.title}</h3>
                    <time className="text-xs font-mono font-medium text-muted-foreground shrink-0 uppercase whitespace-nowrap px-2 py-1 bg-muted/30 rounded-md">
                      {project.createdAt.toLocaleDateString("ru-RU", { month: "short", year: "numeric" }).replace('.', '')}
                    </time>
                  </div>
                  
                  <div className="inline-flex w-fit items-center rounded-lg border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    {project.source === 'MISSION' ? 'Сюжетная миссия' : 'Учебный проект'}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.skillsUsed.map(skill => (
                      <span key={skill} className="rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {project.resultSummary && (
                    <div className="mt-2 p-3 sm:p-4 rounded-xl bg-background/80 border border-border/60 text-sm text-foreground/90 leading-relaxed shadow-inner">
                      <span className="font-bold text-foreground mr-2">Результат:</span>
                      {project.resultSummary}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Global CTA */}
        <section className="mt-24 relative overflow-hidden border border-sky-400/20 bg-card p-6 sm:p-10 rounded-3xl flex flex-col items-center text-center gap-6 shadow-xl shadow-sky-900/10">
          <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="space-y-3 z-10 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center justify-center gap-3">
              Хотите такое же портфолио? <Sparkles className="h-6 w-6 text-sky-400" />
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Levio предлагает реалистичные симуляции и карьерные треки под руководством ИИ, которые автоматически формируют ваше профессиональное портфолио прямо в процессе обучения.
            </p>
          </div>
          <Link href="/" className="btn-primary z-10 px-8 py-4 text-base font-bold shadow-lg shadow-sky-500/25">
            Присоединиться бесплатно
          </Link>
        </section>
        
      </div>
    </div>
  );
}
