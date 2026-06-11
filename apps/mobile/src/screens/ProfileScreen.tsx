import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { ProgressResponse } from "@/lib/contracts/progress";

import { api } from "../api";
import { useAuth } from "../auth";
import { useNavigation } from "../navigation";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { goBack } = useNavigation();
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await api.me.progress());
    } catch {
      setError("Could not load your progress.");
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : (
        <FlatList
          data={data?.attempts ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View>
              <Text style={styles.name}>{user?.email ?? "Learner"}</Text>
              <Text style={styles.role}>{user?.role}</Text>

              <View style={styles.statsRow}>
                <Stat label="Attempts" value={data?.stats.totalAttempts ?? 0} />
                <Stat label="Passed" value={data?.stats.passedAttempts ?? 0} />
                <Stat label="Avg score" value={`${data?.stats.averageScore ?? 0}%`} />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.sectionTitle}>Recent quiz attempts</Text>
            </View>
          }
          ListEmptyComponent={
            error ? null : <Text style={styles.empty}>No quiz attempts yet. Take a quiz to start.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.attemptCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.attemptTitle}>{item.moduleTitle}</Text>
                <Text style={styles.attemptMeta}>
                  {item.trackTitle} · {item.correctAnswers}/{item.totalQuestions} · {formatDate(item.submittedAt)}
                </Text>
              </View>
              <View style={[styles.scorePill, item.passed ? styles.pass : styles.fail]}>
                <Text style={styles.scoreText}>{item.score}%</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600" },
  logout: { color: "#fca5a5", fontSize: 14, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  name: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 8 },
  role: { color: "#818cf8", fontSize: 13, fontWeight: "600", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  statCard: {
    flex: 1,
    backgroundColor: "#1b1733",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "800" },
  statLabel: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 26, marginBottom: 12 },
  empty: { color: "#6b7280", marginTop: 8 },
  error: { color: "#fca5a5", marginTop: 12 },
  attemptCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1733",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  attemptTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  attemptMeta: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  scorePill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pass: { backgroundColor: "#14532d" },
  fail: { backgroundColor: "#3f1d2e" },
  scoreText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
