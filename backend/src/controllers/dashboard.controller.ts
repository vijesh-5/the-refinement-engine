import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as dashboardService from "../services/dashboard.service";

export const getDashboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dashboard = await dashboardService.getDashboardStats(req.user!.id);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  },
);

export const getGrowthDashboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const growth = await dashboardService.getGrowthStats(req.user!.id);

    res.status(200).json({
      success: true,
      data: growth,
    });
  },
);
