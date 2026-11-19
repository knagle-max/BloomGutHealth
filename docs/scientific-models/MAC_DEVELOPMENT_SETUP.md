# Mac science development setup — offline proof first

This is development/scientific validation, not a production service. Production
does not import the development entry point or require a Mac/tailnet/model.
No networking commands below have been run for you. Starting a listener, enabling
Serve, configuring Render/tailnet or deploying requires the owner's explicit
approval. Real personal health information is not authorized for these controls.

## 1. Reproduce without changing the working Mac environment

Keep the existing `~/bloom-science/.venv312`. Make a disposable sibling environment.
The source files are published on `enhance/bloom-experience`. With a clean checkout
on that branch, run `git pull --ff-only origin enhance/bloom-experience` first.
Set `BLOOM_REPO` to the actual repository location on your Mac, then run:

```bash
BLOOM_REPO="$HOME/BloomGutHealth"
cd "$BLOOM_REPO"
python3.12 -m venv "$HOME/bloom-science/.venv-validation"
"$HOME/bloom-science/.venv-validation/bin/python" -m pip install -r ml_service/research/requirements-development-api.txt
"$HOME/bloom-science/.venv-validation/bin/python" -m pip check
"$HOME/bloom-science/.venv-validation/bin/python" -m unittest tests.test_development_science_policy tests.test_micom_reference tests.test_development_science_jobs tests.test_development_science_api tests.test_reference_model_audit tests.test_ollama_development
```

These tests use in-process ASGI requests and spawned calculation workers. They do
not start a network listener or use personal samples. Package/model caches and
results belong outside Git. Linux passed; Mac installation and execution remain
unverified until performed there. Record platform, library/solver versions and
pass/fail locally, not personal output or credentials in GitHub/CI. Do not replace
a failed optimization with zero or claim predictive validity from a green test.

## 2. Optional API contract, currently tested without network

`ml_service.development:create_app` reuses the existing FastAPI research app.
The production entry point remains `ml_service.main:app`. The development factory
refuses to start without:

| Variable | Purpose |
|---|---|
| `BLOOM_RUNTIME_ENV=development` | Explicit development identity |
| `BLOOM_LOCAL_SCIENCE_ENABLED=true` | Explicit local experiment opt-in; default absent/disabled |
| `ML_SERVICE_TOKEN` | Dedicated existing-service development credential, never production's credential |
| `BLOOM_DEV_SCIENCE_TOKEN` | Independent calculation credential, different from ML token |
| `NODE_ENV` | Must not be `production`; a conflicting production identity rejects execution |

Each token must have at least 32 UTF-8 bytes, at most 512, without whitespace.
Use separate cryptographically random tokens stored outside Git, permissions0600,
and inject via the process environment. Never paste them into source, browser
JavaScript, query parameters, chat, process command-line arguments or logs. Disable
shell tracing. No credentials are generated or printed by the tests.

All routes below require both `Authorization: Bearer <ML_SERVICE_TOKEN>` and
`X-Bloom-Science-Authorization: Bearer <BLOOM_DEV_SCIENCE_TOKEN>` headers:

1. Serialize the fixed calculation body to exact bytes. Only
   `{"version":"micom-reference-control-v1","scenario":"baseline"}` or the
   `closed-medium` scenario is accepted. No account, sample, taxa, raw uploads,
   code, paths, URLs or arbitrary model IDs are supported.
2. POST `/api/ml/research/development/v1/challenge` with JSON `method`, `path` and
   `bodySha256`, the SHA256 of those exact request bytes. No query parameters.
3. Send the intended request with the same bytes and returned nonce in
   `X-Bloom-Science-Nonce`. It expires after60seconds and is consumed once.
   Body/method/path mismatch, expiry, credential rotation or restart invalidates it.
4. POST `/api/ml/research/development/v1/jobs` submits; GET `/jobs/<id>` retrieves
   status/result; DELETE `/jobs/<id>` requests cancellation. GET/DELETE use a new
   challenge bound to their exact full path and the SHA256 of an empty body.

