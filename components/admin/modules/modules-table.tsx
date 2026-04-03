"use client";

import {
  Fragment,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GripVertical,
  Minus,
  Trash2,
} from "lucide-react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  bulkDeleteModulesAction,
  reorderModulesAction,
  updateModuleAction,
} from "@/app/admin/actions";
import { DeleteModuleButton } from "./delete-module-button";
import { DuplicateModuleButton } from "./duplicate-module-button";
import { SaveModuleButton } from "./save-module-button";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ModuleRow = {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  trackId: string;
  track: { title: string; slug: string; category: string };
  quiz: { id: string } | null;
  _count: { lessons: number };
};

export type TrackGroup = {
  trackId: string;
  trackTitle: string;
  trackSlug: string;
  category: string;
  modules: ModuleRow[];
};

/* ─── Constants ──────────────────────────────────────────────────────────── */

const TRACK_BADGE: Record<string, string> = {
  QA: "track-badge-qa",
  BA: "track-badge-ba",
  DA: "track-badge-da",
};

const COL_COUNT = 11; // handle + checkbox + title+desc + order + dur + lessons + quiz + preview + save + dupe + delete

/* ─── Sortable row ───────────────────────────────────────────────────────── */

type RowProps = {
  mod: ModuleRow;
  selected: boolean;
  onToggle: (id: string) => void;
};

