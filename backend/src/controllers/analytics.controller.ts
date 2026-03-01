import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { analyticsService } from "../services/analytics.service";

/**
 * POST /api/analytics/sync
 * Trigger a manual GSC sync (background-safe, non-blocking UI).
 */
export const syncGSC = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Kick off sync but don't await it — return immediately
    analyticsService
      .syncFromGSC(req.user!.id)
      .then((result) => {
        // Fire-and-forget log
        console.log("[ANALYTICS] GSC sync complete", result);
      })
      .catch((err) => {
        console.error("[ANALYTICS] GSC sync failed", err?.message);
      });

    res.status(202).json({
      success: true,
      message: "GSC sync started in the background.",
    });
  },
);

/**
 * GET /api/analytics/trends?days=28
 * Performance trends across user's content library.
 */
export const getTrends = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const days = parseInt(req.query.days as string) || 28;
    const trends = await analyticsService.getTrends(req.user!.id, days);
    res.json({ success: true, data: trends });
  },
);

/**
 * GET /api/analytics/content/:id?days=90
 * Detailed performance history for a single content item.
 */
export const getContentPerformance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const days = parseInt(req.query.days as string) || 90;
    const data = await analyticsService.getContentPerformance(contentId, req.user!.id, days);
    res.json({ success: true, data });
  },
);

/**
 * POST /api/analytics/content/:id/performance
 * Manual performance data insertion (testing / CSV import).
 */
export const addPerformance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const { impressions, clicks, ctr, avgPosition, date } = req.body;

    if (!date || impressions === undefined) {
      res.status(400).json({ success: false, message: "date and impressions are required" });
      return;
    }

    const row = await analyticsService.upsertPerformance({
      contentId,
      impressions: Number(impressions),
      clicks: Number(clicks ?? 0),
      ctr: Number(ctr ?? 0),
      avgPosition: Number(avgPosition ?? 0),
      date,
    });

    res.status(201).json({ success: true, data: row });
  },
);
