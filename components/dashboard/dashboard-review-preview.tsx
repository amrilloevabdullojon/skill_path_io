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
    <DashboardSection id="review" title="Повторение" description="Быстрый режим повторения на основе твоих заметок и закладок.">
      <article className="content-card surface-panel-hover p-4">
        <p className="text-sm font-semibold text-foreground">Сохранённые материалы</p>
        <p className="mt-2 text-xs text-muted-foreground">{bookmarkCount} закладок · {noteCount} заметок</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/review" className="btn-secondary px-3 py-1.5 text-xs">Открыть повторение</Link>
          <Link href="/bookmarks" className="btn-secondary px-3 py-1.5 text-xs">Закладки</Link>
          <Link href="/notes" className="btn-secondary px-3 py-1.5 text-xs">Заметки</Link>
        </div>
      </article>
      <Link href="/review" className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
        <Bookmark className="h-3.5 w-3.5" />
        Начать быстрое повторение
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </DashboardSection>
  );
}
