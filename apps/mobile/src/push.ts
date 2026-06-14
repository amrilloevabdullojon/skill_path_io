import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { api } from "./api";

/**
 * Show notifications even while the app is foregrounded. Without a handler,
 * expo-notifications suppresses the banner when the app is open.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Pull a navigation target out of a notification's `data` payload, if present. */
function hrefFromNotification(notification: Notifications.Notification): string | null {
  const href = notification.request.content.data?.href;
  return typeof href === "string" && href.startsWith("/") ? href : null;
}

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
    // HIGH importance is required for heads-up banners; it pairs with the
    // server sending priority:"high" + channelId:"default".
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
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

/**
 * Navigate to the `href` carried by a tapped notification (the server sends
 * e.g. `{ href: "/dashboard?tab=skills#xp" }` for a certificate). Also handles
 * the cold-start case where the app was launched by tapping a notification.
 */
export function useNotificationNavigation(): void {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Cold start: app opened from a notification tap.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!mounted || !response) return;
      const href = hrefFromNotification(response.notification);
      if (href) router.push(href);
    });

    // Warm: notification tapped while the app is running.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const href = hrefFromNotification(response.notification);
      if (href) router.push(href);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [router]);
}
