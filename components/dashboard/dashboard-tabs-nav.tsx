import Link from "next/link";

import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "skills" | "career";

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "career", label: "Career" },
];

export function DashboardTabsNav({ currentTab }: { currentTab: DashboardTab }) {
  return (
    <nav className="dash-tab-nav flex flex-wrap gap-1 p-1.5" aria-label="Dashboard tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/dashboard?tab=${tab.id}`}
          className={cn(
            "focus-ring rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            currentTab === tab.id ? "dash-tab-link-active shadow-glow" : "dash-tab-link",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
