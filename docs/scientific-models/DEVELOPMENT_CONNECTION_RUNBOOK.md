# Development scientific connection: next executable steps

No listeners, Serve, live credential changes, infrastructure or deployments were
activated. All names below are generic roles. Real workspace/device IDs, names,
tailnet addresses, users, credentials and policy exports belong outside Git.
Production has no import/startup dependency on this optional connection.

## Current assessment

| Existing component | Result / remaining work |
|---|---|
| Pinned scientific environment | Owner reports Apple Silicon validation OK in `~/bloom-science/.venv-validation`; leave `.venv312` unchanged |
| Existing FastAPI/research service | Reused through optional development factory; no duplicate scientific service |
| Existing versioned jobs API | Fixed reference commands, independent dual authentication, exact-body one-use nonce, bounded jobs; unchanged personal research contracts |
| Reference computation | Pinned model/library/profile, convergence and tradeoff guards, explicit failed/infeasible results; not predictive/clinical validation |
| New resource operation | 30s worker CPU,45s wall budget,1GiB sampled RSS watchdog, one active worker; resource telemetry failure stops the worker; shutdown joins cleanup |
| Memory limit semantics | Native RSS sampler is fixed `/bin/ps` argv with an owned child PID, no shell;100ms sample interval and500ms probe timeout can overshoot. Not a kernel sandbox; Mac qualification of this addition remains required |
| New credential operation | Owner-only0600 private file in0700 directory,24h default expiry, atomic rotation/revocation; observed invalidation cannot be undone by replaying the old file; restart explicitly with the new pair |
| New startup operation | Offline check, fixed localhost8765, one worker, no access log/proxy headers, no auto-start; listener requires a separate explicit CLI flag and actual owner approval |
| Existing Node development caller | Explicit localhost HTTP CONNECT proxy, private HTTPS/SNI, no redirects/direct fallback/global proxy; now verifies reference provenance/diagnostics and returns only a known research-only projection |
| Actual Render inspection | A single native Node web service using `npm start` was visible. In this repository that command sets NODE_ENV=production, which the development caller refuses. Owner confirms this existing service is development/staging only. A separately scoped caller is prepared below; actual private transport has not been tested |
| Actual Tailscale policy | Complete current policy privately supplied/reviewed: one allow-all grant and own-device SSH check. Exact generic replacement prepared, not applied or control-plane validated |

Do not point `METABOLITE_RESEARCH_URL` at this control: that existing contract
carries personal report/plan scenarios, whereas this development API accepts
only fixed nonpersonal controls. Neither Ollama nor an LLM can supply code,
commands, model paths or arbitrary tool arguments.

## Architecture already prepared

Approved development execution target → existing isolated Node caller → explicit
127.0.0.1 HTTP CONNECT proxy → userspace Tailscale client → private HTTPS Serve
on generic scientific-node identity →127.0.0.1:8765 → existing FastAPI development
routes → isolated MICOM worker → validated structured reference result.

Tailscale identity/policy and independent application credentials are both
required. Ollama remains a separate optional synthetic-smoke interface and is
not needed for MICOM. No production request path depends on the Mac.

## Mac commands that do not activate networking

After these source changes are published/pulled, use the validated interpreter:

```bash
cd /path/to/existing/BloomGutHealth
BLOOM_PY="$HOME/bloom-science/.venv-validation/bin/python"
"$BLOOM_PY" -m unittest -v tests.test_development_science_jobs tests.test_development_science_api
"$BLOOM_PY" -c 'import importlib.metadata as m; print(m.version("uvicorn"))'
```

The last command only checks the serving dependency. It may report missing:
Uvicorn was not required by the already-passed scientific suite. Do not recreate
or upgrade the scientific environment. The separately pinned serving addition
is `uvicorn==0.54.0` and `click==8.5.1`, tested in a temporary dependency directory.
Only if needed and approved for local preparation, add these two packages with
`"$BLOOM_PY" -m pip install --no-deps uvicorn==0.54.0 click==8.5.1`, then run
`"$BLOOM_PY" -m pip check`. Existing scientific pins stay unchanged.

Preparation of a NEW inactive credential file (does not overwrite existing files,
change live credentials, print tokens or start services):

