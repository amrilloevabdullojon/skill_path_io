"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Sparkles, ShieldAlert, FileSearch,
  Send, GraduationCap, Activity, ShieldCheck,
  CheckCircle2, AlertCircle, BriefcaseBusiness
} from "lucide-react";

import { CandidateProfile, JobMatch, MarketplaceRole } from "@/types/saas";
import { cn } from "@/lib/utils";

type HiringMarketplaceHubProps = {
  roles: MarketplaceRole[];
  candidates: CandidateProfile[];
  topMatches: JobMatch[];
  isLocked: boolean;
  upgradePlanId?: string;
};

type TabId = "matches" | "roles" | "talent";

function CircularProgress({ progress }: { progress: number }) {
  const radius = 24;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClass = progress >= 90 ? "text-emerald-500" : progress >= 75 ? "text-amber-500" : "text-indigo-500";
  const bgClass = progress >= 90 ? "text-emerald-500/20" : progress >= 75 ? "text-amber-500/20" : "text-indigo-500/20";

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={bgClass}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={colorClass}
        />
      </svg>
      <span className={cn("absolute text-[11px] font-black", colorClass)}>{progress}</span>
    </div>
  );
}

export function HiringMarketplaceHub({
  roles,
  candidates,
  topMatches,
  isLocked,
  upgradePlanId,
}: HiringMarketplaceHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>("matches");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "matches", label: "My Matches", icon: Sparkles },
    { id: "roles", label: "All Roles", icon: BriefcaseBusiness },
    { id: "talent", label: "Talent Pool", icon: GraduationCap },
  ];

  async function apply(roleId: string) {
    setIsApplying(roleId);
    setStatusText(null);

    try {
      const response = await fetch("/api/marketplace/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roleId, portfolioUrl: "/portfolio" }),
      });
      const data = (await response.json()) as { error?: string; application?: { id: string } };
      if (!response.ok || !data.application) {
        throw new Error(data.error || "Could not submit application.");
      }
      setStatusText(`Success! Application ID: ${data.application.id}`);
      setTimeout(() => setStatusText(null), 5000);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Application failed.");
    } finally {
      setIsApplying(null);
    }
  }

  // Generate a reliable pseudo-random gradient based on strings (for companies/users without logos)
  function getGradient(seed: string) {
    const colors = [
      "from-orange-500 to-rose-500", "from-indigo-400 to-indigo-500", "from-teal-400 to-emerald-500",
      "from-violet-500 to-fuchsia-500", "from-amber-400 to-orange-500"
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="space-y-6 relative max-w-6xl mx-auto">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10 shadow-sm isolation-auto">
        <div className="absolute -left-20 -top-20 z-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 z-0 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Exclusive Network
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Marketplace Hub
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Connect with top companies hiring for QA, BA, and Data roles. 
              Our AI engine matches your Readiness Score with verified job requirements.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative">
        {/* Anti-pattern overlay for locked state */}
        {isLocked && (
          <div className="absolute inset-x-0 bottom-0 top-16 z-50 flex flex-col items-center justify-center rounded-3xl border border-amber-500/20 bg-background/60 backdrop-blur-md">
            <div className="flex max-w-md flex-col items-center gap-4 text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <ShieldAlert className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Marketplace is Locked</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock direct applications to top tech companies, AI-powered job matching, and premium readiness analytics by upgrading your plan.
              </p>
              <button className="btn-primary mt-2">
                Upgrade to {upgradePlanId ?? "Career Accelerator"}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b pb-4 mb-6 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors outline-none",
                  isActive ? "text-indigo-600 dark:text-indigo-300" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="marketplace-tab"
                    className="absolute inset-0 z-[-1] rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Status Toast */}
        <AnimatePresence>
          {statusText && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2 font-medium"
            >
              <CheckCircle2 className="h-4 w-4" />
              {statusText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn("min-h-[400px]", isLocked && "pointer-events-none select-none opacity-40")}
          >
            {/* MATCHES TAB */}
            {activeTab === "matches" && (
              <div className="grid gap-4 xl:grid-cols-2">
                {topMatches.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center">
                    <FileSearch className="w-10 h-10 mb-3 opacity-20" />
                    No automated matches yet. Improve your Readiness Score!
                  </div>
                ) : (
                  topMatches.map((match) => (
                    <article key={match.roleId} className="group relative rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />
                      
                      <div className="flex items-start justify-between gap-4 relative z-10">
                        <div className="flex gap-4">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-inner", getGradient(match.company))}>
                            {match.company.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{match.title}</h3>
                            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mt-1">
                              <Building2 className="h-3.5 w-3.5" /> {match.company}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <CircularProgress progress={match.matchPercent} />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 border-t pt-4">
                        {match.missingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Missing Requirements
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {match.missingSkills.map((skill) => (
                                <span key={skill} className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-border/40">
                          <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Evidence Signals
                          </p>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {match.evidenceSignals.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="mt-1 w-1 h-1 shrink-0 rounded-full bg-emerald-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <button onClick={() => apply(match.roleId)} disabled={isApplying === match.roleId} className="w-full mt-4 btn-primary justify-center bg-indigo-600 hover:bg-indigo-700 text-white border-transparent">
                        {isApplying === match.roleId ? "Submitting..." : "Apply with Profile"} <Send className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === "roles" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                  <article key={role.id} className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-500/30">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white text-sm", getGradient(role.company))}>
                        {role.company.charAt(0)}
                      </div>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border">
                        Min score: {role.minReadinessScore}
                      </span>
                    </div>

                    <h3 className="text-base font-bold leading-tight text-foreground">{role.title}</h3>
                    
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground font-medium">
                      <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{role.company}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{role.location}</p>
                    </div>

                    <div className="mt-4 mb-4 flex flex-wrap gap-1.5 flex-1 content-start">
                      {role.requiredSkills.slice(0,4).map((skill) => (
                        <span key={skill} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground border">
                          {skill}
                        </span>
                      ))}
                      {role.requiredSkills.length > 4 && (
                        <span className="text-[10px] text-muted-foreground py-0.5 px-1 font-medium">+{role.requiredSkills.length - 4} more</span>
                      )}
                    </div>

                    <button onClick={() => apply(role.id)} disabled={isApplying === role.id} className="w-full btn-secondary justify-center text-xs border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                      {isApplying === role.id ? "Sending..." : "Quick Apply"}
                    </button>
                  </article>
                ))}
              </div>
            )}

            {/* TALENT TAB */}
            {activeTab === "talent" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                  <article key={candidate.userId} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <GraduationCap className="w-16 h-16" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-inner border font-bold text-lg text-slate-500 uppercase">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{candidate.name}</h3>
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">@{candidate.publicHandle}</p>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Activity className="w-3.5 h-3.5"/> Readiness</span>
                      <span className="text-sm font-black text-foreground">{candidate.readinessScore} / 100</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">Top Badges</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.badges.slice(0,3).map((badge) => (
                            <span key={badge} className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[120px]">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {candidate.portfolioHighlights.length > 0 && (
                        <div>
                           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">Highlights</p>
                           <ul className="text-xs font-medium text-slate-600 dark:text-slate-300 space-y-1">
                             {candidate.portfolioHighlights.slice(0, 2).map((hl, i) => (
                               <li key={i} className="truncate">• {hl}</li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
