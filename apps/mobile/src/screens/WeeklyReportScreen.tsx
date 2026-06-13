import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { api } from "../api";
import { useNavigation } from "../navigation";
import { DataState } from "../ui/DataState";
import { useAsync } from "../ui/useAsync";

export function WeeklyReportScreen() {
  const { goBack } = useNavigation();
  const { data, loading, error, reload } = useAsync(() => api.reports.weekly(), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <DataState loading={loading} error={error} onRetry={reload} message="Could not load your weekly report.">
        {data ? (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.eyebrow}>Weekly AI report</Text>
            <Text style={styles.headline}>{data.report.headline}</Text>
            <Text style={styles.summary}>{data.report.summary}</Text>

            {data.report.highlights.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Highlights</Text>
                {data.report.highlights.map((item, i) => (
                  <Text key={i} style={styles.bullet}>
                    • {item}
                  </Text>
                ))}
              </>
            ) : null}

            <View style={styles.nextCard}>
              <Text style={styles.nextLabel}>Next focus</Text>
              <Text style={styles.nextText}>{data.report.nextFocus}</Text>
            </View>
          </ScrollView>
        ) : null}
      </DataState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", paddingTop: 56 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  back: { color: "#a5b4fc", fontSize: 16, fontWeight: "600" },
  body: { paddingHorizontal: 20, paddingBottom: 48 },
  eyebrow: { color: "#818cf8", fontSize: 13, fontWeight: "700", marginTop: 8 },
  headline: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 6 },
  summary: { color: "#cbd5e1", fontSize: 15, lineHeight: 23, marginTop: 14 },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 24, marginBottom: 10 },
  bullet: { color: "#86efac", fontSize: 14, lineHeight: 22, marginBottom: 4 },
  nextCard: { backgroundColor: "#1b1733", borderRadius: 14, padding: 16, marginTop: 24 },
  nextLabel: { color: "#a5b4fc", fontSize: 13, fontWeight: "700" },
  nextText: { color: "#fff", fontSize: 15, lineHeight: 22, marginTop: 6 },
});
