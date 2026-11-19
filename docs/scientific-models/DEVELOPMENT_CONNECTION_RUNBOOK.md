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
| Actual Tailscale policy | Complete current policy privately supplied/reviewed: one allow-all grant and own-device SSH check. Earlier disruptive replacement withdrawn; personal-access template prepared, subject to private device/flow inventory and control-plane validation |

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

## Preserve personal access: review first, activate only after approval

Offline Mac preparation is COMPLETE (owner-reported): pinned environment,
Uvicorn0.54.0, Click8.5.1, clean pip check, private credentials, service check and
all6 operational tests. No listener or Tailscale networking was activated.
Live serving/RSS behavior and private transport remain separate acceptance items.

The earlier tagged-science-node replacement is withdrawn and removed from this
checkout. It would remove most existing personal connectivity and tagging the
Mac would replace its user ownership. Do not apply it from an earlier commit.

Use [the personal-access template](tailscale-personal-access-policy.template.json)
only as a privately completed proposal. It is NOT a policy ready to paste: the
host placeholder is deliberately invalid until replaced outside Git with the
existing Mac's Tailscale IPv4. Keep the Mac user-owned and untagged. Do not log
out, re-enroll, retag or run `tailscale up` on the existing Mac identity.

The member-to-member all-port grant preserves the current broad connectivity
between user-owned personal devices; it is deliberately broader than the science
caller grant. Tagged nodes are not members. The Render caller gets only TCP443
to the specific existing Mac host, not a wildcard destination. Existing own-device
SSH check remains unchanged. Personal members can still reach the science HTTPS
endpoint by policy; dual application authentication remains mandatory for them.
A tailnet administrator or compromised personal device is not isolated by this
policy. This design restricts the new service identity without claiming to
harden all existing personal devices.

### Latest supplied inventory and remaining identity check

Owner reports the Mac is connected, three devices are visible (macOS, Linux and
iOS), no Serve/Funnel mapping exists and TCP443 has no reported listener. This
removes the reported mapping/listener conflict; recheck immediately before use.
Actual hostnames and addresses are intentionally absent from this repository.

The operating system or device display name does not establish Tailscale
ownership, tags, shared status or routing. In Machines, inspect the Linux node's
owner/tags and each node's advertised/approved subnets and exit-node role without
changing anything. A provider-managed Linux node must not be retagged, enrolled
as the Render caller or given extra access merely because it is visible.

- If all three are ordinary user-owned member devices and no subnet/exit/shared
  paths are used, the template's member-to-member grant covers their current
  direct connectivity without extra rules.
- If Linux is tagged, preserve only its existing required directional flows with
  explicit reviewed private grants to/from that existing tag or exact host. Do
  not place the restricted Render caller tag in a broad preservation rule. Its
  displayed name alone is not an access selector.
- If any device routes subnets, route approval and access permission are separate.
  Preserve the actual required subnet destinations/ports for personal members;
  granting access only to the router's own Tailscale address is insufficient.
  Do not advertise/approve new routes or grant routed access to the Render caller.
- If an exit node is used, review its Internet destination permission separately
  against the current policy and preserve the relied-upon personal flow. Do not
  add blanket Internet destinations to the science caller.

Until those ownership/route facts are confirmed, the policy is a finalized base
proposal, not a verified complete replacement. No administrative network tool is
connected here; the reported three-device list cannot establish absent routes.

### Offline/private inventory before an activation proposal

On the Mac, these read-only commands do not activate Serve or change identity:

```bash
tailscale version
tailscale status --json
tailscale ip -4
tailscale serve status
tailscale funnel status
lsof -nP -iTCP:443 -sTCP:LISTEN
```

Keep outputs private, outside Git; they can identify users/devices/IPs. If a
command is unsupported, stop that check and record the installed client variant;
do not install a second daemon or change the existing login to make it pass.
In the admin console, privately inventory all existing tagged nodes, shared nodes,
subnet/exit-node routes and personal services/ports relied upon. The supplied
policy alone does not reveal this inventory. The member grant does NOT preserve
traffic to/from tagged devices, shared-node paths or routed subnets. Add only
reviewed necessary flows to the private proposal before approval. Do not apply
if any current personal flow would be lost or remains uncertain.

Complete the host placeholder privately. Add actual personal-device policy tests
for each relied-upon flow, as well as the template's caller TCP443 allow and
TCP22/8765/11434, UDP443 and unrelated-role denials. Test the complete candidate
with the Tailscale policy validator/editor before saving; structural offline
checks are not control-plane or live network verification. Keep the existing
policy privately for deliberate recovery. Adding a narrow grant while retaining
the global src*/dst*/ip* grant does not restrict the Render caller.

### Minimum approvals, in order

