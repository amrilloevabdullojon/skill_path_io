"use client";

import { useState } from "react";
import { UserPlus, MoreVertical, Search, ShieldCheck, BarChart } from "lucide-react";
import { TeamAnalyticsSnapshot } from "@/types/saas";

type TeamLearningHubProps = {
  team: TeamAnalyticsSnapshot | null;
  isLocked: boolean;
  upgradePlanId?: string;
};

export function TeamLearningHub({ team, isLocked, upgradePlanId }: TeamLearningHubProps) {
  const [filter, setFilter] = useState<"all" | "active" | "lagging">("all");

  if (isLocked || !team) {
    return (
      <section className="surface-elevated border border-border/50 bg-card space-y-4 p-6 sm:p-8 rounded-2xl">
        <p className="kicker text-emerald-400">Корпоративное Обучение (B2B)</p>
        <h1 className="page-title tracking-tight text-foreground">Командная аналитика недоступна</h1>
        <p className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 font-medium">
          Режим команды доступен только в корпоративных тарифах. Перейдите на тариф {upgradePlanId ?? "TEAM"}, чтобы открывать приглашения, раздавать доступы и отслеживать успеваемость своей команды.
        </p>
      </section>
    );
  }

  const filteredMembers = team.members.filter((m) => {
    if (filter === "all") return true;
    if (filter === "active") return m.progressPercent > 20 && m.velocity > 0;
    if (filter === "lagging") return m.progressPercent <= 20 || m.velocity === 0;
    return true;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 surface-hero border border-emerald-500/20 bg-card p-6 sm:p-8 rounded-2xl">
        <div className="space-y-2 relative z-10">
          <p className="kicker text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> B2B Дашборд
          </p>
          <h1 className="page-title tracking-tight text-foreground">{team.teamName}</h1>
          <p className="text-sm text-foreground/70 max-w-2xl">
            Назначайте треки обучения, отслеживайте прогресс сотрудников и оптимизируйте командную скорость (Velocity).
          </p>
        </div>
        <div className="relative z-10">
          <button className="btn-success-base focus-ring inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold">
            <UserPlus className="w-5 h-5" />
            Пригласить сотрудника
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Участники", value: team.members.length, desc: "Сотрудников в системе" },
          { label: "Средний прогресс", value: `${team.averageProgress}%`, desc: "Завершено треков" },
          { label: "Скорость (Velocity)", value: team.averageVelocity, desc: "XP в неделю на юзера" },
          { label: "Кластеры компетенций", value: team.skillDistribution.length, desc: "Уникальных навыков" },
        ].map((stat, idx) => (
          <article key={idx} className="surface-elevated border border-border/50 bg-card p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-emerald-500/5 blur-[40px] pointer-events-none rounded-full" />
            <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60">{stat.label}</p>
            <p className="mt-2 metric-value text-foreground tracking-tight">{stat.value}</p>
            <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">{stat.desc}</p>
          </article>
        ))}
      </div>

      <section className="surface-elevated border border-border/50 bg-card space-y-5 p-6 sm:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground inline-flex items-center gap-2">
            <BarChart className="w-5 h-5 text-emerald-400" />
            Успеваемость сотрудников
          </h2>
          
          <div className="flex items-center gap-2 bg-background/50 border border-border/50 p-1.5 rounded-full">
            <button 
              onClick={() => setFilter("all")} 
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${filter === "all" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              Все
            </button>
            <button 
              onClick={() => setFilter("active")} 
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${filter === "active" ? "bg-card text-emerald-400 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              Активные
            </button>
            <button 
              onClick={() => setFilter("lagging")} 
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${filter === "lagging" ? "bg-card text-amber-400 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              Отстающие
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-3 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            placeholder="Поиск по имени или треку..." 
            className="w-full bg-background/50 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <div className="grid gap-3">
          {filteredMembers.map((member) => {
            const isLagging = member.progressPercent <= 20 || member.velocity === 0;
            return (
              <article key={member.userId} className="relative group surface-subtle bg-card/60 border border-border-subtle hover:border-emerald-500/30 transition-all p-5 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-200">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{member.name}</p>
                      <p className="text-[11px] text-foreground/60">{member.role} • {member.assignedTrack}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] text-foreground/50 uppercase tracking-widest font-semibold mb-0.5">Лидер компетенции</p>
                      <p className="text-xs font-medium text-indigo-300">{member.strongestSkill}</p>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100 transition-opacity p-2 -mr-2">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pl-13 sm:pl-[52px]">
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className="font-semibold text-foreground/80">Прогресс по треку</span>
                    <span className="font-bold text-emerald-400">{member.progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isLagging ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width: `${member.progressPercent}%` }} 
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                      Скорость (Velocity): <span className="text-foreground/80 ml-1">{member.velocity} XP/нед</span>
                    </span>
                    {isLagging && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Теряет темп
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {filteredMembers.length === 0 && (
            <div className="text-center p-8 border border-dashed border-border/50 rounded-xl">
              <p className="text-muted-foreground">По вашему запросу сотрудников не найдено.</p>
            </div>
          )}
        </div>
      </section>

      <section className="surface-elevated border border-border/50 bg-card space-y-5 p-6 sm:p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Матрица навыков команды</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {team.skillDistribution.map((item) => (
            <article key={item.skill} className="surface-subtle bg-card/60 border border-border-subtle p-4 rounded-xl flex items-center justify-between transition-colors hover:border-emerald-500/20">
              <p className="text-sm font-bold text-foreground/90">{item.skill}</p>
              <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                {item.members} чел
              </span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
