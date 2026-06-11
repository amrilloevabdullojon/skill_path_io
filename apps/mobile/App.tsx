import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "./src/auth";
import { NavigationProvider, useNavigation } from "./src/navigation";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MissionScreen } from "./src/screens/MissionScreen";
import { ModuleDetailScreen } from "./src/screens/ModuleDetailScreen";
import { QuizScreen } from "./src/screens/QuizScreen";
import { TrackDetailScreen } from "./src/screens/TrackDetailScreen";
import { TracksScreen } from "./src/screens/TracksScreen";

function Router() {
  const { route } = useNavigation();

  switch (route.name) {
    case "TrackDetail":
      return <TrackDetailScreen slug={route.slug} title={route.title} />;
    case "ModuleDetail":
      return <ModuleDetailScreen slug={route.slug} moduleId={route.moduleId} />;
    case "Quiz":
      return <QuizScreen slug={route.slug} moduleId={route.moduleId} />;
    case "Mission":
      return (
        <MissionScreen slug={route.slug} moduleId={route.moduleId} missionId={route.missionId} />
      );
    case "Tracks":
    default:
      return <TracksScreen />;
  }
}

function Root() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (status !== "authenticated") {
    return <LoginScreen />;
  }

  return (
    <NavigationProvider>
      <Router />
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#0c0a1e",
    alignItems: "center",
    justifyContent: "center",
  },
});
