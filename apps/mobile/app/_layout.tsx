import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "~/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0c0a1e" },
          animation: "slide_from_right",
        }}
      />
    </AuthProvider>
  );
}
