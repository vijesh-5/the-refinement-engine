import { Router } from "express";
import * as mediaController from "../controllers/media.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// These routes are mounted under /api/content/:id/assets
router.post("/generate-image", mediaController.generateImage);
router.get("/", mediaController.listAssets);
router.delete("/:assetId", mediaController.deleteAsset);

export default router;
