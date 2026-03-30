import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { distributionService } from "../services/distribution.service";
import { z } from "zod";

const sendSchema = z.object({
  contentId: z.string().uuid("Invalid content ID"),
  platform: z.enum(["BEAR_BLOG", "X", "REDDIT"]),
});

/** POST /api/distribution/send */
export const sendDistribution = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = sendSchema.parse(req.body);

    const result = await distributionService.send(
      req.user!.id,
      data.contentId,
      data.platform
    );

    res.json({
      success: true,
      message: `Content sent to ${data.platform} successfully`,
      data: result,
    });
  }
);