1. **Mac localhost listener:** start the existing foreground service command above;
   no login/autostart changes. Inspect listener binding is only127.0.0.1:8765.
2. **Reviewed policy plus HTTPS/Serve:** approve the privately completed full policy
   only after personal-flow tests and inventory pass. Keep the existing Mac
   ownership. Inspect existing Serve mappings and port443; if occupied, stop for
   a route/port plan rather than replacing a mapping. HTTPS requires a certificate
   whose hostname appears in public certificate-transparency logs. Review the
   existing machine/tailnet name privately; any rename/DNS change needs separate
   explicit approval because it may affect existing access. If names are acceptable
   and no mapping conflict exists, the approved command shape is
   `tailscale serve --https=443 http://127.0.0.1:8765`. No Funnel or public ports.
3. **Restricted staging caller:** approve dedicated short-lived, non-reusable
   caller-tag enrollment, enabling/verifying node-key expiry, userspace daemon,
   private credentials and the exact staging configuration changes below. No
   production changes or paid service. Do not replace the normal app start command.
   Actual supported execution/bootstrap on this Render service must be verified;
   if unavailable, report the limitation rather than silently deploying or buying
   another service. Any deployment/restart required to change execution needs its
   own explicit approval; this runbook does not authorize it.

After these approvals, run only fixed synthetic controls: baseline, wrong token,
expired token, nonce replay, unauthorized tagged-role denial (personal member identities retain network access but require application credentials), TLS rejection,
Mac/VPN outage and recovery, cancellation and credential rotation. Record only
nonpersonal pass/fail summaries in Git. Real personal processing remains disabled
and is not authorized by a successful synthetic connection. No Ollama dependency
is required for the MICOM reference control.

### Minimal execution sequence after the corresponding explicit approvals

**Approval A — Mac localhost listener only.** In the existing checkout and pinned
environment, keep this foreground terminal open:

```bash
export BLOOM_RUNTIME_ENV=development
export BLOOM_LOCAL_SCIENCE_ENABLED=true
BLOOM_PY="$HOME/bloom-science/.venv-validation/bin/python"
BLOOM_DEV_PRIVATE="$HOME/bloom-science/private-development"
"$BLOOM_PY" -m ml_service.development_service check --config "$BLOOM_DEV_PRIVATE/credentials.json"
"$BLOOM_PY" -m ml_service.development_service serve --config "$BLOOM_DEV_PRIVATE/credentials.json" --approved-local-listener
```

Do not reinitialize an existing credential file. If it expired, stop for approved
rotation/private credential synchronization rather than bypassing expiry. In a
second terminal inspect `lsof -nP -iTCP:8765 -sTCP:LISTEN`; continue only if the
service is bound to127.0.0.1, never wildcard/LAN. This approval does not include
Serve, policy edits or Render settings.

**Approval B — exact privately reviewed policy and private HTTPS Serve.** First
resolve the Linux/tag/route questions above, complete the host alias privately,
validate the whole policy and personal-flow tests, then save only the approved
candidate. Keep the existing Mac identity unchanged. Confirm acceptable
certificate hostname/DNS privacy and no new port/mapping conflict. In another
foreground terminal:

```bash
tailscale serve status
tailscale funnel status
lsof -nP -iTCP:443 -sTCP:LISTEN
tailscale serve --https=443 http://127.0.0.1:8765
```

Review any HTTPS enablement prompt before accepting: it can change tailnet HTTPS
settings and issue a public-CT-visible hostname certificate. If those settings
were not part of the explicit approval, stop. Keep returned private HTTPS URL
outside Git and do not run Funnel, `tailscale up`, logout or retag commands on
this Mac. In this foreground phase Ctrl+C stops the newly started process; do not
use a broad Serve reset or alter unrelated mappings.

**Approval C — exact restricted staging runtime and configuration.** Enroll only
the new dedicated caller identity with the caller tag; never reuse the existing
Linux device or Mac identity. Runtime binary qualification/bootstrap and private
secret handling must be specified and reviewed on this Render service before
executing the daemon command below. Source preparation is not proof that a native
Render service can already run an additional supervised daemon. After approval,
verified daemon readiness and private settings installation, run the fixed probe
from the existing checkout as an auxiliary process:

```bash
node scripts/development-science/render-caller.mjs
node scripts/development-science/render-caller.mjs --approved-synthetic-network-check
```

The first command checks configuration only. The second uses the private
connection and requires explicit synthetic-network-test approval. Keep the
normal app start command unchanged. If starting the auxiliary runtime requires a
new build/restart/deployment, pause for that specific approval; do not silently
provision infrastructure or turn this command into the web service start command.

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
application credentials and only the dedicated Render caller tailnet identity;
keep the existing user-owned Mac identity and personal Tailscale access intact;
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
