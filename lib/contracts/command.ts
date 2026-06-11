import { z } from "zod";

/** Contract for `GET /api/v1/command` — the command-palette catalog. */

const TrackTagSchema = z.enum(["QA", "BA", "DA"]);

export const CommandTrackSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      order: z.number(),
    }),
  ),
});

export const CommandMissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  roleContext: z.string(),
  category: TrackTagSchema,
});

export const CommandJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.string(),
  location: z.string(),
  roleTrack: TrackTagSchema,
});

export const CommandResponseSchema = z.object({
  tracks: z.array(CommandTrackSchema),
  missions: z.array(CommandMissionSchema),
  jobs: z.array(CommandJobSchema),
});
export type CommandResponse = z.infer<typeof CommandResponseSchema>;
