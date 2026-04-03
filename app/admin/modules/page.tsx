import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import type { TrackGroup } from "@/components/admin/modules/modules-table";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getModuleListData } from "@/lib/admin/modules/queries";

const ModulesTable = dynamic(
  () =>
    import("@/components/admin/modules/modules-table").then((m) => ({
      default: m.ModulesTable,
    })),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-xl bg-card" /> },
);

export const metadata: Metadata = {
  title: "Modules — Admin",
  robots: { index: false },
};

type ModulesAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    trackId?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ModulesAdminPage({ searchParams }: ModulesAdminPageProps) {
  await requireAdminPermission("courses.read");
  const t = await getTranslations("admin.modules");

  const query = paramValue(searchParams?.q);
  const trackIdFilter = paramValue(searchParams?.trackId);

  const [tracks, modules] = await getModuleListData({ query, trackId: trackIdFilter });

  const activeTrackLabel = trackIdFilter
    ? (tracks.find((track) => track.id === trackIdFilter)?.title ?? t("list.selectedTrack"))
    : null;

  // Group modules by track preserving fetch order
  const groupMap = new Map<string, TrackGroup>();
  for (const mod of modules) {
    if (!groupMap.has(mod.trackId)) {
      groupMap.set(mod.trackId, {
        trackId: mod.trackId,
        trackTitle: mod.track.title,
        trackSlug: mod.track.slug,
        category: mod.track.category as string,
        modules: [],
      });
    }
    groupMap.get(mod.trackId)!.modules.push({
      ...mod,
      description: mod.description ?? "",
      track: { ...mod.track, category: mod.track.category as string },
    });
  }
  const groups = Array.from(groupMap.values());

  return (
    <section className="page-shell">
      <PageHeader
        kicker={t("shared.kicker")}
        title={t("list.title")}
        description={t("list.description")}
        actionLabel={t("list.newModule")}
        actionHref="/admin/modules/new"
      />

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={t("list.searchPlaceholder")}
            className="input-base"
          />
          <select name="trackId" defaultValue={trackIdFilter} className="select-base">
            <option value="">{t("list.allTracks")}</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">
              {t("list.apply")}
            </button>
            {(query || trackIdFilter) && (
              <a href="/admin/modules" className="btn-secondary text-muted-foreground">
                {t("list.reset")}
              </a>
            )}
          </div>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {query && activeTrackLabel
            ? t("list.summaryMatchingInTrack", { count: modules.length, query, track: activeTrackLabel })
            : query
              ? t("list.summaryMatching", { count: modules.length, query })
              : activeTrackLabel
                ? t("list.summaryInTrack", { count: modules.length, track: activeTrackLabel })
                : t("list.summary", { count: modules.length })}
        </p>

        {modules.length === 0 ? (
          <EmptyState
            title={t("list.emptyTitle")}
            description={
              query || trackIdFilter
                ? t("list.emptyFiltered")
                : t("list.emptyDefault")
            }
            actionLabel={t("list.newModule")}
            actionHref="/admin/modules/new"
            size="sm"
          />
        ) : (
          <ModulesTable groups={groups} />
        )}
      </section>
    </section>
  );
}
