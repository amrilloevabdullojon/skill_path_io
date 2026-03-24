"use server";

import { cookies } from "next/headers";

const SUPPORTED_LOCALES = ["en", "ru"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export async function setLocale(locale: string): Promise<void> {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set("skillpath-locale", locale as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
