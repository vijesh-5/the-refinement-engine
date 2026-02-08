import { Router } from "express";
import * as contentController from "../controllers/content.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All content routes require authentication
router.use(authenticate);

router.post("/", contentController.createContent);
router.get("/", contentController.listContent);
router.get("/:id", contentController.getContent);
router.patch("/:id", contentController.updateContent);
router.delete("/:id", contentController.deleteContent);

export default router;
