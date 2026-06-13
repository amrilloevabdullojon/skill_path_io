"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  FileQuestion,
  FileStack,
  Layers3,
  ListChecks,
  Medal,
  Plus,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { StudioKpiCard } from "@/components/admin/studio-kpi-card";
import type { LiveFeedItem } from "@/app/admin/dashboard/page";

type StudioDashboardProps = {
  realStats: {
    users: number;
    tracks: number;
    publishedTracks: number;
    draftTracks: number;
    modules: number;
    modulesWithoutLessons: number;
    modulesWithoutQuiz: number;
    lessons: number;
    quizzes: number;
    quizzesWithoutQuestions: number;
    certificates: number;
    missionSubmissions: number;
    peerReviews: number;
    aiResumesScanned: number;
    aiInterviews: number;
  };
  liveFeed: LiveFeedItem[];
};

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function StudioDashboard({ realStats, liveFeed = [] }: StudioDashboardProps) {
  const contentIssues = realStats.modulesWithoutLessons + realStats.modulesWithoutQuiz + realStats.quizzesWithoutQuestions;
  const readyScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (realStats.publishedTracks / Math.max(1, realStats.tracks)) * 55 +
          (1 - contentIssues / Math.max(1, realStats.modules + realStats.quizzes)) * 45,
      ),
    ),
  );

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 text-foreground">
        <p className="kicker">Content Studio</p>
        <h1 className="text-2xl font-semibold">Publishing cockpit</h1>
        <p className="text-sm text-muted-foreground">
          Create tracks, fill modules, check quizzes, and publish only when the learner path is complete.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StudioKpiCard label="Publishing readiness" value={`${readyScore}%`} helper={`${contentIssues} content gaps`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StudioKpiCard label="Tracks" value={realStats.tracks} helper={`${realStats.publishedTracks} published / ${realStats.draftTracks} draft`} icon={<BookOpen className="h-4 w-4" />} />
        <StudioKpiCard label="Modules" value={realStats.modules} helper={`${realStats.modulesWithoutLessons} without lessons`} icon={<Layers3 className="h-4 w-4" />} />
        <StudioKpiCard label="Quizzes" value={realStats.quizzes} helper={`${realStats.quizzesWithoutQuestions} without questions`} icon={<FileQuestion className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground">Content workflow</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/tracks/new" className="btn-primary gap-2">
              <Plus className="h-4 w-4" />
              New track
            </Link>
            <Link href="/admin/modules/new" className="btn-secondary gap-2">
              <Layers3 className="h-4 w-4" />
              Add module
            </Link>
            <Link href="/admin/lessons/new" className="btn-secondary gap-2">
              <FileStack className="h-4 w-4" />
              Add lesson
            </Link>
            <Link href="/admin/quizzes/new" className="btn-secondary gap-2">
              <FileQuestion className="h-4 w-4" />
              Add quiz
            </Link>
            <Link href="/admin/tracks?status=DRAFT" className="btn-secondary gap-2">
              <ListChecks className="h-4 w-4" />
              Review drafts
            </Link>
            <Link href="/admin/analytics" className="btn-secondary gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </div>
        </section>

        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Content gaps
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <GapRow href="/admin/modules" label="Modules without lessons" value={realStats.modulesWithoutLessons} />
            <GapRow href="/admin/modules" label="Modules without quiz" value={realStats.modulesWithoutQuiz} />
            <GapRow href="/admin/quizzes" label="Quizzes without questions" value={realStats.quizzesWithoutQuestions} />
          </div>
        </section>

        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground">Platform stats</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />Users</span><span>{realStats.users}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" />Tracks</span><span>{realStats.tracks}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4 text-muted-foreground" />Modules</span><span>{realStats.modules}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><FileStack className="h-4 w-4 text-muted-foreground" />Lessons</span><span>{realStats.lessons}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" />Quizzes</span><span>{realStats.quizzes}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Medal className="h-4 w-4 text-muted-foreground" />Certificates</span><span>{realStats.certificates}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Code2 className="h-4 w-4 text-muted-foreground" />Mission submissions</span><span>{realStats.missionSubmissions}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-muted-foreground" />Peer reviews</span><span>{realStats.peerReviews}</span></p>
          </div>
        </section>
      </div>

      <section className="surface-elevated space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-foreground">Live Telemetry Feed</h2>
          <span className="relative flex h-2 w-2 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>
        
        {liveFeed.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 border border-dashed border-border rounded-xl text-center">No recent activity detected.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {liveFeed.map((item) => {
              const Icon = item.type.startsWith("AI_") ? Bot : (item.type === "CODE_TINDER" ? Zap : Code2);
              const colorClass = item.type === "AI_RESUME" ? "text-violet-500 bg-violet-500/10 border-violet-500/20" : 
                                 item.type === "AI_INTERVIEW" ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" :
                                 item.type === "CODE_TINDER" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                                 "text-amber-500 bg-amber-500/10 border-amber-500/20";
              
              return (
                <article key={item.id} className="surface-subtle p-3 flex flex-col gap-2 rounded-xl transition-all hover:bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-1.5 rounded-md border ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function GapRow({ href, label, value }: { href: string; label: string; value: number }) {
  const ok = value === 0;

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-3 py-2 transition hover:border-primary/40"
    >
      <span className="inline-flex items-center gap-2">
        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
        {label}
      </span>
      <span className={ok ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>{value}</span>
    </Link>
  );
}
