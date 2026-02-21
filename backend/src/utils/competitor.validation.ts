import { z } from "zod";

export const analyzeCompetitorSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  brandProfileId: z.string().uuid("Must be a valid brand profile ID"),
});

export type AnalyzeCompetitorInput = z.infer<typeof analyzeCompetitorSchema>;
