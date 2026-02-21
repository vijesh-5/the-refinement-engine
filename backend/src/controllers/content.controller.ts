import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as contentService from "../services/content.service";
import { versionService, ImprovementMode } from "../services/version.service";
import {
  createContentSchema,
  updateContentSchema,
  listContentSchema,
} from "../utils/content.validation";

export const createContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = createContentSchema.parse(req.body);
    const content = await contentService.createContent(
      req.user!.id,
      data.title,
      data.body,
      data.templateId,
      data.contentType,
      data.status,
      data.generatedOutput,
      data.inputData,
    );

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: content,
    });
  },
);

export const listContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = listContentSchema.parse(req.query);
    const contentType = req.query.contentType as string | undefined;

    const result = await contentService.listUserContent(
      req.user!.id,
      query.status,
      contentType,
      query.limit,
      query.offset,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  },
);

export const getContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const content = await contentService.getContent(id, req.user!.id);

    res.status(200).json({
      success: true,
      data: content,
    });
  },
);

export const updateContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const data = updateContentSchema.parse(req.body);

    const content = await contentService.updateContent(id, req.user!.id, data);

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: content,
    });
  },
);

export const deleteContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    await contentService.deleteContent(id, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  },
);

export const improveContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const { mode } = req.body as { mode: ImprovementMode };

    if (!mode) {
      res.status(400).json({ success: false, message: "Improvement mode is required" });
      return;
    }

    const version = await versionService.improveContent(id, req.user!.id, mode);

    res.status(200).json({
      success: true,
      message: `Content improved using ${mode} mode`,
      data: version,
    });
  },
);

export const getContentVersions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const versions = await versionService.getVersions(id, req.user!.id);

    res.status(200).json({
      success: true,
      data: versions,
    });
  },
);
