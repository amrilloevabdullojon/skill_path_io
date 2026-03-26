"use client";

import { useEffect, useMemo, useState } from "react";
import { MessagesSquare, Users } from "lucide-react";

import { peerReviewQueueSeed, studyGroupsSeed, StudyGroup } from "@/features/community/study-groups";

type LocalGroupState = StudyGroup & {
  joined: boolean;
};

const STORAGE_KEY = "skillpath:study-groups";

export function StudyGroupsPanel() {
  const [groups, setGroups] = useState<LocalGroupState[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTopic, setNewGroupTopic] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setGroups(studyGroupsSeed.map((group) => ({ ...group, joined: false })));
      return;
    }

    try {
      const parsed = JSON.parse(raw) as LocalGroupState[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setGroups(parsed);
      } else {
        setGroups(studyGroupsSeed.map((group) => ({ ...group, joined: false })));
      }
    } catch {
      setGroups(studyGroupsSeed.map((group) => ({ ...group, joined: false })));
    }
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups]);

  const joinedCount = useMemo(() => groups.filter((group) => group.joined).length, [groups]);

  function toggleJoin(id: string) {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id
          ? {
              ...group,
              joined: !group.joined,
              membersCount: group.membersCount + (group.joined ? -1 : 1),
            }
          : group,
      ),
    );
  }

  function createGroup() {
    if (!newGroupName.trim() || !newGroupTopic.trim()) {
      return;
    }

    const created: LocalGroupState = {
      id: `local-${Date.now()}`,
      title: newGroupName.trim(),
      topic: newGroupTopic.trim(),
      description: "Custom local study group created in demo mode.",
      membersCount: 1,
      joined: true,
    };

    setGroups((prev) => [created, ...prev]);
    setNewGroupName("");
    setNewGroupTopic("");
  }

  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="space-y-2">
        <p className="kicker">Community</p>
        <h1 className="text-2xl font-semibold text-foreground">Study groups and peer review</h1>
        <p className="text-sm text-muted-foreground">
          Create a group, join discussions, and review assignments from peers.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value)}
          className="input-base"
          placeholder="Group name"
        />
        <input
          value={newGroupTopic}
          onChange={(event) => setNewGroupTopic(event.target.value)}
          className="input-base"
          placeholder="Group topic"
        />
        <button type="button" onClick={createGroup} className="btn-primary">
          Create group
        </button>
      </div>

      <p className="text-xs text-muted-foreground">Joined groups: {joinedCount}</p>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {groups.map((group) => (
            <article key={group.id} className="surface-subtle p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{group.title}</p>
                  <p className="text-xs text-muted-foreground">{group.topic}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleJoin(group.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                    group.joined
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-border bg-card/85 text-muted-foreground hover:border-border/70"
                  }`}
                >
                  {group.joined ? "Joined" : "Join"}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{group.description}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                {group.membersCount} members
              </p>
            </article>
          ))}
        </div>

        <aside className="surface-subtle space-y-3 p-4">
          <h2 className="text-sm font-semibold text-foreground">Peer review queue</h2>
          {peerReviewQueueSeed.map((task) => (
            <div key={task.id} className="content-card p-3">
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {task.track} | {task.type}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <MessagesSquare className="h-4 w-4" />
                {task.author} - {task.submittedAt}
              </p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
