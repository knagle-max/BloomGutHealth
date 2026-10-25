import { createHmac } from "node:crypto";
import type { RequestHandler } from "express";

export interface RateLimitDatabase {
  query(text: string, values?: any[]): Promise<{ rows: any[] }>;
}
/** One row per hashed identity and budget. All replicas use the same Postgres
 * clock and atomic upsert. Denied attempts cannot extend an existing window.
 * Check source before account so one blocked source cannot create unbounded rows.
 */
export class SharedRateLimiter {
  constructor(private db: RateLimitDatabase, private secret: string) {}
  async initialize() {
    await this.db.query(`CREATE TABLE IF NOT EXISTS request_budgets (
      identity text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL
    )`);
    await this.db.query(`CREATE INDEX IF NOT EXISTS request_budgets_expiry ON request_budgets (expires_at)`);
  }
  async consume(scope: string, identity: string, maximum: number, seconds: number) {
    const key = createHmac("sha256", this.secret).update(scope).update("\0").update(identity).digest("hex");
    const result = await this.db.query(`INSERT INTO request_budgets AS b (identity, attempts, expires_at)
      VALUES ($1, 1, clock_timestamp() + $3 * interval '1 second')
      ON CONFLICT (identity) DO UPDATE SET
        attempts = CASE WHEN b.expires_at <= clock_timestamp() THEN 1 ELSE LEAST(b.attempts + 1, $2 + 1) END,
        expires_at = CASE WHEN b.expires_at <= clock_timestamp() THEN clock_timestamp() + $3 * interval '1 second' ELSE b.expires_at END
      RETURNING attempts <= $2 AS allowed`, [key, maximum, seconds]);
    return result.rows[0]?.allowed === true;
  }
  async prune() {
    // Bounded cleanup; expiry is enforced on reads even before physical removal.
    await this.db.query(`DELETE FROM request_budgets WHERE identity IN
      (SELECT identity FROM request_budgets WHERE expires_at < clock_timestamp() LIMIT 1000)`);
  }
  middleware(): RequestHandler {
    return async (req, res, next) => {
      // Express routes accept case differences and one trailing slash by
      // default. Budget the same accepted paths before any credential work.
      const path = req.path.toLowerCase().replace(/\/$/, "");
      const reauthentication=path === "/api/account" && req.method === "DELETE";
      const auth = reauthentication || path === "/api/auth/login" || path === "/api/auth/signup";
      const costly = path.startsWith("/api/capabilities") || /(?:upload|import|analy[sz]|recipe|coach|plan|transcribe|photo|export|search)/i.test(path);
      if (!auth && !costly) return next();
      const scope = auth ? "authentication" : "resource";
      const windowSeconds = auth ? 900 : 60;
      try {
        const sourceAllowed = await this.consume(scope + ":source", req.ip || "unknown", auth ? 60 : 120, windowSeconds);
        const identity = reauthentication ? req.session?.userId : auth ? (typeof req.body?.username === "string" ? req.body.username.toLowerCase() : "invalid") : req.session?.userId;
        const accountAllowed = sourceAllowed && (!identity || await this.consume(scope + ":account", identity, auth ? 20 : 30, windowSeconds));
        if (!accountAllowed) {
          res.setHeader("Retry-After", String(windowSeconds));
          return void res.status(429).json({error: auth ? "Too many sign-in attempts. Try again in 15 minutes." : "Too many requests. Wait a minute and retry."});
        }
        next();
      } catch {
        // Never fall back to a per-process budget after a shared-store failure.
        res.setHeader("Retry-After", "60");
        res.status(503).json({error:"This action is temporarily unavailable. Please retry in a minute."});
      }
    };
  }
}

/** Existing development allowance, configurable without inventing monetary tariffs. */
export function usdaSharedRequestLimit(value=process.env.BLOOM_USDA_SHARED_REQUESTS_PER_MINUTE) {
  if(value===undefined||value==='')return 12;
  if(!/^[1-9]\d{0,3}$/.test(value))return 0;
  const count=Number(value);return count<=1000?count:0; // Invalid configuration fails closed for this provider only.
}
