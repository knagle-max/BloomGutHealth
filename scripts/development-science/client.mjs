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
const REFERENCE_HASH = "36300ad00320f1ffde76f2ffca06be6403759d92ac320535d961a0ab2d0c94f1";
function referenceProjection(value) {
  const versions = { micom: "0.37.1", cobra: "0.30.0", optlang: "1.8.3", osqp: "0.6.7.post3", highspy: "1.16.0", "python-libsbml": "5.21.2" };
  if (value?.version !== "micom-reference-control-v1" || !["baseline", "closed-medium"].includes(value.scenario)
      || value.scope !== "nonpersonal-engineering-control" || value.observedBiology !== false
      || value.clinicalValidation !== false || value.predictiveValidation !== false
      || value.model?.sha256 !== REFERENCE_HASH || value.solver !== "hybrid"
      || value.solverProfile !== "hybrid-reference-precision-v2"
      || Object.entries(versions).some(([key, expected]) => value.versions?.[key] !== expected)) return null;
  const optimal = value.status === "optimal";
  if (!optimal && (!["infeasible", "optimization-failed"].includes(value.status) || value.growthRate !== null)) return null;
  if (optimal && (![value.growthRate, value.linearGrowthMaximum, value.tradeoffGrowthTarget, value.tradeoffGrowthError,
    value.maxBoundViolation, value.maxSteadyStateResidual].every(Number.isFinite)
    || value.linearGrowthMaximum <= 0 || value.growthRate < 0
    || Math.abs(value.tradeoffGrowthTarget - 0.5 * value.linearGrowthMaximum) > 1e-5
    || Math.abs(value.growthRate - value.tradeoffGrowthTarget) > 1e-5
    || Math.abs(value.tradeoffGrowthError - Math.abs(value.growthRate - value.tradeoffGrowthTarget)) > 1e-12
    || value.tradeoffGrowthError < 0 || value.tradeoffGrowthError > 1e-5
    || value.maxBoundViolation < 0 || value.maxBoundViolation > 1e-5
    || value.maxSteadyStateResidual < 0 || value.maxSteadyStateResidual > 1e-5
    || !Array.isArray(value.qpConvergence) || value.qpConvergence.length !== 1
    || value.qpConvergence.some(row => row.status !== "solved"
      || !Number.isFinite(row.primalResidual) || Math.abs(row.primalResidual) > 1e-5
      || row.primalResidual < 0
      || !Number.isFinite(row.dualResidual) || row.dualResidual < 0 || Math.abs(row.dualResidual) > 1e-5))) return null;
  if (optimal && value.qpConvergence.some(row => !Number.isInteger(row.iterations) || row.iterations < 1 || row.iterations > 20000)) return null;
  // Return a known, bounded projection, never arbitrary server prose or fields.
  return { version: value.version, scenario: value.scenario, scope: value.scope,
    status: value.status, growthRate: value.growthRate,
    model: { sha256: REFERENCE_HASH }, versions, solver: value.solver, solverProfile: value.solverProfile,
    linearGrowthMaximum: optimal ? value.linearGrowthMaximum : null,
    tradeoffGrowthTarget: optimal ? value.tradeoffGrowthTarget : null,
    tradeoffGrowthError: optimal ? value.tradeoffGrowthError : null,
    maxBoundViolation: optimal ? value.maxBoundViolation : null,
    maxSteadyStateResidual: optimal ? value.maxSteadyStateResidual : null,
    qpConvergence: optimal ? value.qpConvergence.map(row => ({status:row.status,
      iterations:row.iterations,primalResidual:row.primalResidual,dualResidual:row.dualResidual})) : [],
    observedBiology: false, clinicalValidation: false, predictiveValidation: false,
    provenanceClass: "server-reported-reference-control", personalUsePermitted: false };
}

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
      if (result.id !== id || !["running", "cancelling", "completed", "cancelled", "failed", "timed-out", "memory-exceeded", "resource-unavailable", "termination-failed"].includes(result.state)) refuse();
      if (result.state === "completed" && (result.result?.scope !== "nonpersonal-engineering-control"
          || result.result.observedBiology !== false || result.result.clinicalValidation !== false
          || result.result.predictiveValidation !== false)) refuse();
      if (result.state !== "completed" && result.result !== null) refuse();
      const projected = result.state === "completed" ? referenceProjection(result.result) : null;
      if (result.state === "completed" && !projected) refuse();
      let resources;
      if (result.resources !== undefined) {
        const r = result.resources;
        if (!r || !Number.isSafeInteger(r.memoryLimitBytes) || r.memoryLimitBytes <= 0
            || (r.maxObservedRssBytes !== null && (!Number.isSafeInteger(r.maxObservedRssBytes) || r.maxObservedRssBytes < 0))) refuse();
        resources = {memoryLimitBytes:r.memoryLimitBytes,maxObservedRssBytes:r.maxObservedRssBytes};
      }
      return { id: result.id, state: result.state, result: projected, ...(resources ? {resources} : {}) };
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
