import { Router } from "express";
import * as generateController from "../controllers/generate.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All generation routes require authentication
router.use(authenticate);

// Generation endpoints
router.post("/blog", generateController.createBlog);
router.post("/ad", generateController.createAd);
router.post("/product", generateController.createProduct);

export default router;
