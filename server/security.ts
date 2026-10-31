import { createHash, randomBytes } from "node:crypto";
import type { Request, RequestHandler } from "express";
import { z } from "zod";

const developmentSecret = randomBytes(48).toString("base64");
export function sessionSecret(environment = process.env.NODE_ENV, value = process.env.SESSION_SECRET) {
  const knownDefault = value === "bloom-health-secret-key-change-in-production";
  if (environment === "production" && (!value || value.length < 32 || knownDefault))
    throw new Error("Set SESSION_SECRET to a unique random secret of at least 32 characters before starting production.");
  return value && !knownDefault ? value : developmentSecret;
}
export const authInputSchema = z.object({
  username: z.string().min(1).max(100).refine(v => v.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(v)),
  password: z.string().min(1).refine(v => Buffer.byteLength(v, "utf8") <= 72, "Passwords must be at most 72 UTF-8 bytes."),
}).strict();

/** Single-instance defense. Replace with a shared atomic store before horizontal scaling. */
export class AuthAttemptLimiter {
  private entries = new Map<string, { at: number; count: number }>();
  constructor(private now = Date.now, private windowMs = 15 * 60_000, private maxEntries = 10_000) {}
  allow(ip: string, username: string) {
    const now = this.now();
    for (const [key, value] of Array.from(this.entries)) if (now - value.at >= this.windowMs) this.entries.delete(key);
    const hash = (v: string) => createHash("sha256").update(v).digest("hex");
    const checks: [string, number][] = [["ip:" + hash(ip), 60], ["account:" + hash(username.toLowerCase()), 20]];
    if (checks.some(([key, max]) => (this.entries.get(key)?.count || 0) >= max)) return false;
    const missing = checks.filter(([key]) => !this.entries.has(key)).length;
    if (this.entries.size + missing > this.maxEntries) return false;
    for (const [key] of checks) { const entry = this.entries.get(key) || { at: now, count: 0 }; entry.count++; this.entries.set(key, entry); }
    return true;
  }
}
export const securityHeaders: RequestHandler = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  if (req.path === "/api" || req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
};
/** Cookie-authenticated APIs accept exact-origin requests or browser same-origin metadata.
 * Requests with neither are rejected, including login CSRF. Host forwarding is never
 * trusted here; APP_ORIGIN pins the externally visible origin when configured.
 */
export const sameOriginWrites: RequestHandler = (req, res, next) => {
  if (!req.path.startsWith("/api/") || ["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin"), site = req.get("sec-fetch-site");
  const expected = process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`;
  const permitted = origin ? origin === expected : site === "same-origin";
  if (!permitted || (site && site !== "same-origin" && site !== "none"))
    return void res.status(403).json({ error: "This request must come from Bloom. Reload the app and retry." });
  next();
};
export function safeRequestLog(req: Request, status: number, duration: number) {
  // Never include concrete paths, query strings, payloads, account identifiers or error details.
  const route = typeof req.route?.path === "string" ? req.route.path : "/api/[route]";
  return `${req.method} ${route} ${status} in ${duration}ms`;
}
