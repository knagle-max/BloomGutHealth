# Mac development science: architecture and validation status

Owner scope, 2026-11-19. Audit base: `423d3279`; local work is uncommitted.

The Mac is an optional development laboratory. Production must start and serve
normal features without Ollama, MICOM, COBRApy, a Mac address, or Tailscale.
No personal-data execution, ports, production configuration, commits, pushes or
deployments are authorized by this implementation.

## Existing architecture and smallest change

| Existing component | Assessment | Reuse |
|---|---|---|
| `ml_service/main.py` | FastAPI, server bearer authentication, no browser CORS/docs; bounded fixed synthetic endpoint, structured abundance summaries | Add optional development research operations here after security qualification; no second service |
| `ml_service/research/synthetic_service.py` and `stoichiometry.py` | Exact-rational tiny synthetic controls, not MICOM/COBRA or biological reconstructions | Preserve as a separate synthetic tier |
| `server/ml-service.ts` | Explicit operation allowlist, configured destination, credential replacement, no redirects, response/time bounds | Preserve existing production client; no Mac URL insertion or broad proxy |
| `server/metabolite-research.ts` | Optional configured simulator, input hash, concurrency/time/response limits and honest unavailable state | Do not connect private meals/taxa to the Mac through this legacy production adapter |
| Existing private investigation, source snapshots, scientific retrieval, release/admission modules | Govern account/source versions, privacy, evidence and promotion independently | Scientific results remain research evidence candidates, never bypass these gates |
| `docs/scientific-models/prediction-task-registry.json` and rights catalogue | Existing capability/source governance | Register reviewed capabilities here; no competing registry |
| Production Python dependency configuration | No MICOM/COBRA requirement | Leave unchanged; isolated optional environment only |

Initial code is an offline, fixed nonpersonal MICOM reference control in the
existing research package. It does not install a service or modify application
startup. `require_development_science` requires both explicit development identity
and opt-in, rejecting conflicting production identity before dependency imports.
It is an admission gate, not a substitute for authentication or personal consent.

## Reproduce the engineering control

Do not modify the owner's working environment merely to match this experiment.
Create a disposable sibling environment. From the repository root on a machine
with Python 3.12:

```bash
python3.12 -m venv "$HOME/bloom-science/.venv-validation"
"$HOME/bloom-science/.venv-validation/bin/python" -m pip install -r ml_service/research/requirements-development-science.txt
"$HOME/bloom-science/.venv-validation/bin/python" -m pip check
"$HOME/bloom-science/.venv-validation/bin/python" -m unittest tests.test_development_science_policy tests.test_micom_reference
```

No server is started by these commands. Tests pass a development environment to
the pure admission boundary; they do not change the shell's production settings.
On this restricted Linux workspace COBRA's cache required `XDG_CACHE_HOME` set to
a writable private location outside Git. Store logs and later result artifacts
outside the repository, with restrictive user permissions. Do not upload them to
Actions or telemetry. Optional dependency installation is not a production build
step. The requirements file records the tested Linux resolution, not proof of
Apple Silicon wheel/solver compatibility or a security vulnerability audit.

The next offline slice adds `development_jobs.py`. Run its tests in that same
isolated environment with `python -m unittest tests.test_development_science_jobs`.
Eight tests passed, including actual spawned MICOM execution, hard timeout without
status polling, cancellation, busy rejection, oversized output, worker crash,
recovery, rate/capacity limits, result copies and access rechecks. The supervisor
allows one active job, ten starts/minute, sixteen retained records, maximum sixty
seconds wall time, thirty seconds CPU and 64KiB output. Results stay in memory;
terminal records older than fifteen minutes are removed on the next admission.
There is no durable recovery or guaranteed timed deletion while idle. Child stdout
and stderr are discarded. It is a process boundary, **not an OS sandbox**; Mac
resident-memory limits, authentication/account isolation and networking remain
unqualified, so no listener is started and the normal service has no development routes. Shutdown cancels active work and
refuses new submissions. Production execution remains disabled.

## Executed evidence and limits

