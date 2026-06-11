import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { ModuleDetailResponse } from "@/lib/contracts/modules";

import { api } from "../api";
import { useNavigation } from "../navigation";

export function ModuleDetailScreen({ slug, moduleId }: { slug: string; moduleId: string }) {
  const { goBack, navigate } = useNavigation();
  const [data, setData] = useState<ModuleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await api.tracks.getModule(slug, moduleId);
        if (active) setData(result);
      } catch {
        if (active) setError("Could not load this module.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, moduleId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : error || !data ? (
        <Text style={styles.error}>{error ?? "Module not found."}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.eyebrow}>{data.course.title}</Text>
          <Text style={styles.title}>{data.module.title}</Text>
          {data.module.description ? (
            <Text style={styles.desc}>{data.module.description}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Lessons</Text>
          {data.module.lessons.length === 0 ? (
            <Text style={styles.empty}>No lessons yet.</Text>
          ) : (
            data.module.lessons
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <View key={lesson.id} style={styles.lessonCard}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  {lesson.description ? (
                    <Text style={styles.lessonDesc} numberOfLines={3}>
                      {lesson.description}
                    </Text>
                  ) : null}
                  <Text style={styles.lessonMeta}>
                    {lesson.lessonType} · ~{lesson.estimatedDuration} min
                  </Text>
                </View>
              ))
          )}

          {data.module.missions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Missions</Text>
              {data.module.missions.map((mission) => (
                <TouchableOpacity
                  key={mission.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigate({ name: "Mission", slug, moduleId, missionId: mission.id })
                  }
                  style={styles.lessonCard}
                >
                  <Text style={styles.lessonTitle}>{mission.title}</Text>
                  {mission.objective ? (
                    <Text style={styles.lessonDesc} numberOfLines={2}>
                      {mission.objective}
                    </Text>
                  ) : null}
                  <Text style={styles.lessonMeta}>
                    {mission.difficulty} · {mission.xpReward} XP
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          ) : null}

          {data.module.quiz ? (
            <View style={styles.quizCard}>
              <Text style={styles.quizTitle}>{data.module.quiz.title || "Module quiz"}</Text>
              <Text style={styles.quizMeta}>
                {data.module.quiz.questionCount} questions · pass at{" "}
                {data.module.quiz.passingScore}%
              </Text>
              <TouchableOpacity
                style={styles.quizButton}
                activeOpacity={0.85}
                onPress={() => navigate({ name: "Quiz", slug, moduleId })}
              >
                <Text style={styles.quizButtonText}>Start quiz</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600" },
  body: { paddingHorizontal: 20, paddingBottom: 48 },
  eyebrow: { color: "#818cf8", fontSize: 13, fontWeight: "600", marginTop: 8 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 4 },
  desc: { color: "#cbd5e1", fontSize: 15, lineHeight: 22, marginTop: 12 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 26, marginBottom: 12 },
  empty: { color: "#6b7280" },
  lessonCard: { backgroundColor: "#1b1733", borderRadius: 12, padding: 14, marginBottom: 10 },
  lessonTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  lessonDesc: { color: "#9ca3af", fontSize: 14, marginTop: 6, lineHeight: 20 },
  lessonMeta: { color: "#6366f1", fontSize: 12, marginTop: 8 },
  quizCard: {
    backgroundColor: "#15132b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#312e62",
    padding: 18,
    marginTop: 24,
  },
  quizTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  quizMeta: { color: "#a5b4fc", fontSize: 13, marginTop: 4 },
  quizButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  quizButtonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#fca5a5", textAlign: "center", marginTop: 40 },
});
