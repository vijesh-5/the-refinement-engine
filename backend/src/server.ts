import { createApp } from "./app";
import { env, validateEnv } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";

async function startServer() {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 Artifex API Server");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Server running on: http://localhost:${env.PORT}`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await disconnectDatabase();
        console.log("Server closed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
