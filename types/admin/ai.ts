export type AdminAiTool =
  | "generate_course_description"
  | "generate_learning_outcomes"
  | "generate_module_outline"
  | "generate_lesson_draft"
  | "improve_lesson_text"
  | "simplify_for_beginners"
  | "generate_quiz_questions"
  | "generate_assignment"
  | "generate_case_study"
  | "generate_tags";

export type AdminAiRequest = {
  tool: AdminAiTool;
  prompt?: string;
  context: {
    courseTitle?: string;
    moduleTitle?: string;
    lessonTitle?: string;
    description?: string;
    content?: string;
    tags?: string[];
  };
};

export type AdminAiResponse = {
  result: string;
  suggestions: string[];
  source: "mock" | "anthropic";
};
