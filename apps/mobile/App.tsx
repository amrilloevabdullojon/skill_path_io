import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "./src/auth";
import { NavigationProvider, useNavigation } from "./src/navigation";
import { getOnboardingProfile, type OnboardingProfile } from "./src/onboarding";
import { BookmarksScreen } from "./src/screens/BookmarksScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MissionScreen } from "./src/screens/MissionScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ModuleDetailScreen } from "./src/screens/ModuleDetailScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { QuizScreen } from "./src/screens/QuizScreen";
import { TrackDetailScreen } from "./src/screens/TrackDetailScreen";
import { TracksScreen } from "./src/screens/TracksScreen";

function Router() {
  const { route } = useNavigation();

  switch (route.name) {
    case "Profile":
      return <ProfileScreen />;
    case "Bookmarks":
      return <BookmarksScreen />;
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

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator color="#6366f1" size="large" />
    </View>
  );
}

function AuthedApp() {
  // undefined = still loading the stored profile; null = needs onboarding.
  const [profile, setProfile] = useState<OnboardingProfile | null | undefined>(undefined);

  useEffect(() => {
    getOnboardingProfile().then(setProfile);
  }, []);

  if (profile === undefined) return <Splash />;
  if (profile === null) return <OnboardingScreen onComplete={setProfile} />;

  return (
    <NavigationProvider>
      <Router />
    </NavigationProvider>
  );
}

function AuthScreens() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return mode === "login" ? (
    <LoginScreen onShowRegister={() => setMode("register")} />
  ) : (
    <RegisterScreen onShowLogin={() => setMode("login")} />
  );
}

function Root() {
  const { status } = useAuth();

  if (status === "loading") return <Splash />;
  if (status !== "authenticated") return <AuthScreens />;
  return <AuthedApp />;
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
