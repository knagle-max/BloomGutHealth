# Mac development science acceptance — partial local proof

2026-11-19. Publication base: remote enhance/bloom-experience at
d07c514f06f8137b06ea2d5a14aaf2d0593dc0cb. Owner explicitly authorized committing
and pushing this development bundle; no deployment or network activation is authorized. This scopes the owner's Mac/Ollama/MICOM/COBRA requests and does not
replace the existing v0.5/v0.6 backlog or declare the full RC ready.

| Requirement / acceptance item | Disposition | Evidence / remaining dependency |
|---|---|---|
| Reuse existing FastAPI/research architecture | IMPLEMENTED_AND_TESTED | Optional factory uses existing service/auth/lifespan; normal entry point unchanged |
| Production independent of Mac, address and VPN | IMPLEMENTED_AND_TESTED | Actual Node server/worker build dependency graphs exclude optional Mac tools; fresh Python production import succeeds with optional science/Mac modules blocked; actual production identity rejects injected development config |
| Compatible pinned scientific environment | IMPLEMENTED_AND_TESTED | Isolated Linux Python 3.12 environment, pip check; compatible versions recorded |
| Actual pinned Apple Silicon scientific suite | ALREADY_VERIFIED | Owner reports pinned .venv-validation completed OK; new operational/RSS/serving additions still need Mac checks |
| COBRA reference optimization | IMPLEMENTED_AND_TESTED | Known reference objective and actual solver tests |
| MICOM reproducible reference control | IMPLEMENTED_AND_TESTED | Two-copy E. coli engineering control, both member file digests verified before parsing, repeated solve, bounds/residual and infeasible closed-medium tests; not a validated multispecies gut model |
| Exact reference identity and model-specific terms | ALREADY_VERIFIED | Pinned SBML and official BiGG source inspected; commercial model-data use/redistribution not cleared; see reference-model-provenance.md |
| Scientific biological/clinical validity | BLOCKED_TECHNICAL | Mechanical audit only; independent model/chemistry/thermodynamics/energy-cycle review absent |
| Real strain/taxon/dietary substrate mappings | BLOCKED_TECHNICAL | No source-qualified gut reconstruction/medium/diet crosswalk installed; unsupported requests rejected |
| General flux exploration/intervention capabilities | BLOCKED_TECHNICAL | Current allowlist is fixed controls only; broader operations require qualified reconstruction/conditions and validation, not arbitrary tool arguments |
| Predictive dataset candidate identification | ALREADY_VERIFIED | Clark 2021 candidate and 2024 reuse noted in existing rights ledger/assessment |
| Experimental dataset/model rights and acquisition | BLOCKED_TECHNICAL | Exact file licence, coverage and model/mapping qualification unresolved; no data rows acquired |
| Existing pilot leakage controls | IMPLEMENTED_AND_TESTED | Original measured-experiment aliases now remain grouped alongside study/strain/genome IDs; saved splits rechecked;10 synthetic software tests, not measured predictive validation |
| Independent held-out predictive evaluation | BLOCKED_TECHNICAL | Needs qualified actual measurements/models, source-compatible observable/units, leakage-safe split and independent review |
| Strict versioned compute API, no code/shell/paths | IMPLEMENTED_AND_TESTED | Fixed nonpersonal requests; dual credentials, size/JSON/field validation; no LLM execution tools |
| Async status/cancel, CPU/wall/rate/output limits | IMPLEMENTED_AND_TESTED | Spawned reference worker tests, timeout without polling, cancellation/crash/recovery and bounded records |
| Sampled worker RSS/shutdown | IMPLEMENTED_AND_TESTED | Owned-child native RSS watchdog, memory/telemetry failure stop, no late result, joined cleanup; sampled control, not kernel sandbox; new Mac check pending |
| Actual Ollama cancellation | BLOCKED_TECHNICAL | Upstream GPU cancellation unqualified; no service activation |
| Fixed localhost Ollama smoke gateway | IMPLEMENTED_AND_TESTED | Fixed prompt/model allowlist, caps, no inherited proxy/redirect/fallback, raw output withheld; mock transport only |
| Live Ollama and backend cloud-disable setting | BLOCKED_USER_INPUT | Requires actual Mac inspection/restart verification; setting gateway env alone is not backend proof |
| Independent auth, replay, wrong-credential checks | IMPLEMENTED_AND_TESTED | In-process dual bearer plus one-use identity/method/path/body challenge, expiry/rotation/restart negatives |
| Render-side userspace proxy caller code | IMPLEMENTED_AND_TESTED | Isolated package, explicit localhost CONNECT proxy, HTTPS/SNI handoff, no direct fallback/global proxy |
| Actual private transport/restricted tailnet identity | BLOCKED_USER_INPUT | No credentials/admin access, policy edits, listener or network/deployment approval; real unauthorized-identity/TLS/outage/recovery tests not performed |
| Synthetic inputs, no external health transfer | IMPLEMENTED_AND_TESTED | No personal-input schema or external AI fallback; no real provider/health requests made |
| Reproducible private exported records | IMPLEMENTED_AND_TESTED | Model/code/version/medium provenance; operator export outside Git, permissions/digest/no overwrite tests |
| Backup/restore operational instructions | ALREADY_VERIFIED | Private records/recovery guide; plaintext export is not encryption; active jobs are ephemeral |
| Actual encrypted backup/restore on Mac | BLOCKED_USER_INPUT | Owner-approved private destination/settings and a real restore/checksum exercise not provided |
| Automatic launchd startup | ALREADY_VERIFIED | Not intended/installed for this disabled validation phase; no autostart claim |
| Pre-publication privacy checks | IMPLEMENTED_AND_TESTED | Seven synthetic scanner tests; prior history/index/worktree triage remains REVIEW_REQUIRED, not clean certification |
| Historical demo credential remediation | BLOCKED_USER_INPUT | Candidate flagged privately; deployment/usability/exposure unknown; rotation/history rewrite not authorized |
| Commit/push this development bundle | ALREADY_VERIFIED | Owner explicitly requested publication to enhance/bloom-experience; unrelated local app changes excluded |
| Deploy or open ports | BLOCKED_USER_INPUT | Not authorized; no deployment, listener, production setting or network activation |

Publication verification: 44 development scientific/service tests and10 existing
pilot contract tests, plus16 isolated Node caller/export tests. Seven privacy-tool tests passed separately. These are
engineering results, not Mac/network, scientific predictive, clinical or full RC
acceptance. No personal processing, knowledge promotion or production release is
authorized by a green engineering test.

New bounded operational additions: private expiring/rotatable/revocable config, guarded localhost launcher, resource watchdog and strict caller result projection. See DEVELOPMENT_CONNECTION_RUNBOOK.md. Complete current policy has been reviewed and a generic replacement is proposed but unapplied; the owner confirms the existing Render service is staging-only, with an isolated auxiliary caller prepared but its runtime/bootstrap and transport not yet qualified; no real connection or identity-denial test claimed. New source records no owner/workspace/device identifiers.

Remaining external actions do not justify speculative general AI/platform work.
Use the GitHub development branch and existing setup guide for offline Mac qualification;
keep network activation and any data/model acquisition separately scoped. Preserve
the main P1/P2 dynamic-investigation and durable reviewed-science objective.
