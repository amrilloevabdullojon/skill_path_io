import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "@/styles/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import { NetworkStatus } from "@/components/global/network-status";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://levio.app"),
  title: {
    default: "Levio — Level Up Your Career",
    template: "%s — Levio",
  },
  description: "AI-powered career tracks for QA Engineers, Business Analysts, and Data Analysts. Learn by doing, get job-ready faster.",
  keywords: ["QA engineer", "business analyst", "data analyst", "career tracks", "AI learning", "skill development", "tech career"],
  authors: [{ name: "Levio" }],
  creator: "Levio",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://levio.app",
    siteName: "Levio",
    title: "Levio — Level Up Your Career",
    description: "AI-powered career tracks for QA, BA, and DA professionals. Learn by doing, get job-ready faster.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Levio — Level Up Your Career",
    description: "AI-powered career tracks for QA, BA, and DA professionals.",
    creator: "@levio_app",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
              <div className="absolute -left-44 top-[-180px] h-[440px] w-[440px] rounded-full bg-indigo-500/14 blur-3xl" />
              <div className="absolute right-[-180px] top-[8%] h-[420px] w-[420px] rounded-full bg-purple-500/14 blur-3xl" />
              <div className="absolute bottom-[-220px] left-1/3 h-[460px] w-[460px] rounded-full bg-violet-500/12 blur-3xl" />
              <div className="absolute left-[42%] top-[16%] h-[140px] w-[140px] rounded-full bg-indigo-400/10 blur-2xl" />
            </div>
            <NetworkStatus />
            <AppShell>{children}</AppShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
