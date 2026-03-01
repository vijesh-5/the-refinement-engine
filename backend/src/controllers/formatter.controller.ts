import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { formatterService } from "../services/formatter.service";

/**
 * POST /api/format/social
 * Body: { contentId, title, content, platform: "x" | "linkedin" | "caption" | "all", url? }
 */
export const formatSocial = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { content, title, platform, url } = req.body;

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      res.status(400).json({ success: false, message: "Content is required (min 50 chars)" });
      return;
    }

    if (!title || typeof title !== "string") {
      res.status(400).json({ success: false, message: "Title is required" });
      return;
    }

    const validPlatforms = ["x", "linkedin", "caption", "all"];
    if (!validPlatforms.includes(platform)) {
      res.status(400).json({
        success: false,
        message: `Platform must be one of: ${validPlatforms.join(", ")}`,
      });
      return;
    }

    const formats = await formatterService.format({ content, title, platform, url });

    res.json({ success: true, data: formats });
  },
);
