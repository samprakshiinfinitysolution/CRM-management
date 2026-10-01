import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/db.js";

const app = createApp();

const server = app.listen(config.port, '0.0.0.0', async () => {
  console.log(`===============================================`);
  console.log(`🚀 CRM Backend Server running in ${config.nodeEnv} mode`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);

  try {
    await prisma.$connect();
    console.log(`✅ Database connected successfully`);
  } catch (error) {
    console.error(
      `❌ Database connection failed: Could not connect to PostgreSQL.`,
    );
    console.error(
      `👉 Please ensure PostgreSQL is running at localhost:5432 or update DATABASE_URL in .env`,
    );
  }

  console.log(`===============================================`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("HTTP server and Database connections closed.");
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
