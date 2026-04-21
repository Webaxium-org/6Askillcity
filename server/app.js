import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { globalLimiter } from "./middleware/rateLimiter.js";
import configureCors from "./utils/cors.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

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
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import admissionPointRoutes from './routes/admissionPoint.routes.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';

app.use('/api/admission-points', admissionPointRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// 7. Error Handling
app.use(errorHandler);

export default app;
