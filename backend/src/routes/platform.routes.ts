import { Router } from "express";
import * as platformController from "../controllers/platform.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", platformController.listPlatforms);
router.post("/", platformController.upsertPlatform);
router.put("/:id", platformController.togglePlatform);
router.delete("/:id", platformController.deletePlatform);

export default router;
