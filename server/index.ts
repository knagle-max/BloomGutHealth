import { productService } from "./products";
import "./env";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { SharedRateLimiter } from "./shared-rate-limit";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sessionSecret, securityHeaders, sameOriginWrites, safeRequestLog } from "./security";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

const app = express();
app.disable("x-powered-by");
app.use(securityHeaders);
// Render terminates HTTPS before forwarding to this private service.
if (process.env.RENDER === "true") app.set("trust proxy", 1);
app.use(sameOriginWrites);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

const PgSession = connectPgSimple(session);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: sessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
    },
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api/")) log(safeRequestLog(req, res.statusCode, Date.now() - start));
  });
  next();
});

(async () => {
  const budgets = new SharedRateLimiter(pgPool, sessionSecret());
  await budgets.initialize();
  app.use(budgets.middleware());
  const budgetCleanup = setInterval(() => { void budgets.prune().catch(() => {}); }, 60_000);
  budgetCleanup.unref();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message =
      status === 413
        ? "JSON request too large. Structured reports must be 2 MB or smaller."
        : err.type === "entity.parse.failed"
          ? "Invalid JSON request. Check the JSON syntax."
          : status >= 500
            ? "The request could not be completed. Please retry."
            : err.message || "Invalid request";

    res.status(status).json({ message });
    // Request validation failures must not terminate the production process.
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      void productService.verifyUSDABrandedSource();
      log(`Food sources: USDA Branded credential configured=${!!process.env.USDA_FDC_API_KEY?.trim()}; Open Food Facts approved=${process.env.BLOOM_OPEN_FOOD_FACTS_APPROVED === "true"}`);
    },
  );
})();
