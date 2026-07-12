// Express application
// -----------------------------------------------------------------------------
// This file builds and configures the Express app but deliberately never
// calls app.listen() — that's server.js's responsibility. Splitting these
// two apart is what makes the app testable later (a test file can import
// `app` and use a library like supertest to make requests against it
// in-memory, without needing a real running server/port).

import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Security headers — sensible defaults for an API (no HTML templates to
// worry about CSP for here).
app.use(helmet());

// CORS — locked to the frontend's origin(s) via env var rather than left
// wide open. Set CORS_ORIGIN in .env as a comma-separated list for multiple
// environments, e.g. "http://localhost:5173,https://xelexperfumes.com".
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allows cookies (auth sessions, later) to be sent cross-origin
  })
);

// Request logging — verbose in development, concise/production-safe format
// otherwise.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Parses the `Cookie` header into `req.cookies` — needed once auth sessions
// are added; harmless and already-configured before that point.
app.use(cookieParser());

// Body parsers — JSON for API requests, urlencoded for traditional form
// submissions (e.g. a future admin panel or webhook payloads).
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serves admin-uploaded product images. `Cross-Origin-Resource-Policy` is
// relaxed to `cross-origin` for this path only — helmet's default
// `same-origin` would otherwise block the frontend (a different origin in
// dev) from rendering these images in an <img> tag.
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
  })
);

// Routes
app.use("/", routes);

// 404 handler — must come after all real routes.
app.use(notFound);

// Centralized error handler — must be registered last of all.
app.use(errorHandler);

export default app;
