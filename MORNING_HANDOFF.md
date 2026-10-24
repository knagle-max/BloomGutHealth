# Bloom v0.5 development handoff — 2026-10-24

Progress checkpoint, not v0.5 completion. Branch `enhance/bloom-experience`, existing PR #1 and existing Render development service only. No main merge, replacement service, production credential change or paid provider activation.

## Delivered and verified

| Change | Commit | Evidence |
| --- | --- | --- |
| Encrypted synthetic snapshot/key recovery regression | dd59a6b | 218 tests/types; CI 40076326533 passed; development deployment was live. Original zero/null/units and account isolation preserved; missing historical keys fail. Old snapshots resurrect deleted data, so managed deletion reconciliation remains required. |
| Truthful manual restaurant fallback | b023b81 | 218 tests/types/build, rendered canonical save/totals; CI 40076500931 passed and Render live. Dedicated incomplete menu search removed; optional Log a restaurant meal is within Describe. Legacy links preserve draft. No real menu catalogue claimed. |
| Today mobile journal correction | 316fa8a | 218 tests/types/build, rendered 320/375/390 light/dark, empty/one-meal/error, keyboard/focus/end-of-page clearance; CI 40076962159 passed and Render live. One empty state/CTA; unavailable energy remains visible. Evidence docs/review/today-mobile-20261024. |
| Coaching execution gate | 4d5d4f0 | 219 tests/types/build, direct forged-consent/provider-key denial and rendered curated plan; CI 40077179797 passed and Render live. Unapproved AI ranking unavailable; curated evidence remains usable. |
| Shared monetary reservation foundation | ac7ff59 | 224 tests/types/build; CI 40077584409 passed including real isolated Neon multi-connection atomic reserve, idempotent settle and account isolation. Render live. Not connected to current SDK calls; no actual tariff/budget configured. |
| Provider-unit costing contract | b092ec8 | 228 tests/types/build; CI 40077838047 passed and Render live. Synthetic tariffs only; cached/reasoning subsets not double-counted, exact integer cost, stale/mismatched tariff and unknown usage rejected. |
| Daily/weekly target units | f2f56c3 | 228 tests/types/build and rendered kJ entry -> canonical kcal writes, converted bounds, unchanged protein and metric reset. Render dep-dbe6oktg1s2s7392uuo0 live; CI 40078220788 passed. |

Earlier delivered slices remain recorded in BACKLOG.md: product-result certainty cleanup, shared USDA source request allowance, one canonical Add Food draft/save, internal-only reviewer preference and orthogonal readiness/release labels. Internal module composition is incomplete and no real tester1 grant is provisioned. Public chooser currently has three working methods; unfinished photo and dedicated restaurant menu search are absent. OFF remains disabled.

The current source-inventory checkpoint records 78 literal endpoint declarations and six middleware mounts across 13 files, reproducibly checked against source hashes. Every authorization review remains REVIEW_REQUIRED. This does not complete the 52-feature policy audit or enumerate Python/jobs/tools/UI/export/cache. See docs/operations/API_EXPOSURE_REVIEW.md.

Actual Render's fixed public USDA Kit Kat startup lookup most recently recorded 20 results at 07:49:13 UTC. This verifies source access, not exact Canadian variant/portion/meal-save acceptance. Direct hosted browser access from this environment is blocked by proxy; local browser fixtures are labelled synthetic. No physical Safari/VoiceOver, independent review or full managed restore acceptance is claimed.

## Remaining work in priority order