Python3.12 Linux x86_64: seven tests passed using MICOM0.37.1, COBRApy0.30.0,
optlang1.8.3, OSQP0.6.7.post3 and HiGHS1.16.0. `pip check` passed.
MICOM0.39.1/COBRApy0.30.0 failed dependency resolution; COBRApy0.32.0 failed
import through its optional hopsy reference; optlang1.9.1/OSQP0.6.7 failed the QP
call. These failures motivate the tested pins; they are not Mac findings.

The bundled `micom.data.test_taxonomy(2)` explicitly duplicates E. coli core.
Imposed equal abundances and a 0.5 cooperative trade-off are engineering controls,
not a realistic species community or dietary model. The model bytes stay in the
external installed package; their SHA256 and library/solver versions are returned
at execution. No model bytes or numerical output artifacts are added to Git. Runtime checks the
fixed reference file SHA256 before model parsing; a mismatch refuses computation.
Baseline repeated growth is compared within 1e-5; reaction bounds and steady-state
residuals must be within 1e-5. Closed-medium infeasibility stays explicit with null
growth, not a fabricated zero. A steady-state residual is not chemical mass/charge
balance, thermodynamic feasibility or empirical validation.

Software metadata identifies MICOM Apache2.0 and COBRApy LGPL/GPL alternatives;
reference model commercial redistribution rights remain unreviewed. No AGORA,
owner report, taxonomic crosswalk, food substrate mapping or clinical outcome is
invented or imported. The owner's reported successful Mac COBRA run is distinct
from independently executed Apple Silicon validation.

## Formal validation framework: separate gates

| Gate | Required evidence | Current disposition |
|---|---|---|
| Technical reference control | Pinned install, actual LP/QP solver, repeatability, bounds, steady state and explicit failures | Local Linux control passed; wider stress tests and Apple Silicon still pending |
| Chemical/model audit | Reactions, formula/charge balance exceptions, annotations, compartments, biomass/maintenance, exchange/transport and energy-generating cycles | Mechanical balance/unknown/annotation/boundary checks present; independent biology, exchange semantics and cycle review pending |
| Biological applicability | Exact strain/model version, licensed reconstruction, supported taxa, missing organisms, medium/oxygen assumptions, source-qualified substrate IDs | Not validated; abundance never equals activity |
| Predictive validity | Rights-cleared published composition plus compatible measured metabolic outcomes/conditions; independent held-out evaluation and review | Dataset selection pending; no performance claim |
| Secure execution | Authentication/authorization, replay, payload/rate/concurrency, process time/memory/output limits, cancel/status, private transport identity, outage/recovery | Process and in-process dual-credential/single-use admission tests passed; memory, private transport and Mac outage/recovery not qualified |
| Promotion | Reviewed nonpersonal code/reference/evidence capability, provenance and limitations, separate release review/deployment | Disabled; no automatic promotion or dependency on Mac |

For predictive datasets first document accession/DOI, licence, composition assay,
strain mapping, medium/diet, measured endpoint, units, sampling times, confounders,
cohort overlap and split rationale. Composition-only datasets cannot validate
fluxes. Compare appropriate baselines, calibration/error and uncertainty; report
incompatible or absent ground truth explicitly. User's predictive-validation
message ended mid-sentence, so additional unspecified criteria are not claimed.

## Authenticated in-process interface — implemented, not network-enabled

The optional `ml_service.development:create_app` factory reuses the existing
FastAPI service and mounts fixed versioned routes only after explicit development
opt-in and two distinct configured service credentials. Normal `main:app` is
unchanged. Existing bearer middleware plus a separate development bearer are both
required. Server-issued 60-second single-use challenges bind identity, method,
path and exact body digest; replay, tampering, expiry, credential rotation and
restart fail closed. These challenges supplement private TLS and are not a new
cryptographic signature scheme. Mechanical model audit, applied medium uptake bounds, source hash, solver versions
and numerical tolerance accompany results. Audit status remains requires-biological-review,
with no automatic strain/diet/exchange mapping approval. No account/health inputs, arbitrary models/code,
paths or URLs are accepted. JSON size, extra fields, duplicates, query strings,
nonfinite constants and access after production-mode change are rejected.

