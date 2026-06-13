"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Filter,
  MapPin,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { JobMatchResult } from "@/types/personalization";

function matchTone(percent: number) {
  if (percent >= 80) return "border-emerald-400/35 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
  if (percent >= 60) return "border-amber-400/35 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
  return "border-rose-400/35 bg-rose-500/10 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
}

function matchGlow(percent: number) {
  if (percent >= 80) return "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20";
  if (percent >= 60) return "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20";
  return "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20";
}

type JobFilter = "all" | "ready" | "almost" | "gap";

const filterOptions: Array<{ label: string; value: JobFilter }> = [
  { label: "Все", value: "all" },
  { label: "Можно откликаться", value: "ready" },
  { label: "Почти готов", value: "almost" },
  { label: "Есть пробелы", value: "gap" },
];

function getFilterBucket(percent: number): Exclude<JobFilter, "all"> {
  if (percent >= 80) return "ready";
  if (percent >= 60) return "almost";
  return "gap";
}

export function JobMatchingBoard({ jobs }: { jobs: JobMatchResult[] }) {
  const reduced = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<JobFilter>("all");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesFilter = activeFilter === "all" || getFilterBucket(job.matchPercent) === activeFilter;
        const matchesQuery = normalizedQuery
          ? `${job.title} ${job.level} ${job.location} ${job.description} ${job.requiredSkills.join(" ")}`.toLowerCase().includes(normalizedQuery)
          : true;
        return matchesFilter && matchesQuery;
      }),
    [activeFilter, jobs, normalizedQuery],
  );
  const readyCount = jobs.filter((job) => job.matchPercent >= 80).length;
  const almostCount = jobs.filter((job) => job.matchPercent >= 60 && job.matchPercent < 80).length;
  const gapCount = jobs.filter((job) => job.matchPercent < 60).length;

  const containerVariants: Variants = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: reduced ? 0 : 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: reduced ? {} : { opacity: 0, y: 20 },
    show: reduced ? {} : { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <section className="space-y-6">
      <header className="surface-elevated space-y-5 p-6 sm:p-8 border-indigo-500/20">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest">
              <Briefcase className="h-4 w-4" />
              Job Matching
            </div>
            <h1 className="page-title text-foreground">Вакансии и готовность к отклику</h1>
            <p className="text-muted-foreground/80 font-medium max-w-2xl text-lg">
              Смотрите не только процент совпадения, но и что приложить к отклику: портфолио, интервью-ответы и пробелы, которые лучше закрыть до отправки.
            </p>
          </div>
          <Link href="/portfolio" className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg">
            <ClipboardCheck className="h-4 w-4" />
            Подготовить портфолио
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Можно откликаться</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{readyCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Почти готов</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{almostCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Нужно усилить</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{gapCount}</p>
          </div>
          <Link href="/interview" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Перед откликом</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Пройти интервью
              <MessageSquareText className="h-4 w-4" />
            </p>
          </Link>
        </div>
      </header>

      <section className="surface-elevated grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
        <label htmlFor="job-search" className="relative">
          <span className="sr-only">Поиск по вакансиям</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="job-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-base pl-9"
            placeholder="Найти по роли, навыку или локации"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                activeFilter === option.value
                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                  : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 xl:grid-cols-2"
      >
        {filteredJobs.map((job) => {
          const isHighMatch = job.matchPercent >= 80;
          const isAlmostReady = job.matchPercent >= 60 && job.matchPercent < 80;
          return (
            <motion.article 
              variants={itemVariants}
              key={job.id} 
              className={`relative overflow-hidden flex flex-col justify-between surface-elevated space-y-5 p-6 sm:p-7 border transition-all duration-300 ${matchGlow(job.matchPercent)}`}
            >
              {isHighMatch && (
                 <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
              )}
              
              <div className="flex items-start justify-between gap-4 z-10">
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground leading-tight">{job.title}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" /> {job.level}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                  </div>
                </div>
                <div className={`flex flex-col items-center justify-center rounded-2xl border px-4 py-2 ${matchTone(job.matchPercent)}`}>
                  <span className="text-[10px] uppercase tracking-widest font-black opacity-80 mb-0.5">Совпадение</span>
                  <span className="text-2xl font-black">{job.matchPercent}%</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed z-10">
                {job.description}
              </p>

              <div className="z-10">
                <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/80 mb-3">Требуемые навыки</p>
                <div className="flex flex-wrap gap-2.5">
                  {job.requiredSkills.map((skill) => {
                    const isMissing = job.missingRequirements.includes(skill);
                    return (
                      <span 
                        key={skill} 
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                          isMissing
                            ? "border-border-subtle bg-card/40 text-muted-foreground/50 line-through decoration-rose-500/40"
                            : "border-indigo-400/30 bg-indigo-500/10 text-indigo-300"
                        }`}
                      >
                        {skill}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="my-2 z-10">
                {job.missingRequirements.length > 0 ? (
                  <div className="rounded-2xl p-4 border border-rose-500/20 bg-rose-500/5">
                    <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-rose-400 mb-3">
                      <CircleAlert className="h-4 w-4" />
                      Недостающие требования
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium text-rose-200/80">
                      {job.missingRequirements.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                           {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-emerald-300">
                      Все ключевые навыки покрыты.<br/>
                      <span className="text-emerald-400/70 font-medium text-xs">Вы идеальный кандидат!</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 z-10 border-t border-border/30 flex items-center justify-between">
                <p className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold ${
                   job.matchPercent >= 80 
                     ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" 
                     : "border-indigo-400/30 bg-indigo-500/10 text-indigo-300"
                }`}>
                  <Sparkles className="h-4 w-4" />
                  {job.recommendation}
                </p>
              </div>

              <div className="z-10 grid gap-2 border-t border-border/30 pt-4 sm:grid-cols-3">
                <Link href="/portfolio" className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg">
                  <ClipboardCheck className="h-4 w-4" />
                  Артефакты
                </Link>
                <Link href={isHighMatch ? "/interview" : "/review"} className="btn-secondary inline-flex items-center justify-center gap-2 rounded-lg">
                  {isHighMatch ? <MessageSquareText className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  {isHighMatch ? "Репетиция" : "Закрыть gap"}
                </Link>
                <Link href={isHighMatch || isAlmostReady ? "/career" : "/missions"} className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg">
                  {isHighMatch ? "План отклика" : isAlmostReady ? "План усиления" : "В практику"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </motion.article>
          )
        })}
        {filteredJobs.length === 0 ? (
          <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            По этому фильтру вакансий нет. Сбросьте поиск или вернитесь к карьерному плану.
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
