import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "~/auth";
import { registerForPushNotifications } from "~/push";

export default function AppLayout() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      registerForPushNotifications();
    }
  }, [status]);

  if (status === "loading") return null;
  if (status !== "authenticated") return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0c0a1e" } }} />;
}
