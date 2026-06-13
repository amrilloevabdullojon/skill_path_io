import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailClient } from "@/components/auth/verify-email-client";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    <section className="page-shell">
      <Suspense fallback={null}>
        <VerifyEmailClient />
      </Suspense>
    </section>
  );
}
