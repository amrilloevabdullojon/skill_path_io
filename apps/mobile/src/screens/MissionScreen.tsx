import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { ModuleDetailResponse } from "@/lib/contracts/modules";
import type { MissionSubmissionResult } from "@/lib/contracts/missions";

import { api } from "../api";
import { useNavigation } from "../navigation";

type Mission = ModuleDetailResponse["module"]["missions"][number];

export function MissionScreen({
  slug,
  moduleId,
  missionId,
}: {
  slug: string;
  moduleId: string;
  missionId: string;
}) {
  const { goBack } = useNavigation();
  const [mission, setMission] = useState<Mission | null>(null);
  const [submission, setSubmission] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MissionSubmissionResult["evaluation"] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const module = await api.tracks.getModule(slug, moduleId);
        const found = module.module.missions.find((m) => m.id === missionId) ?? null;
        if (active) {
          if (!found) setError("Mission not found.");
          else setMission(found);
        }
      } catch {
        if (active) setError("Could not load the mission.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, moduleId, missionId]);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.tracks.submitMission(slug, moduleId, missionId, { submission });
      setResult(res.evaluation);
    } catch {
      setError("Could not submit. Check your plan limits and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const verdictStyle =
    result?.verdict === "Excellent"
      ? styles.vExcellent
      : result?.verdict === "Good"
        ? styles.vGood
        : styles.vNeeds;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : error && !mission ? (
        <Text style={styles.error}>{error}</Text>
      ) : result ? (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={[styles.verdictBadge, verdictStyle]}>
            <Text style={styles.verdictScore}>{result.score}</Text>
            <Text style={styles.verdictLabel}>{result.verdict}</Text>
          </View>

          <Text style={styles.sectionTitle}>Strengths</Text>
          {result.strengths.map((s, i) => (
            <Text key={`s${i}`} style={styles.bulletGood}>
              • {s}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Improvements</Text>
          {result.improvements.map((s, i) => (
            <Text key={`i${i}`} style={styles.bulletWarn}>
              • {s}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Recovery plan</Text>
          {result.recoveryPlan.map((s, i) => (
            <Text key={`r${i}`} style={styles.bullet}>
              {i + 1}. {s}
            </Text>
          ))}

          <TouchableOpacity style={styles.primaryButton} onPress={goBack}>
            <Text style={styles.primaryButtonText}>Back to module</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : mission ? (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>{mission.title}</Text>
          {mission.scenario ? (
            <>
              <Text style={styles.label}>Scenario</Text>
              <Text style={styles.paragraph}>{mission.scenario}</Text>
            </>
          ) : null}
          {mission.objective ? (
            <>
              <Text style={styles.label}>Objective</Text>
              <Text style={styles.paragraph}>{mission.objective}</Text>
            </>
          ) : null}

          <Text style={styles.label}>Your submission</Text>
          <TextInput
            style={styles.input}
            value={submission}
            onChangeText={setSubmission}
            placeholder="Write your solution / artifact here…"
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, (submission.trim().length === 0 || submitting) && styles.disabled]}
            onPress={onSubmit}
            disabled={submission.trim().length === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit for evaluation</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600" },
  body: { paddingHorizontal: 20, paddingBottom: 48 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 8 },
  label: { color: "#818cf8", fontSize: 13, fontWeight: "700", marginTop: 20, marginBottom: 6 },
  paragraph: { color: "#cbd5e1", fontSize: 15, lineHeight: 22 },
  input: {
    backgroundColor: "#1b1733",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 160,
    marginTop: 4,
  },
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
  verdictBadge: { alignItems: "center", borderRadius: 16, paddingVertical: 24, marginTop: 12 },
  vExcellent: { backgroundColor: "#14532d" },
  vGood: { backgroundColor: "#1e3a5f" },
  vNeeds: { backgroundColor: "#3f1d2e" },
  verdictScore: { color: "#fff", fontSize: 44, fontWeight: "800" },
  verdictLabel: { color: "#e2e8f0", fontSize: 16, fontWeight: "600", marginTop: 4 },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 22, marginBottom: 8 },
  bullet: { color: "#cbd5e1", fontSize: 14, lineHeight: 21, marginBottom: 4 },
  bulletGood: { color: "#86efac", fontSize: 14, lineHeight: 21, marginBottom: 4 },
  bulletWarn: { color: "#fcd34d", fontSize: 14, lineHeight: 21, marginBottom: 4 },
});
