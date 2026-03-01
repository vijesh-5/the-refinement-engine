import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

// Library-wide trends
router.get("/trends", analyticsController.getTrends);

// GSC sync trigger (fire-and-forget, returns 202)
router.post("/sync", analyticsController.syncGSC);

// Per-content performance
router.get("/content/:id", analyticsController.getContentPerformance);
router.post("/content/:id/performance", analyticsController.addPerformance);

export default router;
