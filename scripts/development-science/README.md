# Optional development caller — synthetic traffic only

This is not imported by production. It creates no listener, starts no VPN daemon
and reads no health accounts. Dependencies and lockfile are isolated here, leaving
the root production package files unchanged. Installation/testing requires no Mac:

```bash
npm ci --prefix scripts/development-science --ignore-scripts
npm test --prefix scripts/development-science
```

All tests use in-memory HTTP responses and mocked TCP/TLS functions. No socket is
opened. Eleven tests cover configuration denial, exact payload/challenge binding,
TLS/SNI option handoff, credential isolation from CONNECT, status/cancellation,
fresh challenges, outage/no retry, config revocation, compression/size rejection
and research-only output scope. These are not actual certificate, tailnet policy,
Mac outage or Render deployment acceptance tests.

`createDevelopmentScienceClient()` constructs a client without connecting.
Only `submitReference('baseline'|'closed-medium')`, `referenceStatus(jobId)`,
`cancelReference(jobId)` and `smokeOllama()` are exposed. There is no free-form
request, model prompt, command, path, upload, personal source or tool API. Do not
add this module to normal application startup or a browser bundle. Integrating
real reasoning later must preserve existing source/consent/spending gates and
requires separate personal-data authorization; this client grants none.

Required environment for an eventually approved **development** caller:

| Name | Value/purpose |
|---|---|
| `BLOOM_RUNTIME_ENV` | `development` |
| `BLOOM_LOCAL_SCIENCE_ENABLED` | `true` |
| `BLOOM_DEV_MAC_CALLER_ENABLED` | `true`; absent is disabled |
| `BLOOM_DEV_MAC_URL` | Exact approved `https://mac-node.tailnet-name.ts.net` origin, no path/query/credentials |
| `BLOOM_DEV_TAILSCALE_PROXY_URL` | Explicit userspace HTTP proxy, e.g. `http://127.0.0.1:1055` |
| `ML_SERVICE_TOKEN` | Dedicated development service credential, injected privately |
| `BLOOM_DEV_SCIENCE_TOKEN` | Distinct calculation credential, injected privately |
| `BLOOM_DEV_OLLAMA_MODEL` | Exact installed local `model:tag`, only needed for smoke |

An actual production process is refused even with an injected development config.
Do not change the normal Render app's NODE_ENV or production flags for this tool;
an eventual authorized standalone development process must have its own scoped
configuration. No application import, subprocess or startup wiring is installed.

`NODE_ENV=production`, disabled TLS verification, diagnostic logging flags, short
or identical credentials, unsafe URLs and non-loopback proxies reject before a
request. Configuration/credential changes during a call withhold the result.
The TLS-validating HTTPS CONNECT agent is set per request; no global proxy or
production security setting is changed. Both requests share a 30 second deadline,
responses are bounded to 64 KiB, compression/redirects and automatic retries are
disabled. Errors contain no destination/credential/provider body. Raw Ollama
prose is never returned. Reference results must retain their research-only scope.

## Render userspace transport — design, not deployed

Render cannot directly reach the Mac's localhost or rely on its private IP. Use
a dedicated restricted tagged **development** Tailscale identity, explicit local
HTTP proxy and the Mac's private HTTPS Serve name. No TUN device or route changes
are assumed. This is the mechanism documented by Tailscale for restricted
container environments; this exact Render image/process has not been qualified.

After explicit networking/deployment approval only, an operator can prepare a
pinned/checksum-verified Tailscale binary in the authorized development runtime.
The following illustrates the daemon/enrollment commands, **not a production
startup script**. It must be supervised, readiness checked, stopped on shutdown,
and tested before use. No binary is downloaded or daemon started by this package:

```bash
umask 077
mkdir -p /tmp/bloom-dev-tailscale
tailscaled --tun=userspace-networking \
  --socket=/tmp/bloom-dev-tailscale/tailscaled.sock \
  --state=/tmp/bloom-dev-tailscale/tailscaled.state \
  --outbound-http-proxy-listen=127.0.0.1:1055
```

Once that supervised daemon is ready, in the same approved runtime:

```bash
tailscale --socket=/tmp/bloom-dev-tailscale/tailscaled.sock up \
  --auth-key=file:/etc/secrets/bloom-dev-tailscale-key \
  --advertise-tags=tag:bloom-dev-caller \
  --accept-routes=false --ssh=false --shields-up --timeout=30s
```

The file path contains no credential; its contents must be a restricted,
short-lived enrollment key provisioned outside Git via an approved secret file.
Do not print/copy the key, place it in build args, command arguments, URLs or logs,
enable shell tracing, reuse a production identity or assume a key survives
restart. Restrict file/state permissions and revoke/re-enroll as appropriate.
Admin approval is required before changing any tailnet or Render configuration;
do not provision paid infrastructure. The existing Render service is unchanged.

Tailnet admin must restrict caller tag → Mac service tag selected HTTPS port,
restrict tag owners, and check the full policy for broader additive grants.
Verify unrelated/production identities and other ports are denied; no Funnel,
public Ollama, subnet/exit routing or port 11434 exposure. The Mac runs the existing
development FastAPI factory on localhost behind private Serve, with independent
application credentials and fresh request challenges. Actual denied-identity,
TLS, VPN/Mac outage/recovery, rotation and cloud-disable tests remain outstanding.

Primary references checked 2026-11-19:
[userspace networking](https://tailscale.com/docs/concepts/userspace-networking),
[auth-key file support and initialization timeout](https://tailscale.com/docs/reference/tailscale-cli/up),
[Mac private Serve](https://tailscale.com/docs/reference/tailscale-cli/serve).
No operational success or personal-data authorization is inferred from these docs.


## Private completed-result exports

The same isolated test command now includes five local private-export tests
(sixteen total). The exporter has no HTTP endpoint or network access and refuses
production, personal-scope, Git-resident, symlinked or permissive destinations.
See [private results and recovery](PRIVATE_RESULTS_AND_RECOVERY.md) for exact
`BLOOM_DEV_PRIVATE_DIR` behavior, backup limits and maintenance. No active job
restore, encryption or personal-processing approval is implied.
