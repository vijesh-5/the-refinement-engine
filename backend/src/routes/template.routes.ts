import { Router } from "express";
import * as templateController from "../controllers/template.controller";

const router = Router();

router.get("/", templateController.getAllTemplates);
router.get("/categories", templateController.getCategories);
router.get("/category/:category", templateController.getByCategory);
router.get("/:id", templateController.getTemplate);

export default router;
