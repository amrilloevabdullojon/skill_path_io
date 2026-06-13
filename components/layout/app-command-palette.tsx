"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
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
  const router = useRouter();
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useUiStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [runtimeTracks, setRuntimeTracks] = useState<CommandRuntimeTrack[] | null>(null);
  const [runtimeMissions, setRuntimeMissions] = useState<CommandRuntimeMission[] | null>(null);

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

  function updateQuery(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function handleClose() {
    closeCommandPalette();
    setQuery("");
    setActiveIndex(0);
  }

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

        if (active) {
          setRuntimeTracks(tracks);
          setRuntimeMissions(missions);
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
  }, [isAdmin, query, runtimeMissions, runtimeTracks]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((idx) => Math.min(idx + 1, Math.max(items.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    } else if (event.key === "Enter") {
      const target = items[activeIndex];
      if (target) {
        event.preventDefault();
        handleClose();
        router.push(target.href);
      }
    }
  }

  // Scroll active item into view on keyboard nav.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-cmd-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Modal open={isCommandPaletteOpen} onClose={handleClose} title="Поиск по платформе">
      <div className="space-y-3">
        <div className="relative">
          <Search className="select-chevron pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden />
          <Input
            autoFocus
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск треков, модулей, миссий, прогресса…"
            className="pl-9"
            aria-label="Поиск по контенту платформы"
            aria-controls="cmd-results"
            aria-activedescendant={items[activeIndex] ? `cmd-item-${items[activeIndex].id}` : undefined}
          />
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте другой запрос: QA, миссия, прогресс или портфолио."
          />
        ) : (
          <ul
            ref={listRef}
            id="cmd-results"
            role="listbox"
            aria-label="Результаты поиска"
            className="max-h-[22rem] space-y-1.5 overflow-y-auto pr-1"
          >
            {items.map((item, index) => (
              <li key={item.id} role="option" id={`cmd-item-${item.id}`} aria-selected={index === activeIndex} data-cmd-index={index}>
                <Link
                  href={item.href}
                  onClick={handleClose}
                  className={`surface-subtle block p-3 transition-colors ${
                    index === activeIndex ? "bg-card/80 ring-2 ring-indigo-400/50" : "hover:bg-card/80"
                  } ${pathname === item.href ? "border-border" : ""}`}
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
