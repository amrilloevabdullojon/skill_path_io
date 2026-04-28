"use client";

import Link from "next/link";
import { Activity, BarChart3, BookOpen, FileStack, Layers3, Medal, Plus, Sparkles, Users, Bot, Zap, Code2, Clock } from "lucide-react";

import { StudioKpiCard } from "@/components/admin/studio-kpi-card";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";
import type { LiveFeedItem } from "@/app/admin/dashboard/page";

type StudioDashboardProps = {
  realStats: {
    users: number;
    tracks: number;
    modules: number;
    lessons: number;
    quizzes: number;
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
  const courses = useCourseBuilderStore((state) => state.courses);

  const draftCourses = courses.filter((entity) => entity.course.status === "DRAFT").length;
  const publishedCourses = courses.filter((entity) => entity.course.status === "PUBLISHED").length;

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 text-foreground">
        <p className="kicker">Academy Studio</p>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Build, publish, and analyze course content with a visual LMS constructor.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StudioKpiCard label="Total courses" value={courses.length} helper={`${draftCourses} draft / ${publishedCourses} published`} icon={<BookOpen className="h-4 w-4" />} />
        <StudioKpiCard label="Code Tinder Swipes" value={realStats.peerReviews} helper={`${realStats.missionSubmissions} total submissions`} icon={<Layers3 className="h-4 w-4" />} />
        <StudioKpiCard label="AI Resumes Scanned" value={realStats.aiResumesScanned} helper="Using Gemini integration" icon={<FileStack className="h-4 w-4" />} />
        <StudioKpiCard label="AI Interviews" value={realStats.aiInterviews} helper="Practice sessions held" icon={<Sparkles className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/courses/new" className="btn-primary gap-2">
              <Plus className="h-4 w-4" />
              Create new course
            </Link>
            <Link href="/admin/users" className="btn-secondary gap-2">
              <Users className="h-4 w-4" />
              Manage users
            </Link>
            <Link href="/admin/analytics" className="btn-secondary gap-2">
              <BarChart3 className="h-4 w-4" />
              Platform analytics
            </Link>
          </div>
        </section>

        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Gamification & AI
          </h2>
          <div className="space-y-4 text-sm text-foreground">
            <div>
              <p className="flex items-center justify-between font-mono">
                <span className="text-muted-foreground">Code Submissions</span>
                <span className="font-bold">{realStats.missionSubmissions}</span>
              </p>
              <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 w-full" />
              </div>
            </div>
            
            <div>
              <p className="flex items-center justify-between font-mono">
                <span className="text-muted-foreground">Peer Reviews (Tinder)</span>
                <span className="font-bold text-emerald-500">{realStats.peerReviews}</span>
              </p>
              <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${Math.min(100, Math.max(5, (realStats.peerReviews / Math.max(1, realStats.missionSubmissions)) * 100))}%` }} 
                />
              </div>
            </div>
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
