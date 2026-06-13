import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { api } from "../api";
import { useNavigation } from "../navigation";
import { DataState } from "../ui/DataState";
import { useAsync } from "../ui/useAsync";

export function JobsScreen() {
  const { goBack } = useNavigation();
  const { data, loading, error, reload } = useAsync(() => api.jobs.match(), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <DataState loading={loading} error={error} onRetry={reload} message="Could not load job matches.">
        {data ? (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.title}>Job matches</Text>

            {data.locked ? (
              <View style={styles.lockedBanner}>
                <Text style={styles.lockedText}>{data.message ?? "Upgrade to unlock full matching."}</Text>
              </View>
            ) : null}

            {data.matches.length === 0 ? (
              <Text style={styles.empty}>No matches yet — add skills to your profile.</Text>
            ) : (
              data.matches.map((job) => (
                <View key={job.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{job.title}</Text>
                    <View style={styles.matchPill}>
                      <Text style={styles.matchText}>{job.matchPercent}%</Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    {job.level} · {job.location} · {job.roleTrack}
                  </Text>
                  {job.missingRequirements.length > 0 ? (
                    <Text style={styles.missing}>Gaps: {job.missingRequirements.join(", ")}</Text>
                  ) : null}
                  {job.recommendation ? <Text style={styles.rec}>{job.recommendation}</Text> : null}
                </View>
              ))
            )}

            {data.marketplaceMatches.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Marketplace roles</Text>
                {data.marketplaceMatches.map((role) => (
                  <View key={role.roleId} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle}>{role.title}</Text>
                      <View style={styles.matchPill}>
                        <Text style={styles.matchText}>{role.matchPercent}%</Text>
                      </View>
                    </View>
                    <Text style={styles.cardMeta}>{role.company}</Text>
                    {role.missingSkills.length > 0 ? (
                      <Text style={styles.missing}>Missing: {role.missingSkills.join(", ")}</Text>
                    ) : null}
                  </View>
                ))}
              </>
            ) : null}
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
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 8, marginBottom: 12 },
  lockedBanner: { backgroundColor: "#3f1d2e", borderRadius: 12, padding: 14, marginBottom: 14 },
  lockedText: { color: "#fcd34d", fontSize: 14 },
  empty: { color: "#6b7280", marginTop: 8 },
  card: { backgroundColor: "#1b1733", borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1, paddingRight: 8 },
  matchPill: { backgroundColor: "#14532d", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  matchText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  cardMeta: { color: "#818cf8", fontSize: 13, marginTop: 4 },
  missing: { color: "#fca5a5", fontSize: 13, marginTop: 6 },
  rec: { color: "#9ca3af", fontSize: 13, marginTop: 6 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 12 },
});
