import type { QuestionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// ─── Write operations for admin quiz / question actions ───────────────────────

export async function quizCreate(data: {
  moduleId: string;
  title: string;
  passingScore: number;
}) {
  return prisma.quiz.create({ data });
}

export async function quizUpdate(id: string, data: { title: string; passingScore: number }) {
  return prisma.quiz.update({ where: { id }, data });
}

export async function quizDelete(id: string) {
  return prisma.quiz.delete({ where: { id }, select: { moduleId: true } });
}

export async function questionCreate(data: {
  quizId: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string[];
}) {
  return prisma.question.create({ data });
}

export async function questionUpdate(
  id: string,
  data: { text: string; type: QuestionType; options: string[]; correctAnswer: string[] },
) {
  return prisma.question.update({
    where: { id },
    data,
    select: { quizId: true },
  });
}

export async function questionDelete(id: string) {
  return prisma.question.delete({ where: { id }, select: { quizId: true } });
}
