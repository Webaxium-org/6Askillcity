import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import { createRequire } from "module";
import { globalLimiter } from "./middleware/rateLimiter.js";
import configureCors from "./utils/cors.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

app.set("trust proxy", 1);

// Configure helmet to allow cross-origin images for static files (optional but safe)
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(configureCors());

// 2. Logging
if (process.env.NODE_ENV === "development") {
  const { default: morgan } = await import("morgan");
  app.use(morgan("dev"));
}

// 3. Parsers
app.use(express.json());
app.use(cookieParser());

// 4. Rate Limiting
app.use(globalLimiter);

// 5. Static Files
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toLocaleString(),
  });
});

app.get("/api/ready", (req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;

  res.status(isDatabaseReady ? 200 : 503).json({
    success: isDatabaseReady,
    status: isDatabaseReady ? "ready" : "not_ready",
    database: isDatabaseReady ? "connected" : "disconnected",
    timestamp: new Date().toLocaleString(),
  });
});

app.get("/api/version", (req, res) => {
  res.status(200).json({
    success: true,
    name: packageJson.name,
    version: process.env.APP_VERSION || packageJson.version,
    environment: process.env.NODE_ENV || "development",
  });
});

import admissionPointRoutes from "./routes/admissionPoint.routes.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import followupRoutes from "./routes/followup.routes.js";
import universityRoutes from "./routes/university.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ocrRoutes from "./routes/ocr.routes.js";
import reportRoutes from "./routes/report.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import serviceRoutes from "./routes/service.routes.js";

app.use("/api/admission-points", admissionPointRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/university-management", universityRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/services", serviceRoutes);

// 7. Error Handling
app.use(errorHandler);

export default app;
