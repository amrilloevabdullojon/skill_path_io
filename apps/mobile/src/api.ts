import { createApiClient } from "@/lib/api/v1/client";

import { API_BASE_URL } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./storage";

/**
 * Custom fetch that transparently refreshes an expired access token once on a
 * 401 and retries the original request. Keeps token rotation invisible to screens.
 */
async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const refreshToken = await getRefreshToken();
  if (!refreshToken) return response;

  const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshResponse.ok) {
    await clearTokens();
    return response;
  }

  const tokens = (await refreshResponse.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  await saveTokens(tokens.accessToken, tokens.refreshToken);

  return fetch(input, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${tokens.accessToken}` },
  });
}

/** Shared, typed Levio API client. Pulls the current access token from secure storage. */
export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken,
  fetch: authedFetch,
});
