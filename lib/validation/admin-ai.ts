import { AdminAiRequest, AdminAiTool } from "@/types/admin/ai";

const allowedTools: AdminAiTool[] = [
  "generate_course_description",
  "generate_learning_outcomes",
  "generate_module_outline",
  "generate_lesson_draft",
  "improve_lesson_text",
  "simplify_for_beginners",
  "generate_quiz_questions",
  "generate_assignment",
  "generate_case_study",
  "generate_tags",
];

function toStringOrEmpty(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isAdminAiTool(value: unknown): value is AdminAiTool {
  return typeof value === "string" && allowedTools.includes(value as AdminAiTool);
}

export function parseAdminAiRequest(body: unknown): AdminAiRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const source = body as Record<string, unknown>;
  if (!isAdminAiTool(source.tool)) {
    return null;
  }
  const rawContext = source.context;
  if (!rawContext || typeof rawContext !== "object") {
    return null;
  }
  const context = rawContext as Record<string, unknown>;

  return {
    tool: source.tool,
    prompt: toStringOrEmpty(source.prompt) || undefined,
    context: {
      courseTitle: toStringOrEmpty(context.courseTitle) || undefined,
      moduleTitle: toStringOrEmpty(context.moduleTitle) || undefined,
      lessonTitle: toStringOrEmpty(context.lessonTitle) || undefined,
      description: toStringOrEmpty(context.description) || undefined,
      content: toStringOrEmpty(context.content) || undefined,
      tags: Array.isArray(context.tags) ? context.tags.filter((item): item is string => typeof item === "string") : undefined,
    },
  };
}
