import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { abService } from "../services/ab.service";

/**
 * POST /api/content/:id/variants
 * Create a new A/B variant — always explicit user action.
 * Body: { variantLabel?, focus? }
 */
export const createVariant = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const { variantLabel, focus } = req.body;

    const variant = await abService.createVariant({
      contentId,
      userId: req.user!.id,
      variantLabel,
      focus,
    });

    res.status(201).json({ success: true, data: variant });
  },
);

/**
 * GET /api/content/:id/variants
 * List all variants for a content item.
 */
export const listVariants = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const variants = await abService.listVariants(contentId, req.user!.id);
    res.json({ success: true, data: variants });
  },
);

/**
 * DELETE /api/content/:id/variants/:variantId
 */
export const deleteVariant = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const variantId = req.params.variantId as string;
    await abService.deleteVariant(variantId, req.user!.id);
    res.json({ success: true, message: "Variant deleted" });
  },
);
