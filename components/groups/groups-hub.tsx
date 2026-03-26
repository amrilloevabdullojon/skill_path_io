"use client";

import { useMemo, useState } from "react";
import { UsersRound } from "lucide-react";

import { StudyGroup } from "@/types/personalization";

export function GroupsHub({ groups }: { groups: StudyGroup[] }) {
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  const joinedCount = useMemo(() => joinedIds.length, [joinedIds]);

  function toggleJoin(id: string) {
    setJoinedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Groups</p>
        <h1 className="page-title">Study groups and collaboration</h1>
        <p className="section-description">Join groups by topic, discuss modules, and run peer learning sessions.</p>
      </header>

      <p className="text-xs text-muted-foreground">Joined groups: {joinedCount}</p>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const joined = joinedIds.includes(group.id);
          return (
            <article key={group.id} className="surface-elevated space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.topic}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleJoin(group.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                    joined
                      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {joined ? "Joined" : "Join"}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <UsersRound className="h-3.5 w-3.5" />
                {group.members + (joined ? 1 : 0)} members | {group.mode}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
