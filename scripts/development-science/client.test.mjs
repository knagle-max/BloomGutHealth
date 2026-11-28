import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import net from "node:net";
import tls from "node:tls";
import { Duplex, PassThrough } from "node:stream";
import { EventEmitter } from "node:events";
import { Response } from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { createDevelopmentScienceClient, DevelopmentTransportUnavailable } from "./client.mjs";

const PREFIX = "/api/ml/research/development/v1";
const ID = "12345678-1234-4123-8123-123456789012";
const ENV = { BLOOM_RUNTIME_ENV: "development", BLOOM_LOCAL_SCIENCE_ENABLED: "true",
  BLOOM_DEV_MAC_CALLER_ENABLED: "true", BLOOM_DEV_MAC_URL: "https://synthetic-mac.synthetic-tailnet.ts.net",
  BLOOM_DEV_TAILSCALE_PROXY_URL: "http://127.0.0.1:1055",
  ML_SERVICE_TOKEN: "synthetic-existing-ml-development-token-123456",
  BLOOM_DEV_SCIENCE_TOKEN: "synthetic-independent-science-development-token-123456",
  BLOOM_DEV_OLLAMA_MODEL: "synthetic-model:fixture" };
function json(value, options = {}) {
  return new Response(JSON.stringify(value), { headers: { "content-type": "application/json" }, ...options });
}
function mockTransport(result = { id: ID, state: "running" }) {
  const calls = []; let challenge, issued = 0;
  const transport = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/challenge")) {
      challenge = JSON.parse(options.body);
      return json({ nonce: (++issued).toString(16).padStart(64, "0"), expiresInSeconds: 60 });
    }
    assert.equal(new URL(url).pathname, challenge.path);
    assert.equal(options.method, challenge.method);
    assert.equal(createHash("sha256").update(options.body ?? "").digest("hex"), challenge.bodySha256);
    assert.equal(options.headers["X-Bloom-Science-Nonce"], issued.toString(16).padStart(64, "0"));
    return json(typeof result === "function" ? result(url, options) : result);
  };
  return { calls, transport };
}

test("disabled, production, unsafe destinations, credentials and proxy settings fail before transport", () => {
  for (const change of [{ BLOOM_RUNTIME_ENV: "production" }, { NODE_ENV: "production" },
    { BLOOM_DEV_MAC_CALLER_ENABLED: "false" }, { BLOOM_DEV_MAC_URL: "http://127.0.0.1:9000" },
    { BLOOM_DEV_MAC_URL: "https://public.invalid" }, { BLOOM_DEV_MAC_URL: ENV.BLOOM_DEV_MAC_URL + "/path" },
    { BLOOM_DEV_MAC_URL: ENV.BLOOM_DEV_MAC_URL + "?token=synthetic" },
    { BLOOM_DEV_TAILSCALE_PROXY_URL: "http://100.64.0.1:1055" },
    { BLOOM_DEV_TAILSCALE_PROXY_URL: "http://user:synthetic@127.0.0.1:1055" },
    { BLOOM_DEV_TAILSCALE_PROXY_URL: "http://127.0.0.1:1055/path" },
    { BLOOM_DEV_SCIENCE_TOKEN: ENV.ML_SERVICE_TOKEN }, { ML_SERVICE_TOKEN: "short" },
    { NODE_TLS_REJECT_UNAUTHORIZED: "0" }, { NODE_DEBUG: "http" }, { DEBUG: "*" }]) {
    assert.throws(() => createDevelopmentScienceClient({ environment: { ...ENV, ...change },
      transport: async () => assert.fail("must not connect") }), DevelopmentTransportUnavailable);
  }
  assert.throws(() => createDevelopmentScienceClient({ environment: {} }), DevelopmentTransportUnavailable);
});

