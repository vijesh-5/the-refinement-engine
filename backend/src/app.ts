import express, { Application } from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import contentRoutes from "./routes/content.routes";
import templateRoutes from "./routes/template.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";
import generateRoutes from "./routes/generate.routes";
import brandRoutes from "./routes/brand.routes";
import competitorRoutes from "./routes/competitor.routes";

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

  // Routes
  app.get("/", (req, res) => {
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
      },
    });
  });

  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/generate", generateRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/competitors", competitorRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
