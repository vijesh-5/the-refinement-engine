import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.post("/change-password", userController.changePassword);

export default router;
