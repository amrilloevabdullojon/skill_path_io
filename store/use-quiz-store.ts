"use client";

import { create } from "zustand";

export type QuizQuestionType = "SINGLE" | "MULTI";

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  type: QuizQuestionType;
  options: QuizOption[];
  correctAnswer: string[];
};

export type QuizWrongAnswer = {
  questionId: string;
  question: string;
  options: QuizOption[];
  userAnswers: string[];
  correctAnswers: string[];
};

export type QuizResult = {
  ok: boolean;
  score: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  certificateIssued: boolean;
  trackCompleted: boolean;
  wrongAnswers: QuizWrongAnswer[];
  message?: string;
};

type QuizState = {
  quizId: string | null;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string[]>;
  result: QuizResult | null;
  initialize: (input: { quizId: string; questions: QuizQuestion[] }) => void;
  selectOption: (questionId: string, questionType: QuizQuestionType, optionId: string, checked: boolean) => void;
  goNext: () => void;
  goPrevious: () => void;
  setResult: (result: QuizResult) => void;
  retry: () => void;
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export const useQuizStore = create<QuizState>((set) => ({
  quizId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  result: null,
  initialize: ({ quizId, questions }) =>
    set((state) => {
      if (state.quizId === quizId) {
        return state;
      }

      return {
        quizId,
        questions,
        currentIndex: 0,
        answers: {},
        result: null,
      };
    }),
  selectOption: (questionId, questionType, optionId, checked) =>
    set((state) => {
      const current = state.answers[questionId] ?? [];

      if (questionType === "SINGLE") {
        return {
          answers: {
            ...state.answers,
            [questionId]: checked ? [optionId] : [],
          },
        };
      }

      const nextValues = checked
        ? uniqueSorted([...current, optionId])
        : current.filter((value) => value !== optionId);

      return {
        answers: {
          ...state.answers,
          [questionId]: nextValues,
        },
      };
    }),
  goNext: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, Math.max(state.questions.length - 1, 0)),
    })),
  goPrevious: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),
  setResult: (result) =>
    set({
      result,
    }),
  retry: () =>
    set((state) => ({
      currentIndex: 0,
      answers: {},
      result: null,
      quizId: state.quizId,
      questions: state.questions,
    })),
}));
