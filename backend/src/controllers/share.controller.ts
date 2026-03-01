import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { shareService } from "../services/share.service";

/**
 * POST /api/content/:id/share  — create or return public link
 */
export const createLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const link = await shareService.createLink(req.params.id as string, req.user!.id);
    res.status(201).json({ success: true, data: link });
  },
);

/**
 * GET /api/content/:id/share  — list links for a content item
 */
export const listLinks = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const links = await shareService.listLinks(req.params.id as string, req.user!.id);
    res.json({ success: true, data: links });
  },
);

/**
 * DELETE /api/content/:id/share/:linkId  — revoke a link
 */
export const revokeLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await shareService.revokeLink(req.params.linkId as string, req.user!.id);
    res.json({ success: true, message: "Link revoked" });
  },
);

/**
 * GET /public/:slug  — unauthenticated public read-only view
 */
export const getPublicView = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug as string;
    const content = await shareService.getBySlug(slug);
    res.json({ success: true, data: content });
  },
);