test("an injected development config cannot override the actual production process", () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert.throws(() => createDevelopmentScienceClient({ environment: { ...ENV },
      transport: async () => assert.fail("must not connect") }), DevelopmentTransportUnavailable);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

test("synthetic submission uses exact-body nonce and an explicit TLS-validating proxy agent", async () => {
  const mocked = mockTransport();
  const client = createDevelopmentScienceClient({ environment: { ...ENV }, transport: mocked.transport });
  assert.deepEqual(await client.submitReference("baseline"), { id: ID, state: "running" });
  assert.equal(mocked.calls.length, 2);
  assert.equal(mocked.calls[0].options.agent, mocked.calls[1].options.agent);
  for (const { url, options } of mocked.calls) {
    assert.ok(url.startsWith(ENV.BLOOM_DEV_MAC_URL + PREFIX));
    assert.ok(options.agent instanceof HttpsProxyAgent);
    assert.equal(options.agent.proxy.href, ENV.BLOOM_DEV_TAILSCALE_PROXY_URL + "/");
    assert.equal(options.agent.options.rejectUnauthorized, true);
    assert.equal(options.redirect, "error"); assert.equal(options.compress, false);
    assert.equal(options.headers.Authorization, "Bearer " + ENV.ML_SERVICE_TOKEN);
    assert.equal(options.headers["X-Bloom-Science-Authorization"], "Bearer " + ENV.BLOOM_DEV_SCIENCE_TOKEN);
    assert.equal(options.headers.Cookie, undefined);
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.deepEqual(JSON.parse(mocked.calls[1].options.body), { version: "micom-reference-control-v1", scenario: "baseline" });
});

test("CONNECT proxy passes destination TLS verification and SNI without a real socket", async (t) => {
  const mocked = mockTransport();
  await createDevelopmentScienceClient({ environment: { ...ENV }, transport: mocked.transport }).submitReference("baseline");
  const agent = mocked.calls[0].options.agent;
  let proxyOptions, tlsOptions, connectText;
  const socket = new Duplex({ read() {}, write(chunk, encoding, callback) {
    connectText = chunk.toString();
    this.push(Buffer.from("HTTP/1.1 200 Connection Established\r\n\r\n"));
    callback();
  } });
  const secureSocket = new PassThrough();
  t.mock.method(net, "connect", options => { proxyOptions = options; return socket; });
  t.mock.method(tls, "connect", options => { tlsOptions = options; return secureSocket; });
  try {
    const req = new EventEmitter();
    const returned = await agent.connect(req, { ...agent.options,
      host: new URL(ENV.BLOOM_DEV_MAC_URL).hostname, port: 443, secureEndpoint: true });
    assert.equal(returned, secureSocket);
    assert.equal(proxyOptions.host, "127.0.0.1"); assert.equal(proxyOptions.port, 1055);
    assert.equal(tlsOptions.rejectUnauthorized, true);
    assert.equal(tlsOptions.servername, new URL(ENV.BLOOM_DEV_MAC_URL).hostname);
    assert.ok(connectText.startsWith("CONNECT synthetic-mac.synthetic-tailnet.ts.net:443"));
    assert.ok(!connectText.includes(ENV.ML_SERVICE_TOKEN));
    assert.ok(!connectText.includes(ENV.BLOOM_DEV_SCIENCE_TOKEN));
  } finally { socket.destroy(); secureSocket.destroy(); }
});

test("unsupported scenarios, model names and job identifiers never leave the process", async () => {
  const mocked = mockTransport();
  const env = { ...ENV };
  const client = createDevelopmentScienceClient({ environment: env, transport: mocked.transport });
  for (const scenario of ["private-record", { code: "untrusted" }, "", undefined])
    await assert.rejects(client.submitReference(scenario), DevelopmentTransportUnavailable);
  for (const id of ["../other", ID + "?token=synthetic", {}, "not-a-job"])
    await assert.rejects(client.referenceStatus(id), DevelopmentTransportUnavailable);
  env.BLOOM_DEV_OLLAMA_MODEL = "synthetic:cloud";
  await assert.rejects(client.smokeOllama(), DevelopmentTransportUnavailable);
  assert.equal(mocked.calls.length, 0);
});

test("fresh challenges protect status, cancellation and repeated operations", async () => {
  const mocked = mockTransport((url, options) => options.method === "GET"
    ? { id: ID, state: "running", result: null } : { id: ID, cancellationRequested: true });
  const client = createDevelopmentScienceClient({ environment: { ...ENV }, transport: mocked.transport });
  assert.equal((await client.referenceStatus(ID)).state, "running");
  assert.equal((await client.cancelReference(ID)).cancellationRequested, true);
  assert.notEqual(mocked.calls[1].options.headers["X-Bloom-Science-Nonce"], mocked.calls[3].options.headers["X-Bloom-Science-Nonce"]);
});

test("completed calculation requires pinned provenance and valid tradeoff; unexpected prose is withheld", async () => {
  const reference = {version:"micom-reference-control-v1",scenario:"baseline",scope:"nonpersonal-engineering-control",
    status:"optimal",growthRate:0.5,linearGrowthMaximum:1,tradeoffGrowthTarget:0.5,tradeoffGrowthError:0,
    maxBoundViolation:0,maxSteadyStateResidual:0,observedBiology:false,clinicalValidation:false,predictiveValidation:false,
    model:{sha256:"36300ad00320f1ffde76f2ffca06be6403759d92ac320535d961a0ab2d0c94f1"},
    solver:"hybrid",solverProfile:"hybrid-reference-precision-v2",
    versions:{micom:"0.37.1",cobra:"0.30.0",optlang:"1.8.3",osqp:"0.6.7.post3",highspy:"1.16.0","python-libsbml":"5.21.2"},
    qpConvergence:[{status:"solved",iterations:100,primalResidual:0,dualResidual:0}],unexpectedProse:"synthetic-untrusted-field"};
  const call = async result => {
    const mocked=mockTransport({id:ID,state:"completed",result});
    return createDevelopmentScienceClient({environment:{...ENV},transport:mocked.transport}).referenceStatus(ID);
  };
  const result=await call(reference);
  assert.equal(result.result.personalUsePermitted,false);
  assert.ok(!JSON.stringify(result).includes("synthetic-untrusted-field"));
  for(const change of [{growthRate:0.49},{model:{sha256:"a".repeat(64)}},{solverProfile:"unknown"},
    {qpConvergence:[{status:"maximum iterations reached",primalResidual:0,dualResidual:0}]},
    {qpConvergence:[{status:"solved",iterations:100,primalResidual:0,dualResidual:-1}]},
    {maxBoundViolation:1},{linearGrowthMaximum:null}])
    await assert.rejects(call({...reference,...change}),DevelopmentTransportUnavailable);
  const failed=await call({...reference,status:"infeasible",growthRate:null});
  assert.equal(failed.result.growthRate,null);assert.equal(failed.result.tradeoffGrowthTarget,null);
});

test("outage errors are generic, never retried or sent through a direct fallback", async () => {
  let calls = 0;
  const client = createDevelopmentScienceClient({ environment: { ...ENV }, transport: async () => {
    calls++; throw new Error("synthetic upstream credential detail must stay private");
  } });
  await assert.rejects(client.submitReference("baseline"), error => {
    assert.ok(error instanceof DevelopmentTransportUnavailable);
    assert.ok(!error.message.includes("credential detail")); return true;
  });
  assert.equal(calls, 1);
});

test("configuration changes during challenge withhold the intended request", async () => {
  for (const changed of [{ NODE_ENV: "production" }, { BLOOM_DEV_SCIENCE_TOKEN: "synthetic-rotated-science-token-123456789" },
    { BLOOM_DEV_OLLAMA_MODEL: "different:fixture" }]) {
    const env = { ...ENV }; let calls = 0;
    const client = createDevelopmentScienceClient({ environment: env, transport: async () => {
      calls++; Object.assign(env, changed);
      return json({ nonce: "a".repeat(64), expiresInSeconds: 60 });
    } });
    await assert.rejects(client.submitReference("baseline"), DevelopmentTransportUnavailable);
    assert.equal(calls, 1);
  }
});

test("HTTP errors, redirects, compression, invalid challenges and oversized bodies fail closed", async () => {
  for (const response of [json({}, { status: 503 }), json({}, { status: 302 }),
    json({}, { headers: { "content-type": "application/json", "content-encoding": "gzip" } }),
    new Response("x".repeat(65537), { headers: { "content-type": "application/json" } }),
    json({ nonce: "short", expiresInSeconds: 60 }), json({ nonce: "a".repeat(64), expiresInSeconds: 3600 })]) {
    let calls = 0;
    const client = createDevelopmentScienceClient({ environment: { ...ENV }, transport: async () => { calls++; return response; } });
    await assert.rejects(client.submitReference("baseline"), DevelopmentTransportUnavailable);
    assert.equal(calls, 1);
  }
});

test("Ollama caller releases only bounded synthetic status, not extra model prose", async () => {
  const mocked = mockTransport({ scope: "synthetic-development-smoke", model: ENV.BLOOM_DEV_OLLAMA_MODEL,
    transportStatus: "completed", observedBiology: false, scientificallyValidated: false,
    rawModelOutputReleased: false, matchedExpectedResponse: true, outputTokenCount: 8,
    unexpectedText: "synthetic model text must not be returned" });
  const client = createDevelopmentScienceClient({ environment: { ...ENV }, transport: mocked.transport });
  const result = await client.smokeOllama();
  assert.equal(result.matchedExpectedResponse, true);
  assert.equal(result.unexpectedText, undefined);
  assert.deepEqual(JSON.parse(mocked.calls[1].options.body), { version: "ollama-development-smoke-v1", model: ENV.BLOOM_DEV_OLLAMA_MODEL });
});

test("clinically promoted or wrong-scope computation replies are rejected", async () => {
  for (const result of [{ id: ID, state: "completed", result: { scope: "personal", observedBiology: true } },
    { id: ID, state: "running", result: { private: "synthetic" } }, { id: "other", state: "completed" }]) {
    const mocked = mockTransport(result);
    const client = createDevelopmentScienceClient({ environment: { ...ENV }, transport: mocked.transport });
    await assert.rejects(client.referenceStatus(ID), DevelopmentTransportUnavailable);
  }
});
