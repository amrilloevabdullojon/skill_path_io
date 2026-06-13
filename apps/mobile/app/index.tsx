import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "~/auth";
import { getOnboardingProfile } from "~/onboarding";

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator color="#6366f1" size="large" />
    </View>
  );
}

/** Entry gate: routes to login, onboarding, or the app based on state. */
export default function Index() {
  const { status } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboardingProfile().then((profile) => setOnboarded(Boolean(profile)));
  }, []);

  if (status === "loading") return <Splash />;
  if (status !== "authenticated") return <Redirect href="/login" />;
  if (onboarded === null) return <Splash />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/tracks" />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: "#0c0a1e", alignItems: "center", justifyContent: "center" },
});
