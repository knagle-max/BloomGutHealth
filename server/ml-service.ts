import fetch, { Headers, type RequestInit } from "node-fetch";

type MlEnvironment = Record<string, string | undefined>;
const paths = new Set(["/health", "/api/ml/analyze", "/api/ml/upload", "/api/ml/cohorts"]);
export function mlServiceTarget(path: string, environment: MlEnvironment = process.env) {
  if (!paths.has(path)) throw new Error("Unsupported processing operation.");
  let url: URL;
  try { url = new URL(environment.ML_SERVICE_URL || ""); }
  catch { throw new Error("The processing service is not securely configured."); }
  if (url.username || url.password || url.search || url.hash || !["", "/"].includes(url.pathname))
    throw new Error("The processing service is not securely configured.");
  const hostname = url.hostname.toLowerCase();
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  const octets = hostname.split(".").map(Number);
  const privateIp = octets.length === 4 && octets.every(n => Number.isInteger(n) && n >= 0 && n <= 255) && (octets[0] === 10 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168));
  const privateHost = !hostname.includes(".") && /^[a-z0-9-]+$/.test(hostname) || hostname.endsWith(".internal") || privateIp;
  const approvedHttp = url.protocol === "http:" && (loopback || (environment.ML_SERVICE_ALLOW_PRIVATE_HTTP === "true" && privateHost));
  if (url.protocol !== "https:" && !approvedHttp) throw new Error("The processing service requires HTTPS or an explicitly approved private connection.");
  const token = environment.ML_SERVICE_TOKEN;
  if (path.startsWith("/api/ml/") && (!token || Buffer.byteLength(token, "utf8") < 32 || token.length > 512 || /\s/.test(token)))
    throw new Error("The processing service authentication is not configured.");
  return { url: new URL(path, url.origin).href, token: path.startsWith("/api/ml/") ? token : undefined };
}
/** Configured server-only destinations, no redirects; never forwards a browser credential. */
export async function mlServiceFetch(path: string, init: RequestInit = {}, environment: MlEnvironment = process.env, transport = fetch) {
  const target = mlServiceTarget(path, environment);
  const headers = new Headers(init.headers);
  headers.delete("authorization");
  headers.delete("cookie");
  if (target.token) headers.set("authorization", `Bearer ${target.token}`);
  return transport(target.url, {
    ...init,
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(30000),
    size: 5 * 1024 * 1024,
  });
}
