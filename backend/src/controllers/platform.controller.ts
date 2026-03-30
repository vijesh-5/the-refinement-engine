import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { platformService } from "../services/platform.service";
import { z } from "zod";

const upsertSchema = z.object({
  platformName: z.enum(["BEAR_BLOG", "X", "REDDIT"]),
  credentials: z.record(z.string()),
  isActive: z.boolean().optional().default(true),
});

const toggleSchema = z.object({
  isActive: z.boolean(),
});

/** GET /api/platforms */
export const listPlatforms = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const platforms = await platformService.list(req.user!.id);
    res.json({ success: true, data: platforms });
  }
);

/** POST /api/platforms */
export const upsertPlatform = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = upsertSchema.parse(req.body);
    const platform = await platformService.upsert(
      req.user!.id,
      data.platformName,
      data.credentials,
      data.isActive
    );
    res.status(200).json({ success: true, data: platform });
  }
);

/** PUT /api/platforms/:id */
export const togglePlatform = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = toggleSchema.parse(req.body);
    const platform = await platformService.toggle(
      req.user!.id,
      req.params.id as string,
      data.isActive
    );
    res.json({ success: true, data: platform });
  }
);

/** DELETE /api/platforms/:id */
export const deletePlatform = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await platformService.remove(req.user!.id, req.params.id as string);
    res.json({ success: true, message: "Platform disconnected" });
  }
);
