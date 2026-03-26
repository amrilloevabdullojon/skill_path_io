import type { Metadata } from "next";

import { TrackCard } from "@/components/track-card";
import { FadeInUp } from "@/components/ui/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { resolveRuntimeCatalog, toRuntimeTrackCardData } from "@/lib/learning/runtime-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learning Tracks — SkillPath Academy",
  description: "Browse all QA, BA, and DA career tracks. Structured modules, quizzes, and AI missions for every level.",
  openGraph: {
    title: "Learning Tracks — SkillPath Academy",
    type: "website",
  },
};

export default async function TracksPage() {
  const catalog = await resolveRuntimeCatalog({ includeCourseEntities: true });
  const runtimeTracks = catalog.courses
    .filter((course) => course.category === "QA" || course.category === "BA" || course.category === "DA")
    .map(toRuntimeTrackCardData);

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Tracks"
        title="Learning Tracks"
        description="Select a track to view modules, practical tasks, quizzes, and simulations."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {runtimeTracks.map((track, i) => (
          <FadeInUp key={track.id} delay={i * 0.05}>
            <TrackCard track={track} />
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}
