/** Optional synthetic caller. Never imported by Bloom's production entry points.
 * Uses an explicit loopback CONNECT proxy; no direct-network fallback, global
 * proxy settings, free-form payloads, provider credentials or personal records.
 */
import { createHash } from "node:crypto";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

const PREFIX = "/api/ml/research/development/v1";
const JOB = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const LIMIT = 65536;

export class DevelopmentTransportUnavailable extends Error {
  constructor() { super("Development science transport is disabled or unavailable."); }
}
function refuse() { throw new DevelopmentTransportUnavailable(); }
function token(value) {
  return typeof value === "string" && Buffer.byteLength(value) >= 32 && Buffer.byteLength(value) <= 512 && !/\s/.test(value);
}
function settings(env) {
  if (env.BLOOM_RUNTIME_ENV !== "development" || env.NODE_ENV === "production"
      || process.env.NODE_ENV === "production" || process.env.BLOOM_RUNTIME_ENV === "production"
      || env.BLOOM_LOCAL_SCIENCE_ENABLED !== "true" || env.BLOOM_DEV_MAC_CALLER_ENABLED !== "true"
      || env.NODE_TLS_REJECT_UNAUTHORIZED === "0" || process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
      || env.DEBUG || process.env.DEBUG || env.NODE_DEBUG || process.env.NODE_DEBUG) refuse();
  const ml = env.ML_SERVICE_TOKEN, science = env.BLOOM_DEV_SCIENCE_TOKEN;
  if (!token(ml) || !token(science) || ml === science) refuse();
  let base, proxy;
  try { base = new URL(env.BLOOM_DEV_MAC_URL); proxy = new URL(env.BLOOM_DEV_TAILSCALE_PROXY_URL); }
  catch { refuse(); }
  if (base.protocol !== "https:" || (base.port && base.port !== "443")
      || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.ts\.net$/.test(base.hostname)
      || base.username || base.password || base.search || base.hash || base.pathname !== "/") refuse();
  if (proxy.protocol !== "http:" || proxy.hostname !== "127.0.0.1" || !proxy.port
      || Number(proxy.port) < 1024 || Number(proxy.port) > 65535 || proxy.username || proxy.password
      || proxy.search || proxy.hash || proxy.pathname !== "/") refuse();
  return { base: base.origin, proxy: proxy.href, ml, science, model: env.BLOOM_DEV_OLLAMA_MODEL ?? null };
}

export function createDevelopmentScienceClient({ environment = process.env, transport = fetch } = {}) {
  settings(environment); // No network activity on construction.

  async function operation(method, path, body = "") {
    const config = settings(environment);
    const agent = new HttpsProxyAgent(config.proxy, { keepAlive: false, rejectUnauthorized: true });
    // https-proxy-agent keeps constructor TLS options on the proxy socket.
    // Node's request agent options must also enforce destination verification.
    agent.options.rejectUnauthorized = true;
    const headers = { Authorization: `Bearer ${config.ml}`,
      "X-Bloom-Science-Authorization": `Bearer ${config.science}`, "Content-Type": "application/json",
      "Accept-Encoding": "identity" };
    // A single deadline covers both challenge and intended request.
    const signal = AbortSignal.timeout(30000);
    function unchanged() {
      if (JSON.stringify(settings(environment)) !== JSON.stringify(config)) refuse();
    }
    async function request(target, requestMethod, text, nonce) {
      unchanged();
      const response = await transport(config.base + target, { method: requestMethod, agent, signal,
        redirect: "error", compress: false, size: LIMIT,
        headers: { ...headers, ...(nonce ? { "X-Bloom-Science-Nonce": nonce } : {}) },
        ...(requestMethod === "GET" || requestMethod === "DELETE" ? {} : { body: text }) });
      if (!response.ok || response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
          || ![null, "identity"].includes(response.headers.get("content-encoding"))) {
        response.body?.destroy(); refuse();
      }
      const chunks = []; let bytes = 0;
      for await (const chunk of response.body) {
        const buffer = Buffer.from(chunk); bytes += buffer.length;
        if (bytes > LIMIT) { response.body.destroy(); refuse(); }
        chunks.push(buffer);
      }
      unchanged();
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }
    try {
      const challenge = await request(PREFIX + "/challenge", "POST", JSON.stringify({ method, path,
        bodySha256: createHash("sha256").update(body, "utf8").digest("hex") }));
      if (!challenge || typeof challenge.nonce !== "string" || !/^[0-9a-f]{64}$/.test(challenge.nonce)
          || challenge.expiresInSeconds !== 60) refuse();
      const result = await request(path, method, body, challenge.nonce);
      if (!result || typeof result !== "object" || Array.isArray(result)) refuse();
      return result;
    } catch { refuse(); }
    finally { agent.destroy(); }
  }

  return Object.freeze({
    async submitReference(scenario) {
      if (!["baseline", "closed-medium"].includes(scenario)) refuse();
      const result = await operation("POST", PREFIX + "/jobs", JSON.stringify({ version: "micom-reference-control-v1", scenario }));
      if (!JOB.test(result.id) || result.state !== "running") refuse();
      return { id: result.id, state: result.state };
    },
    async referenceStatus(id) {
      if (typeof id !== "string" || !JOB.test(id)) refuse();
      const result = await operation("GET", PREFIX + "/jobs/" + id);
      if (result.id !== id || !["running", "cancelling", "completed", "cancelled", "failed", "timed-out"].includes(result.state)) refuse();
      if (result.state === "completed" && (result.result?.scope !== "nonpersonal-engineering-control"
          || result.result.observedBiology !== false || result.result.clinicalValidation !== false
          || result.result.predictiveValidation !== false)) refuse();
      if (result.state !== "completed" && result.result !== null) refuse();
      return result;
    },
    async cancelReference(id) {
      if (typeof id !== "string" || !JOB.test(id)) refuse();
      const result = await operation("DELETE", PREFIX + "/jobs/" + id);
      if (result.id !== id || result.cancellationRequested !== true) refuse();
      return { id, cancellationRequested: true };
    },
    async smokeOllama() {
      const model = environment.BLOOM_DEV_OLLAMA_MODEL;
      if (typeof model !== "string" || /cloud/i.test(model)
          || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,95}:[A-Za-z0-9._-]{1,32}$/.test(model)) refuse();
      const result = await operation("POST", PREFIX + "/inference/smoke", JSON.stringify({ version: "ollama-development-smoke-v1", model }));
      if (result.scope !== "synthetic-development-smoke" || result.model !== model
          || result.observedBiology !== false || result.scientificallyValidated !== false
          || result.rawModelOutputReleased !== false || typeof result.matchedExpectedResponse !== "boolean"
          || result.transportStatus !== "completed" || (result.outputTokenCount !== null
            && (!Number.isInteger(result.outputTokenCount) || result.outputTokenCount < 0 || result.outputTokenCount > 16))) refuse();
      return { version: "ollama-development-smoke-v1", scope: result.scope, model,
        transportStatus: result.transportStatus, matchedExpectedResponse: result.matchedExpectedResponse,
        outputTokenCount: result.outputTokenCount, observedBiology: false,
        scientificallyValidated: false, rawModelOutputReleased: false };
    },
  });
}
