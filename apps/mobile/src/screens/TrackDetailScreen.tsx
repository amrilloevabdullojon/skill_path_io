import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { TrackCourse } from "@/lib/contracts/tracks";
import type { TrackProgressResponse } from "@/lib/contracts/track-progress";

import { api } from "../api";
import { useNavigation } from "../navigation";

type Module = TrackCourse["modules"][number];

export function TrackDetailScreen({ slug, title }: { slug: string; title?: string }) {
  const { goBack, navigate } = useNavigation();
  const [course, setCourse] = useState<TrackCourse | null>(null);
  const [progress, setProgress] = useState<TrackProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [data, progressData] = await Promise.all([
          api.tracks.get(slug),
          api.tracks.progress(slug).catch(() => null),
        ]);
        if (active) {
          setCourse(data);
          setProgress(progressData);
        }
      } catch {
        if (active) setError("Could not load this track.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const completedModuleIds = new Set(
    (progress?.modules ?? [])
      .filter((module) => module.status === "COMPLETED")
      .map((module) => module.moduleId),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : error || !course ? (
        <Text style={styles.error}>{error ?? "Track not found."}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.meta}>
            {course.category} · {course.level} · {course.modules.length} modules
          </Text>
          {course.description ? <Text style={styles.desc}>{course.description}</Text> : null}

          {progress && progress.totalModules > 0 ? (
            <View style={styles.progressWrap}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round((progress.completedModules / progress.totalModules) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress.completedModules}/{progress.totalModules} modules completed
              </Text>
            </View>
          ) : null}

          {course.skills && course.skills.length > 0 ? (
            <View style={styles.tagRow}>
              {course.skills.slice(0, 8).map((skill) => (
                <Text key={skill} style={styles.tag}>
                  {skill}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Modules</Text>
          {course.modules.length === 0 ? (
            <Text style={styles.empty}>No modules published yet.</Text>
          ) : (
            course.modules
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((module: Module, index: number) => (
                <TouchableOpacity
                  key={module.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigate({
                      name: "ModuleDetail",
                      slug: course.slug,
                      moduleId: module.id,
                      title: module.title,
                    })
                  }
                  style={styles.moduleCard}
                >
                  {completedModuleIds.has(module.id) ? (
                    <Text style={styles.moduleDone}>✓</Text>
                  ) : (
                    <Text style={styles.moduleIndex}>{String(index + 1).padStart(2, "0")}</Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleMeta}>
                      {module.lessons.length} lessons
                      {module.quiz ? " · quiz" : ""}
                      {module.missions.length > 0 ? ` · ${module.missions.length} missions` : ""}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
          )}
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
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 8 },
  meta: { color: "#818cf8", fontSize: 14, marginTop: 6 },
  desc: { color: "#cbd5e1", fontSize: 15, lineHeight: 22, marginTop: 14 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, gap: 8 },
  tag: {
    color: "#c7d2fe",
    backgroundColor: "#1e1b3a",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 12 },
  empty: { color: "#6b7280" },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1733",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  progressWrap: { marginTop: 16 },
  progressBarTrack: { height: 8, borderRadius: 999, backgroundColor: "#1b1733", overflow: "hidden" },
  progressBarFill: { height: 8, borderRadius: 999, backgroundColor: "#22c55e" },
  progressText: { color: "#86efac", fontSize: 13, fontWeight: "600", marginTop: 8 },
  moduleIndex: { color: "#6366f1", fontSize: 18, fontWeight: "800", width: 28 },
  moduleDone: { color: "#22c55e", fontSize: 20, fontWeight: "800", width: 28 },
  moduleTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  moduleMeta: { color: "#9ca3af", fontSize: 13, marginTop: 3 },
  chevron: { color: "#4b5563", fontSize: 22, fontWeight: "700" },
  error: { color: "#fca5a5", textAlign: "center", marginTop: 40 },
});
