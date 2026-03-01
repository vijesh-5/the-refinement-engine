import { Router } from "express";
import * as shareController from "../controllers/share.controller";
import { authenticate } from "../middleware/auth.middleware";

// Mounted under /api/content/:id/share
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", shareController.createLink);
router.get("/", shareController.listLinks);
router.delete("/:linkId", shareController.revokeLink);

export default router;
