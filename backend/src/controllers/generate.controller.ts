import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { generateBlog } from "../services/blog.generator";
import { generateAd } from "../services/ad.generator";
import { generateProductDescription } from "../services/product.generator";
import {
  generateBlogSchema,
  generateAdSchema,
  generateProductSchema,
} from "../utils/generate.validation";

/**
 * Generate blog post using all user inputs
 */
export const createBlog = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Validate and parse request body
    const data = generateBlogSchema.parse(req.body);

    // Generate blog content
    const result = await generateBlog(req.user!.id, data);

    res.status(201).json({
      success: true,
      message: "Blog post generated successfully",
      data: result,
    });
  },
);

/**
 * Generate ad copy using all user inputs
 */
export const createAd = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Validate and parse request body
    const data = generateAdSchema.parse(req.body);

    // Generate ad copy
    const result = await generateAd(req.user!.id, data);

    res.status(201).json({
      success: true,
      message: "Ad copy generated successfully",
      data: result,
    });
  },
);

/**
 * Generate product description using all user inputs
 */
export const createProduct = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Validate and parse request body
    const data = generateProductSchema.parse(req.body);

    // Generate product description
    const result = await generateProductDescription(req.user!.id, data);

    res.status(201).json({
      success: true,
      message: "Product description generated successfully",
      data: result,
    });
  },
);
