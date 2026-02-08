import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as contentService from "../services/content.service";
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
    const { id } = req.params;
    const content = await contentService.getContent(id, req.user!.id);

    res.status(200).json({
      success: true,
      data: content,
    });
  },
);

export const updateContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
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
    const { id } = req.params;
    await contentService.deleteContent(id, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  },
);
