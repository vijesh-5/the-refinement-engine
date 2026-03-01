import { Router } from "express";
import * as formatterController from "../controllers/formatter.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/social", formatterController.formatSocial);

export default router;
