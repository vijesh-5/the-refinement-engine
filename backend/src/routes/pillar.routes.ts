import { Router } from "express";
import * as pillarController from "../controllers/pillar.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Authority map & visualization
router.get("/authority-map", pillarController.getAuthorityMap);
router.get("/clusters", pillarController.getClusterVisualization);

// Pillar CRUD
router.get("/", pillarController.list);
router.get("/:id", pillarController.get);
router.post("/", pillarController.create);
router.put("/:id", pillarController.update);
router.delete("/:id", pillarController.remove);

// Cluster sub-resource
router.post("/:id/clusters", pillarController.addCluster);
router.delete("/:id/clusters/:clusterId", pillarController.removeCluster);

export default router;
