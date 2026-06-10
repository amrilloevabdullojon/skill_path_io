import * as SecureStore from "expo-secure-store";

/**
 * Token persistence backed by the device keychain / keystore via expo-secure-store.
 * Access and refresh tokens are stored separately so the access token can be
 * rotated without touching the long-lived refresh token.
 */

const ACCESS_KEY = "levio.accessToken";
const REFRESH_KEY = "levio.refreshToken";

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
