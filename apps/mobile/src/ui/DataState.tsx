import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Standard loading / error states for data screens. On error it shows a
 * retry button; otherwise renders its children.
 */
export function DataState({
  loading,
  error,
  onRetry,
  message = "Something went wrong.",
  children,
}: {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  message?: string;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  message: { color: "#fca5a5", fontSize: 15, textAlign: "center", marginBottom: 16 },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
