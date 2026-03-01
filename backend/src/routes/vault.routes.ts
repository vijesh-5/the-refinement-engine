import { Router } from "express";
import * as vault from "../controllers/vault.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", vault.createDocument);
router.get("/", vault.listDocuments);
router.get("/:id", vault.getDocument);
router.put("/:id", vault.updateDocument);
router.delete("/:id", vault.deleteDocument);

export default router;