1. **P0 OPEN:** Complete authenticated runtime provider accounting integration: verified token/request bounds, current tariff configuration, provider receipts, retries/stream/cancellation/unknown-outcome reconciliation, shared circuits and private aggregate alerts. Text SDKs now use the guard described below; real reviewed installation remains absent. Continue with synthetic adapters and default denial pending configuration; no new paid enablement.
2. **P0 OPEN:** Complete route/output/job/tool/export/cache capability mapping and execution guards, incident suppression audit, in-situ development module composition and reactive revocation. Preserve safe T1/manual/curated flows. Never treat provisional Legal JSON or reviewer preference as approval.
3. **P0 OPEN / scoped external dependencies:** Managed recovery, erasure replay and vendor/log lifecycle; execute synthetic work independently, retain live restore policy/target as blocked input. Owner-reported missing tester1 toggle requires reviewed identity/environment provisioning; not a public self-enrolment fix.
4. **P0/P1 OPEN:** Continue concrete copy/layout, unit/export/chart and evidence/missingness audits. Energy target editor gap is fixed; broad UNIT-105 is not complete. Brand/science asset adoption awaits accessible approved package. Actual menus remain licensing blocked, manual logging works.
5. **Release gates:** Independent Branding, Science, Security/Privacy/Legal, native/device/accessibility/persona and exact hosted SKU acceptance. v0.6 begins automatically once actionable v0.5 is exhausted; scoped external blockers must not hold independent approved v0.6.

## Decisions and external evidence needed

These are deferred records, not requests to stop independent development. Exact details are in BLOCKED_USER_INPUT.md.

| Task / unlock | Exact input | Choices | Recommended default and impact of deferral |
| --- | --- | --- | --- |
| OPS-702 monetary activation | Which provider/model tariff source/effective date, account daily/monthly/feature allowances, platform/provider/concurrency ceilings, stable identity-secret recovery/rotation and ledger retention are approved? | Reviewed configuration for separately cleared capabilities; or defer activation. | No invented tariffs or paid enablement. Runtime adapter/accounting engineering can proceed; real monetary acceptance waits. |
| GATE-701 tester1 | Which reviewed isolated-synthetic environment/dataset boundary, actual authenticated reviewer ID, territory, purpose, expiry and low-risk capability scope are approved? | Verify existing preview meets conditions and provision audited identity; or use synthetic harness until an appropriate environment is confirmed. | No real grants by guessed username; default denied. Blocks live reviewer control acceptance, not module engineering. |
| OPS-702 / PRIV-103 managed recovery | Which Render-bound project/branch, isolated restore target/cost ceiling, reviewed RPO/RTO/retention, historical key recovery location and deletion reconciliation policy are authorized? | Approved isolated operator drill; or defer managed recovery acceptance. | Keep existing configuration; synthetic in-memory recovery only. No live health-data copy/destructive restore. Managed readiness stays open. |
| REST-ARCH / FOOD-508 | Which licensed versioned Canadian chain menu source/records are approved for item/size/modifier/provenance/nutrients? | Approved catalogue/licence/provider configuration; or manual restaurant entry. | Manual description; no scraped or invented official menus. Blocks source-backed menu search only. |
| NATIVE-107 | Does v0.5 ship actual native HealthKit/Health Connect clients, or is browser/PWA with truthful unavailable device access the approved target? | Browser/PWA scope; or named native/hybrid platform and OS/device/entitlement targets. | Continue browser work without claiming native completion. Native engineering/hardware acceptance depends on the platform decision. |
| Brand/science asset intake | What authorized connector or versioned repository path contains the approved current editable kits? | Accessible approved package; or retain existing approved assets. | Existing Bloom tokens/assets; no invented adoption. Exact asset integration/review waits. |
| FOOD-501 exact hosted product acceptance | Can an independent tester verify deployed Kit Kat/KitKat/kit kit bar and Michelina's, genuine country/variant/serving, selection/save and daily totals? | Independent synthetic-account tester; or owner supplies actual findings. | Independent tester recommended; proxy blocks this environment. Source access already works; exact SKU acceptance remains open. |
| OFF and release review | What written source-rights decision and running-build specialist approvals apply? | Approved specific source/capability; or keep it off pending review. | OFF/unapproved clinical/research features remain disabled. Does not block ordinary preview engineering. |

## Resume immediately

Read NEXT_ACTIONS.md and the active Architect queue; verify newest exact SHA CI/Render, preserve concurrent commits, then implement the highest unblocked P0 slice above. Refresh source inventory after route-file edits. Run meaningful tests and required build/security checks, commit/push to the same development branch, update all four root records and continue. Do not repeat blocked questions or reconstruct completed work. No secrets belong in files, reports or tool output.

