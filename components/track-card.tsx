import Link from "next/link";
import { Clock3, Layers3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RuntimeTrackCardData } from "@/lib/learning/runtime-content";

type TrackCardProps = {
  track: RuntimeTrackCardData;
};

const trackAccentBySlug: Record<string, string> = {
  "qa-engineer": "track-badge-qa",
  "business-analyst": "track-badge-ba",
  "data-analyst": "track-badge-da",
};

export function TrackCard({ track }: TrackCardProps) {
  const accent = trackAccentBySlug[track.slug] ?? "track-badge-qa";

  return (
    <Card variant="module" className="group h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{track.title}</CardTitle>
          <Badge variant="secondary">{track.level}</Badge>
        </div>
        <CardDescription>{track.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {track.durationWeeks} weeks
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers3 className="h-4 w-4" />
            {track.modules.length} modules
          </span>
        </div>

        <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", accent)}>
          {track.slug.includes("qa") ? "QA track" : track.slug.includes("business") ? "BA track" : "DA track"}
        </div>

        <Link
          href={`/tracks/${track.slug}`}
          className={cn(buttonVariants(), "w-full transition-all group-hover:-translate-y-0.5")}
        >
          Open track
        </Link>
      </CardContent>
    </Card>
  );
}
