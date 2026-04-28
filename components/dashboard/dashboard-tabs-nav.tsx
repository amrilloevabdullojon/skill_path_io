import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "skills" | "career";

export async function DashboardTabsNav({ currentTab }: { currentTab: DashboardTab }) {
  const t = await getTranslations("dashboard.tabs");

  const tabs: Array<{ id: DashboardTab; label: string }> = [
    { id: "overview", label: t("overview") },
    { id: "skills", label: t("skills") },
    { id: "career", label: t("career") },
  ];

  return (
    <nav className="dash-tab-nav flex flex-wrap gap-1 p-1.5" aria-label="Dashboard tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/dashboard?tab=${tab.id}`}
          aria-current={currentTab === tab.id ? "page" : undefined}
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
