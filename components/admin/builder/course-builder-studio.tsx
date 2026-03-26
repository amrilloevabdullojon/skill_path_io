"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Settings2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { MainEditor } from "@/components/admin/builder/main-editor";
import { SettingsPanel } from "@/components/admin/builder/settings-panel";
import { StructureTree } from "@/components/admin/builder/structure-tree";
import { Drawer } from "@/components/ui/drawer";
import { StatePanel } from "@/components/ui/state-panel";
import { BuilderSelection } from "@/types/builder/builder-ui";
import { CourseStudioEntity } from "@/types/builder/course-builder";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

type CourseBuilderStudioProps = {
  courseId: string;
  canWrite: boolean;
  canPublish: boolean;
};

function belongsToCourse(selection: BuilderSelection, courseId: string, entity: CourseStudioEntity) {
  if (selection.type === "course") {
    return selection.id === courseId;
  }
  if (selection.type === "module") {
    return entity.modules.some((item) => item.id === selection.id);
  }
  if (selection.type === "lesson") {
    return entity.lessons.some((item) => item.id === selection.id);
  }
  if (selection.type === "quiz") {
    return entity.quizzes.some((item) => item.id === selection.id);
  }
  if (selection.type === "assignment") {
    return entity.assignments.some((item) => item.id === selection.id);
  }
  if (selection.type === "simulation") {
    return entity.simulations.some((item) => item.id === selection.id);
  }
  return entity.cases.some((item) => item.id === selection.id);
}

export function CourseBuilderStudio({ courseId, canWrite, canPublish }: CourseBuilderStudioProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const courses = useCourseBuilderStore((state) => state.courses);
  const selected = useCourseBuilderStore((state) => state.selected);
  const setSelected = useCourseBuilderStore((state) => state.setSelected);
  const addVersion = useCourseBuilderStore((state) => state.addVersion);
  const addModule = useCourseBuilderStore((state) => state.addModule);
  const addLesson = useCourseBuilderStore((state) => state.addLesson);
  const addQuiz = useCourseBuilderStore((state) => state.addQuiz);
  const addAssignment = useCourseBuilderStore((state) => state.addAssignment);
  const addSimulation = useCourseBuilderStore((state) => state.addSimulation);
  const addCase = useCourseBuilderStore((state) => state.addCase);
  const duplicateModule = useCourseBuilderStore((state) => state.duplicateModule);
  const deleteModule = useCourseBuilderStore((state) => state.deleteModule);
  const reorderModules = useCourseBuilderStore((state) => state.reorderModules);

  const entity = useMemo(() => courses.find((item) => item.course.id === courseId), [courseId, courses]);

  useEffect(() => {
    if (!entity) {
      return;
    }
    if (!selected || !belongsToCourse(selected, courseId, entity)) {
      setSelected({ type: "course", id: courseId });
    }
  }, [courseId, entity, selected, setSelected]);

  if (!entity) {
    return <StatePanel title="Course not found" description="Open /admin/courses and create a course first." />;
  }

  const fallbackSelection: BuilderSelection = { type: "course", id: courseId };
  const activeSelection: BuilderSelection = selected && belongsToCourse(selected, courseId, entity)
    ? selected
    : fallbackSelection;

  return (
    <div className="page-shell">
      <header className="surface-elevated flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="kicker">Academy Studio</p>
          <h1 className="text-2xl font-semibold text-foreground">{entity.course.title} Builder</h1>
          <p className="text-sm text-muted-foreground">3-column course constructor: structure, editor, and publish logic.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary gap-2 xl:hidden"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </button>
          <button
            type="button"
            className="btn-secondary gap-2"
            onClick={() => addVersion(courseId, "Builder quick save")}
            disabled={!canWrite}
          >
            <Save className="h-4 w-4" />
            Save snapshot
          </button>
          <button
            type="button"
            className="btn-primary gap-2"
            onClick={() => addModule(courseId)}
            disabled={!canWrite}
          >
            <Plus className="h-4 w-4" />
            Add module
          </button>
          <Link href={`/admin/courses/${courseId}/preview`} className="btn-secondary gap-2">
            <Sparkles className="h-4 w-4" />
            Preview
          </Link>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_340px]"
      >
        <StructureTree
          entity={entity}
          selected={activeSelection}
          onSelect={setSelected}
          onAddModule={() => addModule(courseId)}
          onAddLesson={addLesson}
          onAddQuiz={addQuiz}
          onAddAssignment={addAssignment}
          onAddSimulation={addSimulation}
          onAddCase={addCase}
          onDuplicateModule={duplicateModule}
          onDeleteModule={deleteModule}
          onReorderModules={(from, to) => reorderModules(courseId, from, to)}
        />

        <MainEditor entity={entity} selected={activeSelection} canWrite={canWrite} />

        <div className="hidden xl:block">
          <SettingsPanel
            entity={entity}
            selected={activeSelection}
            canWrite={canWrite}
            canPublish={canPublish}
          />
        </div>
      </motion.div>

      <Drawer
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Builder settings"
        side="right"
        className="xl:hidden"
      >
        <SettingsPanel
          entity={entity}
          selected={activeSelection}
          canWrite={canWrite}
          canPublish={canPublish}
        />
      </Drawer>

      <div className="surface-glass fixed bottom-4 left-1/2 z-40 flex w-[min(95vw,42rem)] -translate-x-1/2 items-center justify-between gap-2 p-2 xl:hidden">
        <button
          type="button"
          className="btn-secondary flex-1 gap-2"
          onClick={() => addVersion(courseId, "Builder quick save")}
          disabled={!canWrite}
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          type="button"
          className="btn-primary flex-1 gap-2"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Publish
        </button>
      </div>
    </div>
  );
}
