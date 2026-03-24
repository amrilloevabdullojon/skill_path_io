import { CourseStatus, LessonBlock, LessonBlockType, UnlockRule } from "@/types/builder/course-builder";

export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function reorderByIndex<T>(items: T[], from: number, to: number) {
  const clone = [...items];
  const [moved] = clone.splice(from, 1);
  clone.splice(to, 0, moved);
  return clone;
}

export function nextStatus(status: CourseStatus): CourseStatus {
  if (status === "DRAFT") {
    return "IN_REVIEW";
  }
  if (status === "IN_REVIEW") {
    return "PUBLISHED";
  }
  if (status === "PUBLISHED") {
    return "ARCHIVED";
  }
  return "DRAFT";
}

export function defaultUnlockRule(): UnlockRule {
  return {
    prerequisiteModuleIds: [],
    prerequisiteLessonIds: [],
    unlockAfterQuizPass: false,
    unlockAfterAssignmentCompletion: false,
    minScoreToUnlock: null,
    requiredXp: null,
    optionalContent: false,
    hiddenByDefault: false,
    scheduleAt: null,
  };
}

export function defaultLessonBlock(type: LessonBlockType, order = 1): LessonBlock {
  const fallbackContent: Record<LessonBlockType, string> = {
    heading: "Section heading",
    subheading: "Subheading",
    paragraph: "Add your text here...",
    markdown: "## Markdown block\nUse **formatting** and lists.",
    bullet_list: "- Point one\n- Point two",
    numbered_list: "1. Step one\n2. Step two",
    checklist: "- [ ] Checklist item",
    quote: "Quoted idea or expert insight.",
    callout: "Important callout message.",
    key_points: "- Key point",
    common_mistakes: "- Common mistake",
    important_note: "Important note.",
    real_world_example: "Real-world scenario...",
    table: "Column A | Column B\n---|---\nValue 1 | Value 2",
    divider: "---",
    code_block: "```ts\nconsole.log('example');\n```",
    image: "https://placehold.co/800x400",
    video_embed: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    file_attachment: "attachment.pdf",
    faq_accordion: "Q: Question?\nA: Answer.",
    task_block: "Task: complete this practical exercise.",
    summary_block: "Summary of lesson key takeaways.",
  };

  return {
    id: createId("block"),
    type,
    content: fallbackContent[type],
    config: {},
    order,
    collapsed: false,
  };
}
