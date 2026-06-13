import * as SecureStore from "expo-secure-store";

/**
 * First-launch onboarding profile, persisted locally. Drives the track
 * recommendation; the recommendation itself is derived client-side from the
 * catalog (profession -> matching track category), so no API is required.
 */

export type Profession = "QA" | "BA" | "DA";
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type OnboardingProfile = {
  profession: Profession;
  level: Level;
  hoursPerWeek: number;
  createdAt: string;
};

const KEY = "levio.onboarding";

export async function getOnboardingProfile(): Promise<OnboardingProfile | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

export async function saveOnboardingProfile(profile: OnboardingProfile): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(profile));
}

export async function clearOnboardingProfile(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
