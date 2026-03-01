import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { globalLimiter, generationLimiter } from "./middleware/rateLimiter";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import contentRoutes from "./routes/content.routes";
import templateRoutes from "./routes/template.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";
import generateRoutes from "./routes/generate.routes";
import brandRoutes from "./routes/brand.routes";
import competitorRoutes from "./routes/competitor.routes";
import diagnosticsRoutes from "./routes/diagnostics.routes";
import pillarRoutes from "./routes/pillar.routes";
import mediaRoutes from "./routes/media.routes";
import formatRoutes from "./routes/format.routes";
import shareRoutes from "./routes/share.routes";
import * as shareController from "./controllers/share.controller";
import * as exportController from "./controllers/export.controller";
import analyticsRoutes from "./routes/analytics.routes";
import abRoutes from "./routes/ab.routes";
import vaultRoutes from "./routes/vault.routes";
import personaRoutes from "./routes/persona.routes";

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter
  app.use(globalLimiter);

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 400 ? "warn" : "info";
      logger[level]("HTTP", `${req.method} ${req.path} ${res.statusCode}`, { durationMs: duration });
    });
    next();
  });

  // Routes
  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Artifex API",
      version: "1.0.0",
      endpoints: {
        health: "/api/health",
        auth: "/api/auth/*",
        users: "/api/users/*",
        content: "/api/content/*",
        templates: "/api/templates/*",
        brands: "/api/brands/*",
        competitors: "/api/competitors/*",
      pillars: "/api/pillars/*",
        media: "/api/content/:id/assets/*",
        format: "/api/format/*",
        export: "/api/content/:id/export",
        share: "/api/content/:id/share",
        public: "/public/:slug",
        analytics: "/api/analytics/*",
        variants: "/api/content/:id/variants",
        vault: "/api/vault/*",
        personas: "/api/personas/*",
      },
    });
  });

  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/generate", generationLimiter, generateRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/competitors", competitorRoutes);
  app.use("/api/pillars", pillarRoutes);
  app.use("/api/content/:id/assets", mediaRoutes);
  app.use("/api/format", formatRoutes);
  // Phase 12: export + sharing
  app.get("/api/content/:id/export", exportController.exportContent);
  app.use("/api/content/:id/share", shareRoutes);
  // Unauthenticated public read-only view
  app.get("/public/:slug", shareController.getPublicView);
  // Phase 13: analytics + A/B
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/content/:id/variants", abRoutes);
  // Future-ready: Knowledge Vault + Personas (storage only, not pipeline-injected)
  app.use("/api/vault", vaultRoutes);
  app.use("/api/personas", personaRoutes);
  app.use("/api/diagnostics", diagnosticsRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
