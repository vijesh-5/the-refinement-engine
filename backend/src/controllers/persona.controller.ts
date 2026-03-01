import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { personaService } from "../services/persona.service";

export const createPersona = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { brandId, name, description, toneBias, vocabularyBias } = req.body;
  if (!brandId || !name) { res.status(400).json({ success: false, message: "brandId and name required" }); return; }
  const persona = await personaService.create({ brandId, name, description, toneBias, vocabularyBias });
  res.status(201).json({ success: true, data: persona });
});

export const listPersonas = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { brandId } = req.params;
  const personas = await personaService.listByBrand(brandId as string, req.user!.id);
  res.json({ success: true, data: personas });
});

export const getPersona = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const persona = await personaService.get(req.params.id as string, req.user!.id);
  res.json({ success: true, data: persona });
});

export const updatePersona = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const persona = await personaService.update(req.params.id as string, req.user!.id, req.body);
  res.json({ success: true, data: persona });
});

export const deletePersona = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await personaService.delete(req.params.id as string, req.user!.id);
  res.json({ success: true, message: "Persona deleted" });
});
