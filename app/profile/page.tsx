import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { User } from "lucide-react";

import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile — SkillPath Academy",
  description: "View learner profiles on SkillPath Academy.",
};

export default async function ProfileIndexPage() {
  const session = await getServerSession(authOptions);

  // If user is signed in, redirect to their own profile
  if (session?.user?.email) {
    const handle = session.user.email.split("@")[0];
    redirect(`/profile/${handle}`);
  }

  // Not signed in — show info page
  return (
    <section className="page-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
        <User className="h-7 w-7 text-muted-foreground" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Learner Profiles
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Sign in to view your profile or browse public profiles at{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">
            /profile/&#123;handle&#125;
          </code>
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/auth/signin" className="btn-primary">
          Sign in
        </Link>
        <Link href="/tracks" className="btn-secondary">
          Browse tracks
        </Link>
      </div>
    </section>
  );
}
