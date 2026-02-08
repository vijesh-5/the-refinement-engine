import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as authService from "../services/auth.service";
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
} from "../utils/validation";
import { AppError } from "../middleware/errorHandler";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const data = signupSchema.parse(req.body);

  // Call service
  const result = await authService.signup(
    data.email,
    data.password,
    data.firstName,
    data.lastName,
  );

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const data = loginSchema.parse(req.body);

  // Call service
  const result = await authService.login(data.email, data.password);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const data = refreshTokenSchema.parse(req.body);

  // Call service
  const result = await authService.refreshAccessToken(data.refreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const data = refreshTokenSchema.parse(req.body);

  // Call service
  await authService.logout(data.refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
