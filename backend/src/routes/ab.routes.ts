import { Router } from "express";
import * as abController from "../controllers/ab.controller";
import { authenticate } from "../middleware/auth.middleware";

// Mounted under /api/content/:id/variants (mergeParams for :id)
const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", abController.createVariant);
router.get("/", abController.listVariants);
router.delete("/:variantId", abController.deleteVariant);

export default router;
