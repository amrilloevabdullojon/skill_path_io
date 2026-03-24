import { TrackCard } from "@/components/track-card";
import { PageHeader } from "@/components/ui/page-header";
import { resolveRuntimeCatalog, toRuntimeTrackCardData } from "@/lib/learning/runtime-content";

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
        {runtimeTracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </section>
  );
}
