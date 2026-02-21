import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  analyzeCompetitor,
  getCompetitors,
  deleteCompetitor,
} from "../controllers/competitor.controller";

const router = Router();

router.use(authenticate);

router.post("/analyze", analyzeCompetitor);
router.get("/brand/:brandId", getCompetitors);
router.delete("/:id", deleteCompetitor);

export default router;
