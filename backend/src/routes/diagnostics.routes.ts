import { Router, Response } from "express";
import { env } from "../config/env";
import { aiService } from "../services/gemini.service";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

/**
 * Check AI configuration without exposing the full API key.
 */
router.get("/config", asyncHandler(async (_req, res: Response) => {
  const apiKey = env.GEMINI_API_KEY || "";
  const maskedKey = apiKey.length > 8 
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
    : "not set";

  res.status(200).json({
    success: true,
    data: {
      activeProvider: aiService.activeProvider,
      configuredProvider: env.AI_PROVIDER,
      geminiModel: env.GEMINI_MODEL,
      hasApiKey: !!env.GEMINI_API_KEY,
      maskedApiKey: maskedKey,
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
    }
  });
}));

export default router;
