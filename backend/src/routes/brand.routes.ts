import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as brandController from "../controllers/brand.controller";

const router = Router();

// All brand routes require authentication
router.use(authenticate);

router.post("/", brandController.createBrand);
router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrand);
router.patch("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);

export default router;