Eleven API tests passed, including an authenticated ASGI submission → real spawned
MICOM solve → structured result, using no listener. The combined suite including
previous service regressions and the added chemistry audit passed56/56. A later
source-identity guard passed all5 focused reference tests; changed model bytes are
rejected before parsing or optimization. This is not a tailnet, Mac, biological or
clinical qualification. Shutdown preserves the existing app lifespan and cancels
workers. See [setup and boundaries](MAC_DEVELOPMENT_SETUP.md). No credentials,
model bytes or numerical result files were added to Git; no commit/push occurred.

## Remaining bounded integration

The development FastAPI factory currently permits only this fixed nonpersonal
reference control; expand operations only after their separate validation. Untrusted Ollama
arguments must pass identical strict schemas; never accept code, paths, imports,
commands, arbitrary URLs, uploads or unrestricted model IDs. The isolated child-process job, deadline, cancellation and bounded output controls
are present; complete Mac memory enforcement, retention/recovery qualification and
transport tests before service exposure. Keep
model errors explicit and do not echo raw input or solver exceptions into logs.

Mac gateway must bind localhost, use verified private Tailscale Serve transport
and independently authenticated signed/replay-protected requests. Render-side
userspace/embedded Tailscale support, restricted tagged identity, deny-by-default
ACL and auth tests require verification before setup instructions are considered
complete. No Funnel, public endpoint, router forwarding, LAN binding or runtime
external AI fallback. The dev caller must not reuse production health processing
credentials or silently transfer account data. Tailnet authentication alone does
not grant application permissions.

Before enabling even synthetic network access: test wrong credentials, wrong
tailnet identity, replay/clock skew, overload/oversize/model denial, timeout,
Mac/VPN outage and recovery. No real personal data before privacy and source
consent/revocation/deletion checks. Before any separately approved commit/push,
scan staged content and reachable history for secrets and sensitive records;
ignore rules do not protect tracked history. No history rewrite without approval.


## Optional Ollama smoke gateway checkpoint

`ollama_development.py` and the existing optional development router now support
a fixed nonpersonal acknowledgement only, not private investigation prompts.
Reuses dual service auth and exact-body nonce admission, rejects arbitrary model
arguments and cloud names, targets only127.0.0.1:11434 with no inherited proxy or
redirect/fallback, and caps rate/concurrency/time/output. Raw model text is withheld.
Ten new tests and all existing related service/science tests pass 67/67 locally.
No real Ollama, Mac, tailnet or production environment was contacted. The actual
Ollama daemon must be restarted with cloud features disabled and independently
checked; gateway env flags alone are not proof. Client deadlines do not prove
upstream GPU cancellation. Setup details are in `MAC_DEVELOPMENT_SETUP.md`.
This remains a disabled development transport control, not a scientifically
validated model or installed general private reasoning provider.


## Optional caller checkpoint

The separately installed `scripts/development-science` client uses an explicit
loopback HTTP CONNECT proxy and approved HTTPS MagicDNS origin, never direct
network fallback or a global proxy. Eleven no-socket tests passed, including
proxy/destination TLS/SNI option handoff, fixed synthetic operations, auth/nonce
protocol, unsafe config, outage and in-flight revocation. Optional dependency
advisory audit reports0 vulnerabilities; no independent security review claimed.
Production package files, imports and startup are unchanged. No actual Tailscale
daemon, Render deployment, Mac connection, real identity/ACL or certificate
rejection test has been performed. Keep those gates separate from this code proof.


## Formal validation checkpoint

The existing MICROBE-COMMUNITY-V1 task now records separate technical, biological,
predictive and release dispositions. Pseudo-atoms, unknown/nonfinite charges and
unsupported isotope/adduct/formula notation remain unassessable, not balanced or
proven biological errors. Implemented source digests identify the actual local
code without claiming a release commit; thermodynamics and energy-cycle review
remain not run. Focused28 audit/reference/job/API tests passed. A first
nonpersonal empirical dataset candidate and exact qualification gaps are tracked
in [the candidate assessment](micom-predictive-validation-candidates.md) and the
existing source-rights catalogue. No raw data, model bytes, participant records,
published-model performance claims or simulated output were promoted into Git.
No private/production capability has been activated.
