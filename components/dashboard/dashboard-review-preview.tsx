import Link from "next/link";
import { ArrowUpRight, Bookmark } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

export function DashboardReviewPreviewSection({
  bookmarkCount,
  noteCount,
}: {
  bookmarkCount: number;
  noteCount: number;
}) {
  return (
    <DashboardSection id="review" title="Review Preview" description="Speed revision mode built from your notes and bookmarks.">
      <article className="content-card surface-panel-hover p-4">
        <p className="text-sm font-semibold text-foreground">Saved review assets</p>
        <p className="mt-2 text-xs text-muted-foreground">{bookmarkCount} bookmarks | {noteCount} notes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/review" className="btn-secondary px-3 py-1.5 text-xs">Open review mode</Link>
          <Link href="/bookmarks" className="btn-secondary px-3 py-1.5 text-xs">Bookmarks</Link>
          <Link href="/notes" className="btn-secondary px-3 py-1.5 text-xs">Notes</Link>
        </div>
      </article>
      <Link href="/review" className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200">
        <Bookmark className="h-3.5 w-3.5" />
        Start quick revision
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </DashboardSection>
  );
}