function SortableRow({ mod, selected, onToggle }: RowProps) {
  const t = useTranslations("admin.modules");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mod.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn("table-row align-top", isDragging && "bg-sky-500/5 shadow-lg")}
    >
      {/* Drag handle */}
      <td className="w-8 px-2 py-3">
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={t("list.dragToReorder")}
          className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* Checkbox */}
      <td className="w-10 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(mod.id)}
          aria-label={t("list.selectModule", { title: mod.title })}
          className="h-4 w-4 rounded border-border bg-card accent-sky-400"
        />
      </td>

      {/* Title + description + edit link */}
      <td className="px-3 py-3">
        <input
          form={`mod-edit-${mod.id}`}
          name="title"
          defaultValue={mod.title}
          maxLength={200}
          required
          className="input-base h-9 w-full min-w-[200px] px-2 py-1.5 text-sm"
        />
        <input
          form={`mod-edit-${mod.id}`}
          name="description"
          defaultValue={mod.description}
          maxLength={500}
          placeholder={`${t("shared.description")}…`}
          className="input-base mt-1.5 h-8 w-full min-w-[200px] px-2 py-1 text-xs text-muted-foreground"
        />
        <Link
          href={`/admin/modules/${mod.id}`}
          className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-sky-400 hover:underline"
        >
          {t("shared.editDetails")}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </td>

      {/* Order */}
      <td className="px-3 py-3">
        <input
          form={`mod-edit-${mod.id}`}
          name="order"
          type="number"
          min={1}
          max={999}
          required
          defaultValue={mod.order}
          className="input-base h-9 w-20 px-2 py-1.5 text-sm"
        />
      </td>

      {/* Duration */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <input
            form={`mod-edit-${mod.id}`}
            name="duration"
            type="number"
            min={1}
            max={600}
            required
            defaultValue={mod.duration}
            className="input-base h-9 w-20 px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-muted-foreground">{t("shared.durationShort")}</span>
        </div>
      </td>

      {/* Lessons count */}
      <td className="px-3 py-3 text-sm tabular-nums text-muted-foreground">
        {mod._count.lessons}
      </td>

      {/* Quiz chip */}
      <td className="px-3 py-3">
        {mod.quiz ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            {t("shared.yes")}
          </span>
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )}
      </td>

      {/* Preview */}
      <td className="px-3 py-3">
        <Link
          href={`/tracks/${mod.track.slug}/modules/${mod.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-sky-300 hover:underline"
        >
          {t("shared.view")}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </td>

      {/* Save form (inputs above use form= attr) */}
      <td className="px-3 py-3">
        <form id={`mod-edit-${mod.id}`} action={updateModuleAction}>
          <input type="hidden" name="moduleId" value={mod.id} />
          <SaveModuleButton />
        </form>
      </td>

      {/* Duplicate */}
      <td className="px-3 py-3">
        <DuplicateModuleButton moduleId={mod.id} />
      </td>

      {/* Delete */}
      <td className="px-3 py-3">
        <DeleteModuleButton moduleId={mod.id} moduleTitle={mod.title} />
      </td>
    </tr>
  );
}

/* ─── Main table ─────────────────────────────────────────────────────────── */

export function ModulesTable({ groups: initialGroups }: { groups: TrackGroup[] }) {
  const t = useTranslations("admin.modules");
  const [groups, setGroups] = useState(initialGroups);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const allIds = useMemo(
    () => groups.flatMap((g) => g.modules.map((m) => m.id)),
    [groups],
  );
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const groupIdx = groups.findIndex((g) => g.modules.some((m) => m.id === activeId));
    if (groupIdx === -1) return;

    const group = groups[groupIdx];
    // Prevent cross-track drag
    if (!group.modules.some((m) => m.id === overId)) return;

    const oldIdx = group.modules.findIndex((m) => m.id === activeId);
    const newIdx = group.modules.findIndex((m) => m.id === overId);
    const reordered = arrayMove(group.modules, oldIdx, newIdx).map((m, i) => ({
      ...m,
      order: i + 1,
    }));

    setGroups((prev) =>
      prev.map((g, i) => (i === groupIdx ? { ...g, modules: reordered } : g)),
    );

    startTransition(() => {
      void reorderModulesAction(reordered.map(({ id, order }) => ({ id, order })));
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    if (!confirm(t("list.bulkDeleteConfirm", { count: ids.length })))
      return;

    setGroups((prev) =>
      prev.map((g) => ({ ...g, modules: g.modules.filter((m) => !selected.has(m.id)) })),
    );
    setSelected(new Set());

    startTransition(() => {
      void bulkDeleteModulesAction(ids);
    });
  }

  return (
    <div className="space-y-3">
      {/* ── Bulk action bar ─────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5">
          <span className="text-sm text-foreground">
            {t("list.bulkSelected", { count: selected.size })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {t("list.clear")}
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("list.bulkDelete", { count: selected.size })}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="table-shell">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="table-base min-w-[1280px]">
            <thead className="table-head">
              <tr>
                <th className="w-8 px-2 py-3" aria-label={t("list.dragToReorder")} />
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label={t("shared.selectAll")}
                    className="h-4 w-4 rounded border-border bg-card accent-sky-400"
                  />
                </th>
                <th className="px-3 py-3 text-left">{t("list.titleAndDescription")}</th>
                <th className="px-3 py-3 text-left">{t("shared.order")}</th>
                <th className="px-3 py-3 text-left">{t("shared.durationMinutes")}</th>
                <th className="px-3 py-3 text-left">{t("shared.lessons")}</th>
                <th className="px-3 py-3 text-left">{t("shared.quiz")}</th>
                <th className="px-3 py-3 text-left">{t("shared.preview")}</th>
                <th className="px-3 py-3 text-left">{t("list.saveColumn")}</th>
                <th className="px-3 py-3 text-left">{t("list.duplicateColumn")}</th>
                <th className="px-3 py-3 text-left">{t("list.deleteColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.trackId}>
                  {/* ── Track group header ───────────────────── */}
                  <tr className="border-t-2 border-border/60 bg-card/60">
                    <td colSpan={COL_COUNT} className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TRACK_BADGE[group.category] ?? ""}`}
                        >
                          {group.category}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {group.trackTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("list.summary", { count: group.modules.length })}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ── Sortable rows ─────────────────────────── */}
                  <SortableContext
                    items={group.modules.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {group.modules.map((mod) => (
                      <SortableRow
                        key={mod.id}
                        mod={mod}
                        selected={selected.has(mod.id)}
                        onToggle={toggleSelect}
                      />
                    ))}
                  </SortableContext>
                </Fragment>
              ))}
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
