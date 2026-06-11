import { Redirect, Stack } from "expo-router";

import { useAuth } from "~/auth";

export default function AppLayout() {
  const { status } = useAuth();
  if (status === "loading") return null;
  if (status !== "authenticated") return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0c0a1e" } }} />;
}