```bash
export BLOOM_RUNTIME_ENV=development
export BLOOM_LOCAL_SCIENCE_ENABLED=true
BLOOM_DEV_PRIVATE="$HOME/bloom-science/private-development"
umask 077
mkdir -p "$BLOOM_DEV_PRIVATE"
"$BLOOM_PY" -m ml_service.development_service init --config "$BLOOM_DEV_PRIVATE/credentials.json"
"$BLOOM_PY" -m ml_service.development_service check --config "$BLOOM_DEV_PRIVATE/credentials.json"
"$BLOOM_PY" -m unittest -v tests.test_development_operations
```

An existing directory must already be owner-only0700; the program refuses unsafe
permissions instead of changing them. It refuses repository paths, symlinks,
nonregular/hard-linked files, oversized/ambiguous JSON and expired credentials.
If `init` says the file exists, stop and use the existing dedicated config;
do not overwrite or paste its contents. Check output names only the blocked
stage, never token values/private paths. No shell tracing or environment dumps.

## Approval checkpoint: do not run yet

Separate approval is required BEFORE the following localhost listener command:

```bash
"$BLOOM_PY" -m ml_service.development_service serve --config "$BLOOM_DEV_PRIVATE/credentials.json" --approved-local-listener
```

It runs in the foreground. Ctrl+C invokes existing lifespan shutdown and waits
for worker cleanup. No launchd/login/reboot service is installed. A restart loses
active jobs/results and all old nonces; submit a new control explicitly. Do not
restart while jobs are expected to survive or claim durable result recovery.

Live rotation/revocation is also separately approved. After approval, `rotate`
and `revoke` replace only that dedicated private file. Rotation invalidates the
running instance until explicit restart with the new pair. Revocation/expiry
stops new work and withholds in-flight responses; rollback does not reactivate
the old instance. This is not Tailscale-node revocation.

## Exact Tailscale administrator work, pending approval

1. Review [the complete proposed replacement](tailscale-development-policy.proposed.json),
   based on the complete policy supplied privately. Do not save/apply it yet.
   It replaces the allow-all grant with caller-tag → node-tag TCP443. It keeps
   the existing own-device SSH check through a narrow TCP22 self grant only
   for user-owned, untagged devices. No SSH is granted to the tagged scientific
   node. Other previously unrestricted tailnet traffic will stop; any additional
   needed flows must be specified before approval. No groups, postures or
   nodeAttrs were active in the supplied policy; commented examples are omitted.
2. Generic tag ownership is restricted to administrators. The denied-role tag
   exists only for policy tests; do not enroll production services or assign
   the development caller tag to another role. Tag permissions are additive.
3. After explicit policy-change approval, paste the replacement in Access Controls.
   Its built-in tests must pass before saving: caller TCP443 allowed; caller
   TCP22/8765/11434 and UDP443 denied; denied-role TCP443 denied; reverse access
   denied. These are prepared tests, not an assertion that real identities have
   passed network testing. Keep the previous policy privately for reviewed recovery;
   do not restore the unrestricted rule as a routine network-outage workaround.
4. Before tagging the dedicated scientific-service node, acknowledge that tagging
   replaces user ownership: its former autogroup:self SSH access no longer
   applies. Other untagged own-device SSH remains scoped to its owner/check mode.
   If the Mac is also needed as a user-owned tailnet device, stop for an explicit
   identity plan instead of silently changing its ownership.
5. After separate enrollment approval, create a non-reusable, short-lived,
   restricted caller enrollment key with only the caller tag. Enable and verify
   node-key expiry on both dedicated nodes: tagged nodes disable key expiry by
   default, and reauthentication can disable it again. Keys/state stay private;
   use file-based enrollment, never token values in CLI arguments.
6. Before certificate/Serve approval, choose a generic non-personal node hostname
   and inspect the tailnet DNS name privately. Public HTTPS certificates publish
   their full hostname in append-only certificate-transparency logs; do not use
   a personal computer name or identifying tailnet name. Use a randomized
   non-identifying tailnet DNS name if needed, subject to separate approval.
   No certificate is issued during preparation. Inspect existing Serve/Funnel configuration privately;
   do not overwrite another mapping. Then the approved command shape is
   `tailscale serve --https=443 http://127.0.0.1:8765`. No Funnel, file/directory
   sharing, LAN binding, exit node, subnet advertisement or router forwarding.


## Existing Render staging target; activation still requires approval

