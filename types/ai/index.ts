export type AiReviewKind = "QUIZ" | "EXERCISE";

export type MentorMessage = {
  role: "user" | "assistant";
  content: string;
};

export type MentorContext = {
  trackTitle?: string;
  moduleTitle?: string;
  lessonText?: string;
};

export type MentorRequest = {
  context?: MentorContext;
  messages?: MentorMessage[];
};

export type MentorResponse = {
  reply: string;
};

export type UnifiedAiReviewRequest =
  | {
      reviewType: "QUIZ";
      payload: {
        question: string;
        options?: string[];
        userAnswers: string[];
        correctAnswers: string[];
        lessonContext: string;
      };
    }
  | {
      reviewType: "EXERCISE";
      payload: {
        exerciseType: "BUG_REPORT" | "USER_STORY" | "SQL_ANALYSIS" | "ANALYTICS_TASK";
        submission: string;
        context?: string;
      };
    };

export type UnifiedAiReviewResponse = {
  source: "quiz" | "exercise";
  result: Record<string, unknown>;
};
