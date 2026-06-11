import { Redirect, Stack } from "expo-router";

import { useAuth } from "~/auth";

export default function AuthLayout() {
  const { status } = useAuth();
  // Authenticated users never see the auth screens.
  if (status === "authenticated") return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0c0a1e" } }} />;
}
