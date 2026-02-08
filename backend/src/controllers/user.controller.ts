import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as userService from "../services/user.service";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../utils/user.validation";

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.getProfile(req.user!.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(
      req.user!.id,
      data.firstName,
      data.lastName,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  },
);

export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = changePasswordSchema.parse(req.body);
    const user = await userService.changePassword(
      req.user!.id,
      data.currentPassword,
      data.newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: user,
    });
  },
);
