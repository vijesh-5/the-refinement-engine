import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express";
import { AppError } from "./errorHandler";
import { verifyAccessToken } from "../utils/jwt";
import { asyncHandler } from "./asyncHandler";

export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      throw new AppError(401, "Invalid or expired access token");
    }

    // Attach user to request
    req.user = {
      id: payload.id,
      email: payload.email,
    };

    next();
  },
);
