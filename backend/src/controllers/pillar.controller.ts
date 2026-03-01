import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as pillarService from "../services/pillar.service";

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const pillars = await pillarService.getPillars(req.user!.id);
  res.json({ success: true, data: pillars });
});

export const get = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const pillar = await pillarService.getPillar(id, req.user!.id);
  if (!pillar) {
    res.status(404).json({ success: false, message: "Pillar not found" });
    return;
  }
  res.json({ success: true, data: pillar });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ success: false, message: "Name is required (min 2 chars)" });
    return;
  }
  const pillar = await pillarService.createPillar(req.user!.id, { name: name.trim(), description });
  res.status(201).json({ success: true, data: pillar });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const pillar = await pillarService.updatePillar(id, req.user!.id, req.body);
  res.json({ success: true, data: pillar });
});

export const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  await pillarService.deletePillar(id, req.user!.id);
  res.json({ success: true, message: "Pillar deleted" });
});

// ─── Cluster sub-resource ────────────────────────────────────────────────────

export const addCluster = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, keywords } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ success: false, message: "Cluster name is required (min 2 chars)" });
    return;
  }
  const cluster = await pillarService.addCluster(id, req.user!.id, {
    name: name.trim(),
    keywords: Array.isArray(keywords) ? keywords : [],
  });
  res.status(201).json({ success: true, data: cluster });
});

export const removeCluster = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const clusterId = req.params.clusterId as string;
  await pillarService.deleteCluster(clusterId, req.user!.id);
  res.json({ success: true, message: "Cluster deleted" });
});

// ─── Authority Map (Deterministic Intelligence) ──────────────────────────────

export const getAuthorityMap = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const map = await pillarService.getAuthorityMap(req.user!.id);
  res.json({ success: true, data: map });
});

export const getClusterVisualization = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const visualization = await pillarService.getClusterVisualization(req.user!.id);
  res.json({ success: true, data: visualization });
});
