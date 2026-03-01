import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import { vaultService } from "../services/vault.service";

export const createDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, content } = req.body;
  if (!title || !content) { res.status(400).json({ success: false, message: "title and content required" }); return; }
  const doc = await vaultService.create(req.user!.id, { title, content });
  res.status(201).json({ success: true, data: doc });
});

export const listDocuments = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const docs = await vaultService.list(req.user!.id);
  res.json({ success: true, data: docs });
});

export const getDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const doc = await vaultService.get(req.params.id as string, req.user!.id);
  res.json({ success: true, data: doc });
});

export const updateDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const doc = await vaultService.update(req.params.id as string, req.user!.id, req.body);
  res.json({ success: true, data: doc });
});

export const deleteDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await vaultService.delete(req.params.id as string, req.user!.id);
  res.json({ success: true, message: "Document deleted" });
});
