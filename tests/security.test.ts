import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { registerAuthRoutes } from "../server/auth-routes";
import { AuthAttemptLimiter, authInputSchema, safeRequestLog, sameOriginWrites, securityHeaders, sessionSecret } from "../server/security";

test("production sessions fail closed; development uses an ephemeral secret and passwords respect bcrypt bytes", () => {
  for (const value of [undefined, "short", "bloom-health-secret-key-change-in-production"]) assert.throws(() => sessionSecret("production", value));
  assert.equal(sessionSecret("production", "x".repeat(32)), "x".repeat(32));
  assert.ok(sessionSecret("development", undefined).length >= 32);
  assert.ok(authInputSchema.safeParse({ username: "person", password: "a".repeat(72) }).success);
  assert.ok(!authInputSchema.safeParse({ username: "person", password: "é".repeat(37) }).success);
  assert.ok(!authInputSchema.safeParse({ username: {}, password: [] }).success);
  assert.ok(!authInputSchema.safeParse({ username: "x".repeat(101), password: "password" }).success);
});
test("auth limiter bounds accounts, addresses, memory and TTL without logging raw identifiers", () => {
  let now = 0;
  const limiter = new AuthAttemptLimiter(() => now, 1000, 200);
  for (let i = 0; i < 20; i++) assert.ok(limiter.allow("address" + i, "account"));
  assert.equal(limiter.allow("newaddress", "ACCOUNT"), false);
  for (let i = 0; i < 60; i++) assert.ok(limiter.allow("sharedaddress", "otheraccount" + i));
  assert.equal(limiter.allow("sharedaddress", "nextaccount"), false);
  now = 1000;
  assert.ok(limiter.allow("newaddress", "ACCOUNT"));
  const bounded = new AuthAttemptLimiter(() => now, 1000, 2);
  assert.ok(bounded.allow("ip", "user"));
  assert.equal(bounded.allow("ip2", "user2"), false);
});
test("real auth handlers rotate/save sessions, preserve ownership, reject unsafe writes and hide details", async () => {
  const users = new Map<string, any>();
  const user = { id: "private-user", username: "existing", password: await bcrypt.hash("password-123", 4) };
  users.set(user.username, user);
  let lookups = 0;
  const store = {
    getUserByUsername: async (name: string) => { lookups++; if (name === "broken") throw Error("private SQL connection details"); return users.get(name); },
    getUser: async (id: string) => [...users.values()].find(u => u.id === id),
    createUser: async (input: any) => { const row = { ...input, id: "new-user" }; users.set(input.username, row); return row; },
  };
  const app = express();
  app.disable("x-powered-by");
  app.use(securityHeaders, sameOriginWrites, express.json());
  app.use(session({ secret: "test-secret".repeat(4), resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: "strict" } }));
  app.get("/seed", (req, res) => { req.session.username = "anonymous"; res.json({ ok: true }); });
  registerAuthRoutes(app, store);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const address = server.address() as { port: number }, base = `http://127.0.0.1:${address.port}`;
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) => fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", Origin: base, ...headers }, body: JSON.stringify(body) });
  const cookie = (r: Response) => r.headers.get("set-cookie")!.split(";")[0];
  try {
    const original = cookie(await fetch(base + "/seed"));
    const denied = await post("/api/auth/login", { username: "existing", password: "password-123" }, { Origin: "https://sibling.example" });
    assert.equal(denied.status, 403); assert.equal(lookups, 0);
    const invalid = await post("/api/auth/login", { username: {}, password: [] });
    assert.equal(invalid.status, 400); assert.equal(lookups, 0);
    const long = await post("/api/auth/login", { username: "existing", password: "p".repeat(73) });
    assert.equal(long.status, 400); assert.equal(lookups, 0);
    const login = await post("/api/auth/login", { username: "existing", password: "password-123" }, { Cookie: original, Origin: base });
    assert.equal(login.status, 200); const authenticated = cookie(login); assert.notEqual(authenticated, original);
    assert.equal(login.headers.get("cache-control"), "no-store"); assert.equal(login.headers.get("x-content-type-options"), "nosniff");
    assert.equal(login.headers.get("x-frame-options"), "DENY"); assert.equal(login.headers.get("x-powered-by"), null);
    const me = await fetch(base + "/api/auth/me", { headers: { Cookie: authenticated } });
    assert.deepEqual(await me.json(), { user: { id: user.id, username: user.username } });
    assert.deepEqual(await (await fetch(base + "/api/auth/me", { headers: { Cookie: original } })).json(), { user: null });
    const signup = await post("/api/auth/signup", { username: "newperson", password: "new-password-123" });
    assert.equal(signup.status, 200); assert.ok(await bcrypt.compare("new-password-123", users.get("newperson").password));
    const broken = await post("/api/auth/login", { username: "broken", password: "password" });
    assert.equal(broken.status, 503); assert.ok(!(await broken.text()).includes("SQL"));
    const logout = await post("/api/auth/logout", {}, { Cookie: authenticated });
    assert.equal(logout.status, 200);
    assert.deepEqual(await (await fetch(base + "/api/auth/me", { headers: { Cookie: authenticated } })).json(), { user: null });
    for (let i = 0; i < 20; i++) await post("/api/auth/login", { username: "absent", password: "wrong" });
    const throttled = await post("/api/auth/login", { username: "absent", password: "wrong" });
    assert.equal(throttled.status, 429); assert.equal(throttled.headers.get("retry-after"), "900");
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
test("request logging records only route templates and excludes health details", () => {
  const log = safeRequestLog({ method: "GET", path: "/api/meals/private-user", query: { genotype: "private" }, route: { path: "/api/meals/:userId" } } as any, 200, 10);
  assert.equal(log, "GET /api/meals/:userId 200 in 10ms");
  assert.equal(safeRequestLog({ method: "GET", path: "/api/private-identifier" } as any, 404, 1), "GET /api/[route] 404 in 1ms");
});
