import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordClient } from "@/components/auth/reset-password-client";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <section className="page-shell">
      <Suspense fallback={null}>
        <ResetPasswordClient />
      </Suspense>
    </section>
  );
}
