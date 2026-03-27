"use client";

import {
  Fragment,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import Link from "next/link";
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
          aria-label="Drag to reorder"
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
          aria-label={`Select ${mod.title}`}
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
          placeholder="Description…"
          className="input-base mt-1.5 h-8 w-full min-w-[200px] px-2 py-1 text-xs text-muted-foreground"
        />
        <Link
          href={`/admin/modules/${mod.id}`}
          className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-sky-400 hover:underline"
        >
          Edit details
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
          <span className="text-xs text-muted-foreground">min</span>
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
            Yes
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
          View
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
      next.has(id) ? next.delete(id) : next.add(id);
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
    if (
      !confirm(
        `Delete ${ids.length} module${ids.length !== 1 ? "s" : ""}?\n\nThis also removes all associated lessons and learner progress. This cannot be undone.`,
      )
    )
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
            {selected.size} module{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {selected.size}
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
                <th className="w-8 px-2 py-3" aria-label="Drag to reorder" />
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all modules"
                    className="h-4 w-4 rounded border-border bg-card accent-sky-400"
                  />
                </th>
                <th className="px-3 py-3 text-left">Title &amp; description</th>
                <th className="px-3 py-3 text-left">Order</th>
                <th className="px-3 py-3 text-left">Duration</th>
                <th className="px-3 py-3 text-left">Lessons</th>
                <th className="px-3 py-3 text-left">Quiz</th>
                <th className="px-3 py-3 text-left">Preview</th>
                <th className="px-3 py-3 text-left">Save</th>
                <th className="px-3 py-3 text-left">Dupe</th>
                <th className="px-3 py-3 text-left">Delete</th>
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
                          {group.modules.length} module{group.modules.length !== 1 ? "s" : ""}
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
