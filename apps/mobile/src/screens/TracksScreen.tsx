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

import type { TracksCatalogResponse } from "@/lib/contracts/tracks";

import { api } from "../api";
import { useAuth } from "../auth";

type Course = TracksCatalogResponse["courses"][number];

export function TracksScreen() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const catalog = await api.tracks.list();
      setCourses(catalog.courses);
    } catch {
      setError("Could not load the catalog.");
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
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Learning tracks</Text>
          {user ? <Text style={styles.subtitle}>{user.email}</Text> : null}
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No published tracks yet.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: item.color || "#6366f1" }]}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.category} · {item.level} · {item.modules.length} modules
              </Text>
              {item.shortDescription ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.shortDescription}
                </Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 64 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#a5b4fc", fontSize: 13, marginTop: 2 },
  logout: { color: "#fca5a5", fontSize: 14, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#1b1733",
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cardMeta: { color: "#818cf8", fontSize: 13, marginTop: 4 },
  cardDesc: { color: "#9ca3af", fontSize: 14, marginTop: 8 },
  empty: { color: "#6b7280", textAlign: "center", marginTop: 40 },
  error: { color: "#fca5a5", textAlign: "center", marginTop: 40 },
});
