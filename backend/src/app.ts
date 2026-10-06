import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { errorHandler, AppError } from "./middleware/errorHandler.js";
import { getIO } from "./config/socket.js";
import { globalLimiter } from "./middleware/rateLimiter.middleware.js";

export const createApp = (): Application => {
  const app: Application = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
const allowedOrigins = new Set([
  config.clientUrl,

  // Development only
  ...(config.nodeEnv !== "production"
    ? [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
         'http://192.168.1.10:3000'
      ]
    : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);

// Render reverse proxy
app.set(
  "trust proxy",
  config.nodeEnv === "production" ? 1 : false,
);

  app.use(globalLimiter);

  // Request logging
  if (config.nodeEnv !== "test") {
    app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
  }

  // Body and cookie parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Mount API Router
  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello World" });
  });
  app.use("/api", apiRouter);

  // Socket.IO compatibility: delegate to Engine.IO if request reaches Express
  app.all(
    ["/socket.io", "/socket.io/*"],
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const io = getIO();
        if (
          req.url.startsWith("/socket.io") &&
          !req.url.startsWith("/socket.io/")
        ) {
          req.url = req.url.replace("/socket.io", "/socket.io/");
        }
        return io.engine.handleRequest(req, res);
      } catch {
        next();
      }
    },
  );

  // 404 Handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(
      new AppError(
        `Route not found: ${req.method} ${req.originalUrl}`,
        404,
        "NOT_FOUND",
      ),
    );
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
