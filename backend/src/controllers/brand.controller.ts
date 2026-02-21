import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { prisma } from "../config/database";
import { createBrandSchema, updateBrandSchema } from "../utils/brand.validation";

export const createBrand = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = createBrandSchema.parse(req.body);
    const brand = await prisma.brandProfile.create({
      data: {
        ...data,
        userId: req.user!.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Brand profile created successfully",
      data: brand,
    });
  },
);

export const getBrands = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const brands = await prisma.brandProfile.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: brands,
    });
  },
);

export const getBrand = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const brand = await prisma.brandProfile.findUnique({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: brand,
    });
  },
);

export const updateBrand = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const data = updateBrandSchema.parse(req.body);

    const brand = await prisma.brandProfile.findUnique({
      where: { id, userId: req.user!.id },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand profile not found",
      });
    }

    const updatedBrand = await prisma.brandProfile.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Brand profile updated successfully",
      data: updatedBrand,
    });
  },
);

export const deleteBrand = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const brand = await prisma.brandProfile.findUnique({
      where: { id, userId: req.user!.id },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Brand profile not found",
      });
    }

    await prisma.brandProfile.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Brand profile deleted successfully",
    });
  },
);
