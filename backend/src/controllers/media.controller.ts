import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as mediaService from "../services/media.service";

/**
 * POST /api/content/:id/assets/generate-image
 * Explicitly user-triggered image generation.
 */
export const generateImage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const { prompt, type } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      res.status(400).json({ success: false, message: "A prompt is required (min 5 chars)" });
      return;
    }

    const asset = await mediaService.mediaService.generateImage({
      contentId,
      userId: req.user!.id,
      prompt: prompt.trim(),
      type: type || "thumbnail",
    });

    res.status(201).json({ success: true, data: asset });
  },
);

/**
 * GET /api/content/:id/assets
 */
export const listAssets = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const assets = await mediaService.mediaService.getAssets(contentId, req.user!.id);
    res.json({ success: true, data: assets });
  },
);

/**
 * DELETE /api/content/:id/assets/:assetId
 */
export const deleteAsset = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const assetId = req.params.assetId as string;
    await mediaService.mediaService.deleteAsset(assetId, req.user!.id);
    res.json({ success: true, message: "Asset deleted" });
  },
);
