"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, GripVertical, Link2, Plus, Trash2 } from "lucide-react";

import { BuilderSelection } from "@/types/builder/builder-ui";
import { CourseStudioEntity } from "@/types/builder/course-builder";

type StructureTreeProps = {
  entity: CourseStudioEntity;
  selected: BuilderSelection;
  onSelect: (selection: BuilderSelection) => void;
  onAddModule: () => void;
  onAddLesson: (moduleId: string) => void;
  onAddQuiz: (moduleId: string) => void;
  onAddAssignment: (moduleId: string) => void;
  onAddSimulation: (moduleId: string) => void;
  onAddCase: (moduleId: string) => void;
  onDuplicateModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onReorderModules: (from: number, to: number) => void;
};

type SortableModuleRowProps = {
  id: string;
  title: string;
  status: string;
  selected: boolean;
  onSelect: () => void;
};

function SortableModuleRow({ id, title, status, selected, onSelect }: SortableModuleRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left text-sm ${
        selected ? "border-sky-400/50 bg-sky-500/10 text-sky-100" : "border-slate-700 bg-slate-900/80 text-slate-200"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="cursor-grab rounded-md border border-slate-700 p-1 text-slate-500 active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </span>
        {title}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{status}</span>
    </button>
  );
}

export function StructureTree({
  entity,
  selected,
  onSelect,
  onAddModule,
  onAddLesson,
  onAddQuiz,
  onAddAssignment,
  onAddSimulation,
  onAddCase,
  onDuplicateModule,
  onDeleteModule,
  onReorderModules,
}: StructureTreeProps) {
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const sensors = useSensors(useSensor(PointerSensor));
  const modules = [...entity.modules].sort((a, b) => a.order - b.order);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const from = modules.findIndex((moduleItem) => moduleItem.id === active.id);
    const to = modules.findIndex((moduleItem) => moduleItem.id === over.id);
    if (from >= 0 && to >= 0) {
      onReorderModules(from, to);
    }
  }

  return (
    <aside className="surface-elevated space-y-3 p-4 xl:sticky xl:top-24 xl:h-[calc(100vh-150px)] xl:overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-100">Structure tree</p>
        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={onAddModule}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSelect({ type: "course", id: entity.course.id })}
        className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
          selected.type === "course"
            ? "border-sky-400/50 bg-sky-500/10 text-sky-100"
            : "border-slate-700 bg-slate-900/80 text-slate-200"
        }`}
      >
        {entity.course.title}
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map((moduleItem) => moduleItem.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {modules.map((moduleItem) => {
              const lessons = entity.lessons.filter((lesson) => lesson.moduleId === moduleItem.id);
              const quizzes = entity.quizzes.filter((quiz) => quiz.moduleId === moduleItem.id);
              const assignments = entity.assignments.filter((assignment) => assignment.moduleId === moduleItem.id);
              const simulations = entity.simulations.filter((simulation) => simulation.moduleId === moduleItem.id);
              const cases = entity.cases.filter((caseItem) => caseItem.moduleId === moduleItem.id);
              const collapsed = Boolean(collapsedModules[moduleItem.id]);
              return (
                <div key={moduleItem.id} className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/65 p-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="btn-secondary px-1.5 py-1 text-[10px]"
                      onClick={() =>
                        setCollapsedModules((prev) => ({
                          ...prev,
                          [moduleItem.id]: !prev[moduleItem.id],
                        }))
                      }
                    >
                      {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <SortableModuleRow
                        id={moduleItem.id}
                        title={`${moduleItem.order}. ${moduleItem.title}`}
                        status={moduleItem.status}
                        selected={selected.type === "module" && selected.id === moduleItem.id}
                        onSelect={() => onSelect({ type: "module", id: moduleItem.id })}
                      />
                    </div>
                  </div>

                  {!collapsed ? (
                    <>
                      <div className="flex flex-wrap gap-1 px-1">
                        <button type="button" className="btn-secondary px-2 py-1 text-[10px]" onClick={() => onAddLesson(moduleItem.id)}>+ lesson</button>
                        <button type="button" className="btn-secondary px-2 py-1 text-[10px]" onClick={() => onAddQuiz(moduleItem.id)}>+ quiz</button>
                        <button type="button" className="btn-secondary px-2 py-1 text-[10px]" onClick={() => onAddAssignment(moduleItem.id)}>+ task</button>
                        <button type="button" className="btn-secondary px-2 py-1 text-[10px]" onClick={() => onAddSimulation(moduleItem.id)}>+ sim</button>
                        <button type="button" className="btn-secondary px-2 py-1 text-[10px]" onClick={() => onAddCase(moduleItem.id)}>+ case</button>
                        <button type="button" className="btn-secondary px-2 py-1 text-[10px]" onClick={() => onDuplicateModule(moduleItem.id)}><Copy className="h-3 w-3" /></button>
                        <button type="button" className="btn-destructive px-2 py-1 text-[10px]" onClick={() => onDeleteModule(moduleItem.id)}><Trash2 className="h-3 w-3" /></button>
                      </div>

                      <div className="flex flex-wrap gap-1 px-2">
                        {moduleItem.unlockRule.prerequisiteModuleIds.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-200">
                            <Link2 className="h-3 w-3" />
                            prereq {moduleItem.unlockRule.prerequisiteModuleIds.length}
                          </span>
                        ) : null}
                        {moduleItem.unlockRule.hiddenByDefault ? (
                          <span className="rounded-full border border-slate-600/40 bg-slate-700/40 px-2 py-1 text-[10px] text-slate-300">
                            hidden
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">
                            visible
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 pl-2">
                        {lessons.map((item) => (
                          <button key={item.id} type="button" onClick={() => onSelect({ type: "lesson", id: item.id })} className={`w-full rounded-lg px-2 py-1 text-left text-xs ${selected.type === "lesson" && selected.id === item.id ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"}`}>
                            Lesson: {item.title}
                          </button>
                        ))}
                        {quizzes.map((item) => (
                          <button key={item.id} type="button" onClick={() => onSelect({ type: "quiz", id: item.id })} className={`w-full rounded-lg px-2 py-1 text-left text-xs ${selected.type === "quiz" && selected.id === item.id ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"}`}>
                            Quiz: {item.title}
                          </button>
                        ))}
                        {assignments.map((item) => (
                          <button key={item.id} type="button" onClick={() => onSelect({ type: "assignment", id: item.id })} className={`w-full rounded-lg px-2 py-1 text-left text-xs ${selected.type === "assignment" && selected.id === item.id ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"}`}>
                            Assignment: {item.title}
                          </button>
                        ))}
                        {simulations.map((item) => (
                          <button key={item.id} type="button" onClick={() => onSelect({ type: "simulation", id: item.id })} className={`w-full rounded-lg px-2 py-1 text-left text-xs ${selected.type === "simulation" && selected.id === item.id ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"}`}>
                            Simulation: {item.title}
                          </button>
                        ))}
                        {cases.map((item) => (
                          <button key={item.id} type="button" onClick={() => onSelect({ type: "case", id: item.id })} className={`w-full rounded-lg px-2 py-1 text-left text-xs ${selected.type === "case" && selected.id === item.id ? "bg-sky-500/15 text-sky-200" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"}`}>
                            Case: {item.title}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </aside>
  );
}
