"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { LessonType } from "@prisma/client";

import { bulkDeleteLessonsAction, updateLessonAction } from "@/app/admin/actions";
import { DeleteLessonButton } from "@/components/admin/lessons/delete-lesson-button";
import { SaveRowButton } from "@/components/admin/save-row-button";

export type LessonRow = {
  id: string;
  title: string;
  type: string;
  order: number;
  body: string;
};

export type LessonGroup = {
  moduleId: string;
  moduleTitle: string;
  trackTitle: string;
  trackCategory: string;
  lessons: LessonRow[];
};

const TYPE_BADGE: Record<LessonType, string> = {
  TEXT: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  VIDEO: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  TASK: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const COL_COUNT = 7;

export function LessonsTable({ groups: initialGroups }: { groups: LessonGroup[] }) {
  const [groups] = useState(initialGroups);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();

  const allIds = groups.flatMap((g) => g.lessons.map((l) => l.id));

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(allIds) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleGroup(groupIds: string[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        groupIds.forEach((id) => next.add(id));
      } else {
        groupIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    if (!confirm(`Delete ${ids.length} lesson${ids.length !== 1 ? "s" : ""}?\n\nThis cannot be undone.`))
      return;
    startBulk(() => {
      bulkDeleteLessonsAction(ids);
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-2">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/8 px-4 py-2">
          <span className="text-xs font-medium text-rose-400">
            {selected.size} selected
          </span>
          <button
            type="button"
            disabled={bulkPending}
            onClick={handleBulkDelete}
            className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
          >
            {bulkPending ? "Deleting…" : `Delete ${selected.size}`}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      <div className={`table-shell transition-opacity${bulkPending ? " opacity-50 pointer-events-none" : ""}`}>
        <table className="table-base min-w-[960px]">
          <thead className="table-head">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded accent-sky-500"
                  checked={allIds.length > 0 && selected.size === allIds.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="px-3 py-3 text-left">Title</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-left">Order</th>
              <th className="px-3 py-3 text-left">Save</th>
              <th className="px-3 py-3 text-left">Edit</th>
              <th className="px-3 py-3 text-left">Del</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.moduleId}>
                {/* Group header row */}
                <tr className="border-t-2 border-border/60 bg-card/60">
                  <td className="px-3 py-2">
                    {(() => {
                      const groupIds = group.lessons.map((l) => l.id);
                      const allChecked = groupIds.length > 0 && groupIds.every((id) => selected.has(id));
                      const someChecked = groupIds.some((id) => selected.has(id));
                      return (
                        <input
                          type="checkbox"
                          aria-label={`Select all lessons in ${group.moduleTitle}`}
                          className="h-3.5 w-3.5 rounded accent-sky-500"
                          checked={allChecked}
                          ref={(el) => {
                            if (el) el.indeterminate = someChecked && !allChecked;
                          }}
                          onChange={(e) => toggleGroup(groupIds, e.target.checked)}
                        />
                      );
                    })()}
                  </td>
                  <td colSpan={COL_COUNT - 1} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {group.moduleTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {group.trackTitle}
                      </span>
                      <span className="ml-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {group.lessons.length} lesson{group.lessons.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Lesson rows */}
                {group.lessons.map((lesson) => (
                  <tr key={lesson.id} className="table-row align-top">
                    {/* Checkbox */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded accent-sky-500"
                        checked={selected.has(lesson.id)}
                        onChange={(e) => toggleOne(lesson.id, e.target.checked)}
                      />
                    </td>

                    {/* Title */}
                    <td className="px-3 py-2">
                      <input
                        form={`lesson-edit-${lesson.id}`}
                        name="title"
                        defaultValue={lesson.title}
                        maxLength={200}
                        required
                        className="input-base h-8 min-w-[200px] px-2 py-1 text-sm"
                      />
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2">
                      <select
                        form={`lesson-edit-${lesson.id}`}
                        name="type"
                        defaultValue={lesson.type}
                        className="select-base h-8 px-2 py-0.5 text-xs"
                      >
                        <option value={LessonType.TEXT}>TEXT</option>
                        <option value={LessonType.VIDEO}>VIDEO</option>
                        <option value={LessonType.TASK}>TASK</option>
                      </select>
                      <span
                        className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[lesson.type as LessonType]}`}
                      >
                        {lesson.type}
                      </span>
                    </td>

                    {/* Order */}
                    <td className="px-3 py-2">
                      <input
                        form={`lesson-edit-${lesson.id}`}
                        name="order"
                        type="number"
                        defaultValue={lesson.order}
                        min={1}
                        max={999}
                        className="input-base h-8 w-16 px-2 py-1 text-center text-sm tabular-nums"
                      />
                    </td>

                    {/* Save */}
                    <td className="px-3 py-2">
                      <form id={`lesson-edit-${lesson.id}`} action={updateLessonAction}>
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="body" value={lesson.body} />
                        <SaveRowButton />
                      </form>
                    </td>

                    {/* Edit */}
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/lessons/${lesson.id}`}
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        Edit
                      </Link>
                    </td>

                    {/* Delete */}
                    <td className="px-3 py-2">
                      <DeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
