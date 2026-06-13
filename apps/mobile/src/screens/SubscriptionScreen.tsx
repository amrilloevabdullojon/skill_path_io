import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { api } from "../api";
import { useNavigation } from "../navigation";
import { DataState } from "../ui/DataState";
import { useAsync } from "../ui/useAsync";

export function SubscriptionScreen() {
  const { goBack } = useNavigation();
  const { data, loading, error, reload } = useAsync(() => api.subscriptions.get(), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <DataState loading={loading} error={error} onRetry={reload} message="Could not load your subscription.">
        {data ? (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.title}>Subscription</Text>

            <View style={styles.currentCard}>
              <Text style={styles.currentPlan}>{data.subscription.planId}</Text>
              <Text style={styles.currentStatus}>{data.subscription.status}</Text>
              {data.subscription.renewsAt ? (
                <Text style={styles.renews}>Renews {data.subscription.renewsAt.slice(0, 10)}</Text>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Plans</Text>
            {data.plans.map((plan) => {
              const current = plan.id === data.subscription.planId;
              return (
                <View key={plan.id} style={[styles.planCard, current && styles.planCurrent]}>
                  <View style={styles.planTop}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {current ? <Text style={styles.currentTag}>Current</Text> : null}
                  </View>
                  <Text style={styles.planPrice}>
                    ${plan.monthlyPriceUsd}/mo · ${plan.annualPriceUsd}/yr
                  </Text>
                  {plan.description ? <Text style={styles.planDesc}>{plan.description}</Text> : null}
                  <Text style={styles.planFeatures}>
                    {plan.featureBundle.features.length} features
                  </Text>
                </View>
              );
            })}
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
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 8, marginBottom: 14 },
  currentCard: { backgroundColor: "#241f44", borderRadius: 14, padding: 18, alignItems: "center" },
  currentPlan: { color: "#fff", fontSize: 22, fontWeight: "800" },
  currentStatus: { color: "#86efac", fontSize: 14, fontWeight: "600", marginTop: 4, textTransform: "capitalize" },
  renews: { color: "#9ca3af", fontSize: 13, marginTop: 4 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 26, marginBottom: 12 },
  planCard: { backgroundColor: "#1b1733", borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#1b1733" },
  planCurrent: { borderColor: "#6366f1" },
  planTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: { color: "#fff", fontSize: 17, fontWeight: "700" },
  currentTag: { color: "#a5b4fc", fontSize: 12, fontWeight: "700" },
  planPrice: { color: "#818cf8", fontSize: 14, marginTop: 4 },
  planDesc: { color: "#9ca3af", fontSize: 13, marginTop: 8, lineHeight: 19 },
  planFeatures: { color: "#6b7280", fontSize: 12, marginTop: 8 },
});