The real service metadata supports a native Node runtime, not an already-running
Tailscale client. Vendor userspace mode supports platforms without TUN via a
local HTTP proxy. That is a supported design, NOT proof on this actual Render
runtime. Do not alter the existing app's NODE_ENV, start command or global proxy.
The owner confirms this existing service is development/staging only. Its
production-mode Node command is an application optimization setting; preserve it.
No new paid infrastructure is proposed. The auxiliary caller uses a separate
minimal child environment and must never replace the normal start command.
The method of running the userspace daemon and auxiliary process on this actual
Render runtime remains unconfigured and unverified.

After activation approval, qualify a pinned/checksummed Tailscale binary on that
runtime, restricted identity enrollment, writable private state/socket paths,
foreground process supervision, readiness and restart/revocation. The existing
caller expects these private runtime settings; no real values go in Git:

- BLOOM_DEPLOYMENT_CLASS=staging and BLOOM_DEV_MAC_CALLER_ENABLED=true.
- BLOOM_DEV_APPROVED_RENDER_SERVICE_ID: the privately approved service ID;
  must equal the platform-injected RENDER_SERVICE_ID. Neither value belongs in Git.
- BLOOM_DEV_MAC_URL: private HTTPS MagicDNS origin, real identifying value kept private.
- BLOOM_DEV_TAILSCALE_PROXY_URL: explicit `http://127.0.0.1:1055`.
- BLOOM_DEV_MAC_ML_TOKEN and BLOOM_DEV_SCIENCE_TOKEN: matching dedicated credentials,
  entered through approved private secret handling, never logs/browser/query/Git.

The operator command `node scripts/development-science/render-caller.mjs` checks
configuration without spawning a child or making network requests. Only after
explicit approval and verified proxy readiness, append
`--approved-synthetic-network-check` to run the fixed nonpersonal baseline probe.
This is an auxiliary command, never a replacement for `npm start`. The flag does
not constitute owner approval. The child receives only the dedicated origin,
proxy and two tokens plus development flags; it receives no database credentials,
provider keys, account data or runtime identifiers. BLOOM_DEV_MAC_ML_TOKEN maps to
ML_SERVICE_TOKEN only inside that child. Do not overwrite the normal app's token,
NODE_ENV or provider settings. A failed probe reports only generic status.

Userspace daemon shape after approval: `tailscaled --tun=userspace-networking
--outbound-http-proxy-listen=127.0.0.1:1055 --socket=<private-socket>
--state=<private-state>`. Enroll using `tailscale --socket=<private-socket> up
--auth-key=file:<private-auth-key-file>` with only the approved development tag,
no routes/exit-node advertisements. No global HTTP_PROXY/ALL_PROXY or direct
fallback. Poll at least3seconds apart: each status requires two authenticated
requests. Real TLS rejection, identity denial, rotation, VPN/host outage and
recovery must be demonstrated on the approved target before claiming connectivity.

## Validation and decommissioning

Offline: unit/API/resource/credential tests plus the isolated Node package.
For the cross-language test, set BLOOM_DEV_TEST_PYTHON to the validated interpreter
and run npm test in scripts/development-science. It drives the existing Node
caller through real in-process ASGI and spawned MICOM for baseline/infeasible
controls, wrong credentials and unsupported inputs, without sockets. It does not
qualify real TLS, Tailscale identity enforcement or Render deployment.

After explicit network approval: test synthetic request, wrong/expired tokens,
old nonce/credential replay, allowed vs denied identities/ports, certificate
failure, resource exhaustion, solver failure, Mac restart/disconnect, VPN outage
and recovery, verifying ordinary Bloom paths continue independently.

To decommission after approval: disable only the development caller, revoke its
application credentials and both dedicated tailnet node/enrollment identities;
turn off only the Serve mapping created here, stop the foreground Mac process,
remove dedicated private URL/secrets/state and remove unused development grants.
Do not reset unrelated Serve settings or delete personal datasets/environments.
Real hostnames, node IDs, workspace names/IDs, addresses and secrets were never
versioned, so replacement/decommissioning needs no identifying source-code edit.
Control-plane/private backup retention and any previously issued certificate
transparency entries are separate; no secure-erasure claim. Do not restore
revoked credential backups into a restarted service: rotate a fresh pair.

Primary references: [Render private network](https://render.com/docs/private-network),
[Tailscale userspace](https://tailscale.com/docs/concepts/userspace-networking),
[Serve](https://tailscale.com/docs/reference/tailscale-cli/serve),
[policy syntax](https://tailscale.com/docs/reference/syntax/policy-file),
[HTTPS hostname publication](https://tailscale.com/docs/how-to/set-up-https-certificates).
