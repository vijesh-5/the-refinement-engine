import { z } from "zod";

export const createContentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  body: z.string().min(1, "Body is required"),
  templateId: z.string().uuid().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  body: z.string().min(1, "Body is required").optional(),
  status: z.enum(["DRAFT", "COMPLETE"]).optional(),
});

export const listContentSchema = z.object({
  status: z.enum(["DRAFT", "COMPLETE"]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CreateContentRequest = z.infer<typeof createContentSchema>;
export type UpdateContentRequest = z.infer<typeof updateContentSchema>;
export type ListContentQuery = z.infer<typeof listContentSchema>;
