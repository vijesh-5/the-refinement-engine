import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as templateService from "../services/template.service";

export const getAllTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    const templates = await templateService.getAllTemplates();

    res.status(200).json({
      success: true,
      data: templates,
    });
  },
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await templateService.getTemplateCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  },
);

export const getByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { category } = req.params;
    const templates = await templateService.getTemplatesByCategory(category);

    res.status(200).json({
      success: true,
      data: templates,
    });
  },
);

export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const template = await templateService.getTemplate(id);

  if (!template) {
    return res.status(404).json({
      success: false,
      error: "Template not found",
    });
  }

  res.status(200).json({
    success: true,
    data: template,
  });
});
