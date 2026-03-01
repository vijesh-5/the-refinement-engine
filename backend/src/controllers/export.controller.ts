import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { exportService, ExportFormat } from "../services/export.service";

const VALID_FORMATS: ExportFormat[] = ["pdf", "html", "docx"];

/**
 * GET /api/content/:id/export?format=pdf|html|docx
 */
export const exportContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const contentId = req.params.id as string;
    const format = (req.query.format as string)?.toLowerCase() as ExportFormat;

    if (!VALID_FORMATS.includes(format)) {
      res.status(400).json({
        success: false,
        message: `format must be one of: ${VALID_FORMATS.join(", ")}`,
      });
      return;
    }

    const result = await exportService.exportContent({
      contentId,
      userId: req.user!.id,
      format,
    });

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.setHeader("Content-Length", result.buffer.length);
    res.send(result.buffer);
  },
);
