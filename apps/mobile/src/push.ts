import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { api } from "./api";

/**
 * Request notification permission, obtain the Expo push token, and register it
 * with the API. Best-effort: silently no-ops on simulators or when permission
 * is denied. Safe to call repeatedly (registration is idempotent server-side).
 */
export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "expo";
    await api.me.registerPushToken({ token: tokenData.data, platform });
  } catch {
    // Token acquisition can fail outside a configured EAS project — ignore.
  }
}
