import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || "15m",
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  AI_PROVIDER: process.env.AI_PROVIDER || "gemini",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3:8b",
  PIPELINE_MODE: process.env.PIPELINE_MODE || "auto", // "full" | "light" | "auto"
} as const;

// Validate required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !env[key]);

  // Conditional: GEMINI_API_KEY is required only when using Gemini provider
  if (env.AI_PROVIDER === "gemini" && !env.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY" as any);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file.",
    );
  }

  // Warn about weak JWT secrets
  if (env.JWT_ACCESS_SECRET.length < 32) {
    logger.warn("ENV", "JWT_ACCESS_SECRET is shorter than 32 characters — consider using a stronger secret");
  }
  if (env.JWT_REFRESH_SECRET.length < 32) {
    logger.warn("ENV", "JWT_REFRESH_SECRET is shorter than 32 characters — consider using a stronger secret");
  }

  // Log active AI provider
  if (env.AI_PROVIDER === "ollama") {
    logger.info("ENV", `AI Provider: Ollama (${env.OLLAMA_MODEL}) at ${env.OLLAMA_URL}`);
  } else {
    logger.info("ENV", `AI Provider: Gemini (${env.GEMINI_MODEL})`);
  }
}
