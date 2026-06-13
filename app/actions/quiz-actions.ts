"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "@/lib/auth";
import {
  gradeAndRecordQuizAttempt,
  type QuizAttemptPayload,
  type QuizAttemptResult,
} from "@/lib/learning/quiz-grading";

export type { QuizAttemptPayload, QuizAttemptResult };

export async function submitQuizAttempt(payload: QuizAttemptPayload): Promise<QuizAttemptResult> {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const locale = cookieStore.get("levio-locale")?.value;

  const result = await gradeAndRecordQuizAttempt({
    userEmail: session?.user?.email,
    locale,
    payload,
  });

  if (result.ok) {
    revalidatePath(`/tracks/${payload.trackSlug}`);
    revalidatePath(`/tracks/${payload.trackSlug}/modules/${payload.moduleId}`);
    revalidatePath(`/tracks/${payload.trackSlug}/modules/${payload.moduleId}/quiz`);
    revalidatePath("/dashboard");
    revalidatePath("/review");
  }

  return result;
}
