import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ApiError } from "@/lib/api/v1/client";
import type {
  InterviewEvaluateResponse,
  InterviewStartResponse,
} from "@/lib/contracts/interview";

import { api } from "../api";
import { useNavigation } from "../navigation";

type Track = "QA" | "BA" | "DA";
type Question = InterviewStartResponse["questions"][number];

const TRACKS: Track[] = ["QA", "BA", "DA"];

export function InterviewScreen() {
  const { goBack } = useNavigation();
  const [track, setTrack] = useState<Track | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<InterviewEvaluateResponse["evaluation"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(selected: Track) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.interview.start(selected);
      setTrack(selected);
      setQuestions(res.questions);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "Interview mode requires a plan upgrade."
          : "Could not start the interview.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!track) return;
    setBusy(true);
    setError(null);
    try {
      const payload = questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" }));
      const res = await api.interview.evaluate(track, payload);
      setEvaluation(res.evaluation);
    } catch {
      setError("Could not evaluate your answers.");
    } finally {
      setBusy(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => (answers[q.id] ?? "").trim());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Interview trainer</Text>

        {evaluation ? (
          <>
            <View style={styles.scoreBadge}>
              <Text style={styles.score}>{evaluation.score}</Text>
              <Text style={styles.level}>{evaluation.level}</Text>
            </View>
            <Text style={styles.summary}>{evaluation.summary}</Text>
            <Section title="Strengths" items={evaluation.strengths} tone="good" />
            <Section title="Weaknesses" items={evaluation.weaknesses} tone="warn" />
            <Section title="Recommendations" items={evaluation.recommendations} tone="plain" />
            <TouchableOpacity style={styles.primary} onPress={goBack}>
              <Text style={styles.primaryText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : questions.length === 0 ? (
          <>
            <Text style={styles.subtitle}>Pick a track to begin a 4-question mock interview.</Text>
            <View style={styles.row}>
              {TRACKS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.pill}
                  onPress={() => start(t)}
                  disabled={busy}
                >
                  <Text style={styles.pillText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {busy ? <ActivityIndicator style={{ marginTop: 20 }} color="#6366f1" /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : (
          <>
            {questions.map((q, i) => (
              <View key={q.id} style={styles.qCard}>
                <Text style={styles.qText}>
                  {i + 1}. {q.text}
                </Text>
                <Text style={styles.qFocus}>Focus: {q.expectedFocus}</Text>
                <TextInput
                  style={styles.input}
                  value={answers[q.id] ?? ""}
                  onChangeText={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                  placeholder="Your answer…"
                  placeholderTextColor="#6b7280"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ))}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.primary, (!allAnswered || busy) && styles.disabled]}
              onPress={submit}
              disabled={!allAnswered || busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Submit answers</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" | "plain" }) {
  if (items.length === 0) return null;
  const color = tone === "good" ? "#86efac" : tone === "warn" ? "#fcd34d" : "#cbd5e1";
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, i) => (
        <Text key={i} style={[styles.bullet, { color }]}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600" },
  body: { paddingHorizontal: 20, paddingBottom: 48 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#a5b4fc", fontSize: 15, marginTop: 8, marginBottom: 16 },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  pill: {
    backgroundColor: "#6366f1",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  pillText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  qCard: { backgroundColor: "#1b1733", borderRadius: 14, padding: 16, marginTop: 14 },
  qText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  qFocus: { color: "#818cf8", fontSize: 12, marginTop: 4, marginBottom: 10 },
  input: {
    backgroundColor: "#0c0a1e",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 90,
  },
  primary: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  error: { color: "#fca5a5", textAlign: "center", marginTop: 16 },
  scoreBadge: { alignItems: "center", backgroundColor: "#14532d", borderRadius: 16, paddingVertical: 24, marginTop: 16 },
  score: { color: "#fff", fontSize: 44, fontWeight: "800" },
  level: { color: "#e2e8f0", fontSize: 16, fontWeight: "600", marginTop: 4 },
  summary: { color: "#cbd5e1", fontSize: 15, lineHeight: 22, marginTop: 16 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  bullet: { fontSize: 14, lineHeight: 21, marginBottom: 4 },
});
