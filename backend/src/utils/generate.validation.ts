import { z } from "zod";

// Blog Generator Validation
export const generateBlogSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  audience: z.string().min(3, "Audience must be specified"),
  tone: z.string().min(3, "Tone must be specified"),
  keywords: z.array(z.string()).optional().default([]),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  intent: z.string().optional(),
  brandId: z.string().optional(),
});

// Ad Copywriter Validation
export const generateAdSchema = z.object({
  platform: z.enum(["Facebook", "Instagram", "Google", "LinkedIn"]),
  product: z.string().min(3, "Product/service must be specified"),
  targetAudience: z.string().min(3, "Target audience must be specified"),
  keyBenefit: z.string().min(3, "Key benefit must be specified"),
  tone: z
    .enum(["direct", "playful", "urgent", "professional"])
    .default("professional"),
  brandId: z.string().optional(),
});

// Product Description Validation
export const generateProductSchema = z.object({
  productName: z.string().min(3, "Product name is required"),
  features: z.string().min(10, "Product features are required"),
  tone: z.string().min(3, "Tone must be specified"),
  targetAudience: z.string().min(3, "Target audience must be specified"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  brandId: z.string().optional(),
});

export type GenerateBlogRequest = z.infer<typeof generateBlogSchema>;
export type GenerateAdRequest = z.infer<typeof generateAdSchema>;
export type GenerateProductRequest = z.infer<typeof generateProductSchema>;
