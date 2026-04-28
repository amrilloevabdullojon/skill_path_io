"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, CircleAlert, Sparkles, Building2, MapPin, ChevronRight } from "lucide-react";
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

export function JobMatchingBoard({ jobs }: { jobs: JobMatchResult[] }) {
  const reduced = useReducedMotion();

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
      <header className="surface-elevated relative overflow-hidden space-y-3 p-6 sm:p-8 border-indigo-500/20 shadow-xl shadow-indigo-500/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
          <Briefcase className="h-4 w-4" />
          Job Matching
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">Подходящие вакансии</h1>
        <p className="text-muted-foreground/80 font-medium max-w-2xl text-lg">
          Мы подобрали роли, соответствующие вашему текущему уровню навыков и опыту в симуляциях.
        </p>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 xl:grid-cols-2"
      >
        {jobs.map((job) => {
          const isHighMatch = job.matchPercent >= 80;
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
                    <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {job.level}</span>
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
                            ? "border-border/40 bg-card/40 text-muted-foreground/50 line-through decoration-rose-500/40"
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
                <Link
                  href="/career"
                  title="Анализ пробелов в навыках"
                  className="p-2 rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors group"
                >
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </motion.article>
          )
        })}
      </motion.div>
    </section>
  );
}