Here `/jobs/<id>` is relative to the same development/v1 prefix. Poll slowly:
authorized requests are capped at60/minute, submissions at10/minute, one active
worker. Request bodies are at most1024bytes, results at most64KiB. Requests must be
JSON; GET/DELETE must have no body. Never put credentials in the URL. A nonce is
request freshness, not a replacement for private TLS or service credentials.
The reasoning controller, not Ollama, must hold credentials and enforce the tool
allowlist. Ollama receives no authority to execute Python or shell commands.

## Optional Ollama smoke interface — synthetic only

The same optional development factory now offers POST
`/api/ml/research/development/v1/inference/smoke`, protected by the same two service
credentials and single-use exact-body challenge. Its entire request schema is
`{"version":"ollama-development-smoke-v1","model":"<installed-model:tag>"}`.
The model must exactly match the operator's configured single-model allowlist.
No prompts, health records, tool arguments, paths, URLs or generation options
can be supplied. Normal production routes do not mount this interface.

Additional environment variables, absent/disabled by default:

| Variable | Purpose |
|---|---|
| `BLOOM_DEV_OLLAMA_ENABLED=true` | Opt in to the fixed smoke interface only |
| `BLOOM_DEV_OLLAMA_MODEL` | Exact already-installed local `model:tag`; cloud names/URLs rejected |
| `OLLAMA_NO_CLOUD=1` | Required local-only setting; must be applied to actual Ollama server as well as gateway |

Ollama's local API can also serve cloud models. A localhost destination alone is
not proof of local inference. Before any approved Mac/network activation, configure
cloud features off in the actual Ollama process, restart it and verify that setting.
Official macOS guidance uses `launchctl setenv`; the conditional command is
`launchctl setenv OLLAMA_NO_CLOUD "1"`, followed by restarting Ollama. This has not
been run here. Setting the variable only on Bloom's gateway does not verify the
already-running Ollama server, and cloud aliases still require actual inspection.
No personal-data processing is implemented or authorized by this interface.

The gateway posts only a fixed acknowledgement prompt to 127.0.0.1:11434. It
requests 16 output tokens, 1024 context, no thinking and immediate unloading. One
active request, ten attempts/minute, a 15 second gateway deadline, 64 KiB raw response
and 2 KiB text limits apply. Environment proxies, redirects, upstream credentials,
model downloads and external-provider fallback are disabled. Raw model text is
withheld: results contain only transport/match status and reported token count
(unknown stays null), not scientific conclusions. HTTP timeout/cancellation does
not prove the Ollama process stopped computing or released GPU memory; verify
actual Mac cancellation/resource behavior before activation.

Ten gateway tests plus existing calculations/authentication/service regressions
passed in a 67-test local suite. Gateway tests use in-memory HTTP transport, not a
live Ollama server or tailnet. A transport acknowledgement is not model performance,
biological prediction, model-rights approval or private-investigator installation.