## Latest runtime accounting checkpoint

OPS-702-EXEC integrates the three active text SDK adapters with authenticated context, explicit consent, reviewed policy/bounds, shared reservation and atomic usage receipts. Default installation remains absent: no new paid enablement, migration or real monetary assumptions. Manual logging/curated planning remain available and ordinary unavailable AI controls are hidden. 236 full tests plus final 8 focused executor tests, TypeScript/build and food/planner browser regressions passed. Source inventory refreshed. Exact publication/CI/Render status is tracked in NEXT_ACTIONS and the development log. Remaining P0 composition/circuits/reconciliation/reporting and full capability audit are actionable; this is not v0.5 completion.

## Task-first Today checkpoint

BLOOM-TODAY-01: one first-viewport action, full Why/source depth, optional setup, collapsed nutrition metrics and no repeated empty explanation. Canonical Adjust goals opens/focuses existing context editor; a single explicit save changes Today. 237 full tests/types/build, 4 focused priorities and actual-render goal/no-data/error/keyboard/320–1280/effective zoom checks passed. Physical/hosted/specialist acceptance remains open. Next unblocked work is OPS circuits/configuration/reconciliation, followed by full capability/lifecycle audits; see the concise persistent task index first. OPS 861b04a passed CI 40112511251 and Render dep-dbedu4eq1p3s73e5g1cg is live.

Shared circuit checkpoint: BLOOM-OPS-01-CIRCUIT is integrated in metered execution; 243 tests/types/build passed. Provider/platform cooldown, one recovery probe, crash/cancel fencing and cross-account no-call/reservation lifecycle are tested. No live policy/migration activation. Today 7be1d57 CI 40114439312 passed and Render dep-dbeea2jbc2fs7385mhd0 is live. Continue remaining OPS configuration/reconciliation/reporting and CAP inventory; v0.5 remains incomplete.

CAP-01-EXPORT checkpoint: account download v2 now withholds unsupported generated concentrations, functional profiles, clinical effects/scores and advice using metadata-only SQL projections and the shared historical output boundary. It preserves original observations/units/zeros, lineage and stored history. 243 tests/types/build and synthetic download/ack/retry/mobile checks passed; exact new CI includes an isolated legacy sentinel denial. Source/clinical acceptance remains independent. Circuit dbc2b4b passed CI 40115469902 and Render dep-dbeegdlg1s2s739asmg0 is live. Remaining CAP work is actionable; do not declare v0.5 complete.

## Latest continuation checkpoint — 2026-10-24

- 861b04a: metered text guard/private receipts; 7be1d57: task-first Today/canonical goal correction; dbc2b4b: shared outage circuits; 4f8cf14: export v2 historical-output boundary. All passed exact CI and existing Render deployments (task index has evidence).
- d7a103d: internal explicitly scoped local-only photo preview, existing toggle/canonical meal editor, OFF/role/cache revocation. 246 tests; CI 40119564999 / Render dep-dbef9jmk1f9s73f975f0 live. No real grant/image inference.
- 824c6e2: private read-only aggregate cost/liability CLI with explicit alert policy, exact money and metered-account ratio. 250 tests; CI 40119991618 / Render dep-dbefc7k9v7es73cfa49g live. No live data queried or monitoring activated.
- SCI-01-TIME pending publication: 251 full + 16 focused tests/types/build/browser. Same-instant offsets abstain from trend; source context retained.

Remaining priorities: full 52-feature exposure mapping/authorization and saved outputs, reviewed AI composition/reconciliation and operational lifecycle; further concrete evidence/units/UX gaps; approved v0.6 after actionable v0.5. Existing owner decisions remain deduplicated in BLOCKED_USER_INPUT.md (native/device, menu/source rights/assets, real reviewer scope/environment, reviewed AI money/keys/bounds and managed recovery/erasure policy). No new decision is needed for delivered synthetic/local engineering. Next independent work continues; this checkpoint is not a completed overnight session.
