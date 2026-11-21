import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getConfig } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";
import onboardingRoutes from "./routes/onboarding.routes";

export function createApp() {
  const { frontendOrigin } = getConfig();
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: frontendOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/onboarding", onboardingRoutes);
  app.use(errorHandler);

  return app;
}