Primary references checked 2026-11-19:
[Generate API](https://docs.ollama.com/api/generate),
[local-only/cloud settings](https://docs.ollama.com/faq),
[cloud API routing](https://docs.ollama.com/cloud).

## Optional development caller — implemented, no network activation

The isolated Node caller in `scripts/development-science/` implements explicit
HTTPS CONNECT via a localhost Tailscale userspace proxy. Its eleven tests use
in-memory HTTP and mocked TCP/TLS functions, opening no sockets. Dependencies have
their own private package/lockfile; root production packages are unchanged.

```bash
npm ci --prefix scripts/development-science --ignore-scripts
npm test --prefix scripts/development-science
```

The caller defaults off and refuses an actual production process even if passed
a development config. Never change the normal Render app's production NODE_ENV
or global proxy to run this tool. No application wiring or daemon is installed.
See [exact caller environment and conditional enrollment commands](../../scripts/development-science/README.md).
File-based Tailscale enrollment is supported by official CLI documentation;
actual secret provisioning, restricted policy and deployment remain untested.

## 3. Network plan — not an activation instruction

After approval and Mac resource/security qualification, the existing service's
development factory may run with Uvicorn bound **only** to `127.0.0.1`, one worker,
no access log. Ollama stays separately on `127.0.0.1:11434`. The optional smoke
interface forwards only its fixed synthetic prompt, never biological records.

Official Tailscale Serve documentation supports proxying a local127.0.0.1 HTTP
port over private HTTPS, including macOS port serving. Use that port proxy, not
file/directory serving, Funnel, LAN binding, port forwarding or an insecure TLS
override. The approved future command shape is `tailscale serve --https=443
http://127.0.0.1:<approved-port>`; do not execute until approval. Confirm exact
installed-client syntax/status and no Funnel before activation.

Render's normal network cannot reach the Mac's localhost. Tailscale documents
`tailscaled --tun=userspace-networking` and a local HTTP/SOCKS proxy for platforms
without a TUN device. The future **development-only** caller must explicitly use
that loopback proxy and the Mac's private HTTPS MagicDNS destination, verify TLS,
refuse redirects and fail closed; do not set a global proxy for normal Bloom
traffic or install this dependency in production. Render-specific process/image,
secret-file authentication and readiness behavior are not yet deployment-tested.
Do not provision a new paid service, invent an auth key or change the current
Render service settings to test the plan.

Tailscale administrator tasks before any networking approval/execution:

- Create a dedicated tagged development caller identity and a separately tagged
  Mac service. Restrict tag ownership to designated administrators. Do not reuse
  a personal interactive identity or a production-wide auth key.
- Permit only that caller tag to the Mac service tag's selected HTTPS port.
  Check the complete policy: broader existing grants are additive and can defeat
  a narrow new grant. No wildcard users/destinations, subnet routes, exit node,
  tailnet SSH, production caller access or Funnel capability for this service.
- Add policy tests demonstrating the allowed caller/port and denied unrelated
  identities, ports and production identities. Verify device approval, expiry,
  revocation and key rotation without printing keys.
- Use a restricted, short-lived enrollment credential stored as a Render secret
  file/environment secret, not source or browser configuration. Verify supported
  file-based enrollment and the precise deployment image before writing startup
  commands; don't put an auth key directly in a process argument.

Primary references checked 2026-11-19:
[Serve](https://tailscale.com/docs/reference/tailscale-cli/serve),
[userspace networking](https://tailscale.com/docs/concepts/userspace-networking).
This documents a supported transport mechanism, not a successful Render→Mac test.

## 4. Remaining activation and scientific gates

Before synthetic network testing: Mac memory/resource enforcement, trusted TLS,
restricted tailnet identity/policy tests and explicit networking approval. Then
test wrong credentials, replay, unauthorized tailnet identity, overload, Mac/VPN
outage, restart/recovery and rotation with fixed nonpersonal inputs. Neither an
ASGI test nor a Render LIVE status proves these network tests.

Biological/predictive review remains separate: exact licensed strain/model and
database versions, formula/charge/transport/diet/taxonomy audits, missing organisms,
compatible published measured endpoints, held-out validation and independent
review. Simulated flux is not a measured concentration or validated outcome.
Only reviewed nonpersonal code, reference data, evidence and validated capabilities
may later be promoted through a separately approved production deployment.


## Private records and recovery

The local operator-only exporter saves completed fixed reference controls outside
Git in owner-only directories/files; no raw record is logged. Configure
`BLOOM_DEV_PRIVATE_DIR` to an absolute directory outside the checkout, never an
ignored repository subfolder. Export is plaintext private filesystem storage,
not E2EE or permission for personal data. The job supervisor itself remains
ephemeral and cannot restore active work after restart.

See [private export, backup and recovery](../../scripts/development-science/PRIVATE_RESULTS_AND_RECOVERY.md).
No launchd/autostart is intended or installed during this validation phase.


## Next bounded operational step

The owner confirms the pinned Mac validation environment passed. Reuse
`~/bloom-science/.venv-validation`; do not change `.venv312`. Operational code,
exact no-listener checks, conditional startup, full-policy/Render gaps and
decommission steps are in [the connection runbook](DEVELOPMENT_CONNECTION_RUNBOOK.md).
No networking or deployment is authorized by test success or that document.
