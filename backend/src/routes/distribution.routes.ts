import { Router } from "express";
import * as distributionController from "../controllers/distribution.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/send", distributionController.sendDistribution);

export default router;
