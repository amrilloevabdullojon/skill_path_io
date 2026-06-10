/**
 * API origin the mobile app talks to.
 *
 * Override per environment with EXPO_PUBLIC_API_URL (Expo inlines EXPO_PUBLIC_*
 * vars at build time). Defaults to the local dev server; on a physical device
 * use your machine's LAN IP instead of localhost.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
