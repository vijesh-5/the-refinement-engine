import { Router } from "express";
import * as persona from "../controllers/persona.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

// List personas for a brand
router.get("/brand/:brandId", persona.listPersonas);
// CRUD on individual personas
router.post("/", persona.createPersona);
router.get("/:id", persona.getPersona);
router.put("/:id", persona.updatePersona);
router.delete("/:id", persona.deletePersona);

export default router;
