"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CommandRuntimeJob,
  CommandRuntimeMission,
  CommandRuntimeTrack,
  getCommandItems,
} from "@/lib/navigation/command-items";
import { useUiStore } from "@/store/user/use-ui-store";

type AppCommandPaletteProps = {
  isAdmin: boolean;
};

function scoreItem(query: string, text: string) {
  if (!query) return 1;
  const normalized = text.toLowerCase();
  const q = query.toLowerCase();
  if (normalized.startsWith(q)) return 3;
  if (normalized.includes(q)) return 2;
  return 0;
}

export function AppCommandPalette({ isAdmin }: AppCommandPaletteProps) {
  const pathname = usePathname();
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useUiStore();
  const [query, setQuery] = useState("");
  const [runtimeTracks, setRuntimeTracks] = useState<CommandRuntimeTrack[] | null>(null);
  const [runtimeMissions, setRuntimeMissions] = useState<CommandRuntimeMission[] | null>(null);
  const [runtimeJobs, setRuntimeJobs] = useState<CommandRuntimeJob[] | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCommandPalette]);

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    let active = true;

    async function loadRuntimeTracks() {
      try {
        const response = await fetch("/api/command", { method: "GET" });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          tracks?: Array<{
            slug?: string;
            title?: string;
            description?: string;
            modules?: Array<{
              id?: string;
              title?: string;
              description?: string;
              order?: number;
            }>;
          }>;
          missions?: Array<{
            id?: string;
            title?: string;
            roleContext?: string;
            category?: string;
          }>;
          jobs?: Array<{
            id?: string;
            title?: string;
            level?: string;
            location?: string;
            roleTrack?: string;
          }>;
        };
        const tracks = Array.isArray(payload.tracks)
          ? payload.tracks
          .map((course) => ({
            slug: course.slug ?? "",
            title: course.title ?? "",
            description: course.description ?? "",
            modules: Array.isArray(course.modules)
              ? course.modules.map((moduleItem) => ({
                  id: moduleItem.id ?? "",
                  title: moduleItem.title ?? "",
                  description: moduleItem.description ?? "",
                  order: typeof moduleItem.order === "number" ? moduleItem.order : 0,
                }))
              : [],
          }))
          .filter((course) => course.slug && course.title)
          : [];

        const missions = Array.isArray(payload.missions)
          ? payload.missions
            .map((mission) => ({
              id: mission.id ?? "",
              title: mission.title ?? "",
              roleContext: mission.roleContext ?? "",
              category: mission.category ?? "QA",
            }))
            .filter((mission) => mission.id && mission.title)
          : [];

        const jobs = Array.isArray(payload.jobs)
          ? payload.jobs
            .map((job) => ({
              id: job.id ?? "",
              title: job.title ?? "",
              level: job.level ?? "Junior",
              location: job.location ?? "Remote",
              roleTrack: job.roleTrack ?? "QA",
            }))
            .filter((job) => job.id && job.title)
          : [];

        if (active) {
          setRuntimeTracks(tracks);
          setRuntimeMissions(missions);
          setRuntimeJobs(jobs);
        }
      } catch {
        // Keep page/action items when runtime API is not available.
      }
    }

    void loadRuntimeTracks();
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    const source = getCommandItems({
      runtimeTracks: runtimeTracks ?? undefined,
      runtimeMissions: runtimeMissions ?? undefined,
      runtimeJobs: runtimeJobs ?? undefined,
    }).filter((item) => (item.adminOnly ? isAdmin : true));
    if (!query.trim()) {
      return source.slice(0, 14);
    }

    const ranked = source
      .map((item) => {
        const searchable = [item.title, item.subtitle, ...item.keywords].filter(Boolean).join(" ");
        return {
          item,
          score: scoreItem(query, searchable),
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return ranked.map((entry) => entry.item).slice(0, 18);
  }, [isAdmin, query, runtimeJobs, runtimeMissions, runtimeTracks]);

  return (
    <Modal open={isCommandPaletteOpen} onClose={closeCommandPalette} title="Command palette">
      <div className="space-y-3">
        <div className="relative">
          <Search className="select-chevron pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, modules, lessons, missions, jobs..."
            className="pl-9"
            aria-label="Search platform content"
          />
        </div>

        <p className="text-xs text-muted-foreground">Shortcut: Cmd/Ctrl + K</p>

        {items.length === 0 ? (
          <EmptyState
            title="No results"
            description="Try another keyword, for example: QA, mission, planner, SQL."
          />
        ) : (
          <ul className="max-h-[22rem] space-y-1.5 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={closeCommandPalette}
                  className={`surface-subtle block p-3 transition-colors hover:bg-card/80 ${
                    pathname === item.href ? "border-border" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="chip-neutral px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      {item.type}
                    </span>
                  </div>
                  {item.subtitle ? <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
