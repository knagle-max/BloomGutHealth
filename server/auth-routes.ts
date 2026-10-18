import bcrypt from "bcrypt";
import type { Express, Request } from "express";
import type { IStorage } from "./storage";
import { AuthAttemptLimiter, authInputSchema } from "./security";

type AuthStore = Pick<IStorage, "getUserByUsername" | "getUser" | "createUser">;
async function establishSession(req: Request, user: { id: string; username: string }) {
  await new Promise<void>((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
  req.session.userId = user.id;
  req.session.username = user.username;
  await new Promise<void>((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
}
export function registerAuthRoutes(app: Express, store: AuthStore, limiter = new AuthAttemptLimiter()) {
  // Equal-cost comparison for unknown accounts; no credentials or database errors enter logs.
  const dummyHash = bcrypt.hash("unusable-random-account-placeholder", 10);
  for (const action of ["signup", "login"] as const) app.post(`/api/auth/${action}`, async (req, res) => {
    const parsed = authInputSchema.safeParse(req.body);
    const username = parsed.success ? parsed.data.username : "invalid-input";
    if (!limiter.allow(req.ip || "unknown", username)) {
      res.setHeader("Retry-After", "900");
      return res.status(429).json({ error: "Too many sign-in attempts. Please try again in 15 minutes." });
    }
    if (!parsed.success || (action === "signup" && parsed.data.password.length < 8))
      return res.status(400).json({ error: "Enter a username (1–100 characters) and a password of 8–72 UTF-8 bytes when creating an account." });
    try {
      const { username, password } = parsed.data;
      const existing = await store.getUserByUsername(username);
      if (action === "signup" && existing) return res.status(400).json({ error: "Username already exists" });
      let user = existing;
      if (action === "login") {
        const valid = await bcrypt.compare(password, existing?.password || await dummyHash);
        if (!existing || !valid) return res.status(401).json({ error: "Invalid username or password" });
      } else user = await store.createUser({ username, password: await bcrypt.hash(password, 10) });
      await establishSession(req, user!);
      res.json({ success: true, user: { id: user!.id, username: user!.username } });
    } catch {
      res.status(503).json({ error: "Sign-in could not be completed. Please retry." });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(error => {
      if (error) return void res.status(503).json({ error: "Sign-out could not be completed. Please retry." });
      res.clearCookie("connect.sid", { path: "/", secure:process.env.NODE_ENV==="production", httpOnly:true, sameSite:"strict" });
      res.json({ success: true });
    });
  });
  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = req.session.userId ? await store.getUser(req.session.userId) : undefined;
      res.json({ user: user ? { id: user.id, username: user.username } : null });
    } catch { res.status(503).json({ error: "Account could not load. Please retry." }); }
  });
}
