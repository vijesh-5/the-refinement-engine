import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  industry: z.string().optional(),
  tone: z.string().default("Professional"),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
  bannedWords: z.array(z.string()).default([]),
  keySellingPoints: z.array(z.string()).default([]),
});

export const updateBrandSchema = createBrandSchema.partial();
