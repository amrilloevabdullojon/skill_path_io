import { z } from "zod";

/** Contract for `GET /api/v1/reports/weekly`. */

export const WeeklyAiReportSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  nextFocus: z.string(),
});

export const WeeklyReportResponseSchema = z.object({
  report: WeeklyAiReportSchema,
});
export type WeeklyReportResponse = z.infer<typeof WeeklyReportResponseSchema>;
