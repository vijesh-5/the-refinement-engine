import { Request, Response, NextFunction } from "express";
import { competitorService } from "../services/competitor.service";
import { analyzeCompetitorSchema } from "../utils/competitor.validation";

export const analyzeCompetitor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = analyzeCompetitorSchema.parse(req.body);
    const userId = (req as any).userId;

    const insight = await competitorService.analyzeCompetitorUrl(
      data.url,
      data.brandProfileId,
      userId
    );

    res.status(201).json({
      success: true,
      data: insight,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompetitors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brandId = req.params.brandId as string;
    const userId = (req as any).userId;

    const competitors = await competitorService.getCompetitorsByBrand(
      brandId,
      userId
    );

    res.json({
      success: true,
      data: competitors,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompetitor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;

    await competitorService.deleteCompetitor(id, userId);

    res.json({
      success: true,
      message: "Competitor insight deleted",
    });
  } catch (error) {
    next(error);
  }
};
