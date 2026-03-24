"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseCategory, CourseLevel } from "@/types/builder/course-builder";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

const categories: CourseCategory[] = ["QA", "BA", "DA", "PRODUCT", "MANAGEMENT"];
const levels: CourseLevel[] = ["BEGINNER", "JUNIOR", "INTERMEDIATE", "ADVANCED"];

export function NewCourseForm() {
  const router = useRouter();
  const createCourse = useCourseBuilderStore((state) => state.createCourse);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState<CourseCategory>("QA");
  const [level, setLevel] = useState<CourseLevel>("BEGINNER");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const courseId = createCourse({
      title: title.trim() || "Untitled course",
      shortTitle: title.trim() || "Untitled",
      shortDescription,
      description: shortDescription,
      category,
      level,
    });
    router.push(`/admin/courses/${courseId}/builder`);
  }

  return (
    <section className="surface-elevated space-y-4 p-5 sm:p-6">
      <header>
        <p className="kicker">New course</p>
        <h1 className="text-2xl font-semibold text-slate-100">Create course in Academy Studio</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="input-base" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Course title" />
        <textarea className="textarea-base min-h-[120px]" value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} placeholder="Short course description" />
        <div className="grid gap-3 md:grid-cols-2">
          <select className="select-base" value={category} onChange={(event) => setCategory(event.target.value as CourseCategory)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="select-base" value={level} onChange={(event) => setLevel(event.target.value as CourseLevel)}>
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create and open builder
        </Button>
      </form>
    </section>
  );
}
