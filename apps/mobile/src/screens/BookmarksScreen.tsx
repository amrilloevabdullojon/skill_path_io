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

import type { Bookmark } from "@/lib/contracts/bookmarks";

import { api } from "../api";
import { useNavigation } from "../navigation";

export function BookmarksScreen() {
  const { goBack } = useNavigation();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBookmarks(await api.bookmarks.list());
    } catch {
      setError("Could not load your bookmarks.");
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

  async function remove(id: string) {
    setRemovingId(id);
    const previous = bookmarks;
    setBookmarks((list) => list.filter((b) => b.id !== id));
    try {
      await api.bookmarks.remove(id);
    } catch {
      setBookmarks(previous);
      setError("Could not remove the bookmark.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            error ? (
              <Text style={styles.error}>{error}</Text>
            ) : (
              <Text style={styles.empty}>No saved items yet. Bookmark a module to find it here.</Text>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.type} · {item.tag}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => remove(item.id)}
                disabled={removingId === item.id}
                hitSlop={8}
              >
                {removingId === item.id ? (
                  <ActivityIndicator color="#fca5a5" />
                ) : (
                  <Text style={styles.remove}>Remove</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600", width: 48 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: { color: "#6b7280", marginTop: 8 },
  error: { color: "#fca5a5", marginTop: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1733",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cardMeta: { color: "#9ca3af", fontSize: 12, marginTop: 4, textTransform: "capitalize" },
  remove: { color: "#fca5a5", fontSize: 14, fontWeight: "600" },
});
