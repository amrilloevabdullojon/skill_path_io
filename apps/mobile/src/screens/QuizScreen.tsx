import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { ModuleDetailResponse } from "@/lib/contracts/modules";
import type { QuizAttemptResultResponse } from "@/lib/contracts/quiz";

import { api } from "../api";
import { useNavigation } from "../navigation";

type Quiz = NonNullable<ModuleDetailResponse["module"]["quiz"]>;

function isSingleChoice(type: string): boolean {
  return /single|true_false/i.test(type);
}

export function QuizScreen({ slug, moduleId }: { slug: string; moduleId: string }) {
  const { goBack } = useNavigation();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAttemptResultResponse | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const module = await api.tracks.getModule(slug, moduleId);
        if (!active) return;
        if (!module.module.quiz) {
          setError("This module has no quiz.");
        } else {
          setQuiz(module.module.quiz);
        }
      } catch {
        if (active) setError("Could not load the quiz.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, moduleId]);

  const allAnswered = useMemo(
    () => Boolean(quiz) && quiz!.questions.every((q) => (answers[q.id]?.length ?? 0) > 0),
    [quiz, answers],
  );

  function toggleOption(questionId: string, optionId: string, single: boolean) {
    setAnswers((prev) => {
      if (single) return { ...prev, [questionId]: [optionId] };
      const current = prev[questionId] ?? [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }

  async function onSubmit() {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.tracks.submitQuiz(slug, moduleId, { quizId: quiz.id, answers });
      setResult(res);
    } catch {
      setError("Could not submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : error && !quiz ? (
        <Text style={styles.error}>{error}</Text>
      ) : result ? (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={[styles.resultBadge, result.passed ? styles.pass : styles.fail]}>
            <Text style={styles.resultScore}>{result.score}%</Text>
            <Text style={styles.resultLabel}>{result.passed ? "Passed" : "Keep practicing"}</Text>
          </View>
          <Text style={styles.resultMeta}>
            {result.correctAnswers}/{result.totalQuestions} correct · pass at {result.passingScore}%
          </Text>
          {result.certificateIssued ? (
            <Text style={styles.cert}>🎉 Certificate issued — track completed!</Text>
          ) : null}

          {result.wrongAnswers.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Review</Text>
              {result.wrongAnswers.map((wrong) => {
                const labelFor = (ids: string[]) =>
                  ids
                    .map((id) => wrong.options.find((o) => o.id === id)?.text ?? id)
                    .join(", ");
                return (
                  <View key={wrong.questionId} style={styles.reviewCard}>
                    <Text style={styles.reviewQ}>{wrong.question}</Text>
                    <Text style={styles.reviewWrong}>Your answer: {labelFor(wrong.userAnswers) || "—"}</Text>
                    <Text style={styles.reviewRight}>Correct: {labelFor(wrong.correctAnswers)}</Text>
                  </View>
                );
              })}
            </>
          ) : (
            <Text style={styles.perfect}>Perfect score — every answer correct.</Text>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={goBack}>
            <Text style={styles.primaryButtonText}>Back to module</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : quiz ? (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>{quiz.title || "Module quiz"}</Text>
          <Text style={styles.meta}>
            {quiz.questionCount} questions · pass at {quiz.passingScore}%
          </Text>

          {quiz.questions.map((question, index) => {
            const single = isSingleChoice(question.type);
            const selected = answers[question.id] ?? [];
            return (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.text}
                </Text>
                {question.options.map((option) => {
                  const active = selected.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      activeOpacity={0.8}
                      onPress={() => toggleOption(question.id, option.id, single)}
                      style={[styles.option, active && styles.optionActive]}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, (!allAnswered || submitting) && styles.disabled]}
            onPress={onSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit quiz</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600" },
  body: { paddingHorizontal: 20, paddingBottom: 48 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 8 },
  meta: { color: "#818cf8", fontSize: 14, marginTop: 6, marginBottom: 8 },
  questionCard: { backgroundColor: "#1b1733", borderRadius: 14, padding: 16, marginTop: 14 },
  questionText: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  option: {
    borderWidth: 1,
    borderColor: "#312e62",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  optionActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  optionText: { color: "#cbd5e1", fontSize: 15 },
  optionTextActive: { color: "#fff", fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  error: { color: "#fca5a5", textAlign: "center", marginTop: 16 },
  resultBadge: { alignItems: "center", borderRadius: 16, paddingVertical: 24, marginTop: 12 },
  pass: { backgroundColor: "#14532d" },
  fail: { backgroundColor: "#3f1d2e" },
  resultScore: { color: "#fff", fontSize: 44, fontWeight: "800" },
  resultLabel: { color: "#e2e8f0", fontSize: 16, fontWeight: "600", marginTop: 4 },
  resultMeta: { color: "#a5b4fc", fontSize: 14, textAlign: "center", marginTop: 12 },
  cert: { color: "#fde68a", fontSize: 15, textAlign: "center", marginTop: 12, fontWeight: "600" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 26, marginBottom: 10 },
  reviewCard: {
    backgroundColor: "#1b1733",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
  },
  reviewQ: { color: "#fff", fontSize: 15, fontWeight: "600" },
  reviewWrong: { color: "#fca5a5", fontSize: 14, marginTop: 6 },
  reviewRight: { color: "#86efac", fontSize: 14, marginTop: 2 },
  perfect: { color: "#86efac", fontSize: 15, textAlign: "center", marginTop: 20 },
});
