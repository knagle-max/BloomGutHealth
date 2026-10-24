# Bloom — Persistent Task Index and Acceptance Ledger
**Owner:** Chief Architect (requirements) / Codex (implementation and evidence)  
**Updated:** 2026-10-24  
**Branch:** `enhance/bloom-experience` / PR #1

## Purpose and source of truth
This is the **short, persistent task ledger** for iterative and overnight Codex sessions. Open this file first, then follow the relevant link to detailed authoritative requirements only for the chosen task. `ACTIVE_EXECUTION_QUEUE.md` supplies background/prior acceptance, but its accumulated handoffs are **not** the daily task-selection mechanism. `CURRENT_V05_REQUIREMENTS.md` determines v0.5 scope; `V06_HANDOFF.md` v0.6 scope; `V05_IMPLEMENTATION_STATUS.md` reports evidence but is not automatic completion proof.

**Canonical statuses:** `READY`, `IN_PROGRESS`, `BLOCKED`, `IMPLEMENTED_UNVERIFIED`, `TESTED`, `SPECIALIST_REVIEW`, `ACCEPTED`, `DEFERRED`. Do not use "done"/"fixed" solely on source changes, synthetic fixture pass, or successful CI. Only actual required acceptance evidence permits `ACCEPTED`. When a feature is hidden because unfinished, keep it separately classified from legal restriction.

**Fields per task:** stable ID; priority; workstream/release; user outcome; specific acceptance criteria; prerequisites/dependencies; status; current owner; implementation SHA; validation evidence (unit/CI/Render/real-device and specialist review separately); blocker + exact next action; source specialist IDs; updated timestamp. A requirement that lacks acceptance criteria should be clarified by Codex from its authoritative source **without waiting for the owner** when a safe testable interpretation is possible.

## Current high-leverage index (verify latest repo before changing status)

| ID | Priority | End-to-end outcome / acceptance | Dependencies / source | Status / evidence |
| --- | --- | --- | --- | --- |
| BLOOM-FOOD-01 | P0 v0.5 | Real branded product search, correct source/region/variant, review portion, save once, update daily totals. Owner reported KitKat subsequently working; Michelina's and other Canadian variants still require independent live acceptance. | Source credentials/licences; UT-FOOD; current v0.5 | IMPLEMENTED_UNVERIFIED for general live coverage; verify current SHA and Render |
| BLOOM-FOOD-02 | P0 v0.5 | Clean Add Food chooser: only functioning public routes, one selected form at a time, always reset method for next food, preserve shared draft/save. Unfinished photo/restaurant menus accessible only through eligible internal test preview. | MKT-FOOD-801–806; owner visibility directive | IMPLEMENTED_UNVERIFIED; confirm hosted, multi-item and accessibility |
| BLOOM-FOOD-03 | P0 UX / P1 source | Restaurant selection leads to **real Canadian menu options** with source/date/market/size and canonical journal save; until true, do not advertise picker as menu browsing, preserve manual restaurant logging. | REST-ARCH-01–05; provider/licence; live owner failed menu continuation | BLOCKED on approved menu coverage; unblocked truthful UX/fallback work READY |
| BLOOM-UX-01 | P0 v0.5 | Today empty journal: one CTA, no duplicated empty messaging, responsive noncolliding header; bottom nav does not conceal reachable content on iPhone and at 200% zoom. | MKT-MOB-1401–1405; screenshot-backed handoff | READY; Codex reproduce and fix |
| BLOOM-UX-02 | P0 v0.5 | App-wide task-first concise copy, legible text and noncolliding cards/tabs; significant changes validated at 320/375/390 and desktop, dark/light, 200% zoom. | UT-COPY-1101–1107; MKT-LAYOUT/MKT-POLISH | READY; fix with touched vertical slices |
| BLOOM-CAP-01 | P0 release safety | Reconcile 52-feature provisional Legal registry with every UI/API/AI/export/job action; default-deny restricted operations, incident hard-stop, policy audit and tests. No mass disable of safe working flows without verified risk. | LEG-INVENTORY-901–906; LEG-GATE-801–806; Legal source JSON | IN_PROGRESS / partial reported, verify actual SHA |
| BLOOM-CAP-02 | P0 internal review | Server-provisioned `tester1` (actual authenticated ID; reviewed environment and migration); Show development features adjacent Appearance; ON mounts permitted unfinished/restricted features in intended locations with graphite labels; OFF removes all space; no incident bypass. | MKT-REG-1210–1213; BLOOM-CAP-01; Security/Legal | BLOCKED on verified safe provisioning/environment; UI preference implemented, only synthetic tested |
| BLOOM-DATA-01 | P0 v0.5 release gate | Private account erasure, vendor/backup deletion lifecycle, documented retention and restoration; end-to-end security test with no cross-user leakage. | LEG-LAUNCH-706; SEC/ops | READY for implementation assessment; external approvals separate |
| BLOOM-OPS-01 | P0 foundation / P1 report | Server-side per-user/provider quotas, AI unit-cost budget, encrypted tested backup/restore; admin cost per active user and alerting. Core tracking works when optional AI over limit. | Ops instructions in AGENTS and queue | PARTIAL per reported USDA rate limiting; normalize to IMPLEMENTED_UNVERIFIED for part, remainder READY |
| BLOOM-SCI-01 | P0 v0.5 | Reusable evidence cards with real sourced measurements/date/units, accessible trend/table and correct missing/uncertain states. | MKT-011–020; Science Insights kit | READY / inspect current code for partial |
| BLOOM-NATIVE-01 | v0.5/v0.6 gated | Real native HealthKit/Health Connect user consent, import, source version and revocation on devices, not synthetic-only. | Platform entitlements; LEG registry; privacy | BLOCKED for live native setup; independent mocks/contracts are unblocked |
| BLOOM-V06-01 | After v0.5 | Working Eat–Move–Recover integrated planner with shared contracts and clear goal-aware task-first Today. | DATA-AI, MOD-ARCH, UX-SIMPLE, science gates | DEFERRED until v0.5 accepted |
| BLOOM-V06-02 | Later | Photo meal interpretation, restaurant catalogue depth, models/coach/research only after functional source, consent, regulatory, validity and privacy gates. | PHOTO-ARCH; REST-ARCH; TWIN-ARCH; LEG registry | DEFERRED or restricted; split on execution |

## Codex update discipline
1. **Session start:** pull latest review-branch head, inspect this index and relevant `V05_IMPLEMENTATION_STATUS.md`; reconcile tasks modified by concurrent work. Select the **highest-priority unblocked task with maximum dependency leverage**. Do not blindly execute stale rows.
2. **Before coding:** write/confirm 2–5 observable acceptance checks for the chosen task. Identify blocked external licence, Apple entitlement, production secret, clinical approval or user action; log it once, continue other work. Never manufacture a credential or bypass consent/release gate.
3. **After each cohesive slice:** update that task's status, actual implementation SHA, test results, hosted/physical test scope and independent review status. Synthetic tests alone → at most `IMPLEMENTED_UNVERIFIED` or `TESTED` scoped to those tests, not accepted hosted behavior. When a task is blocked, identify safe default and exact unblock action.
4. **At session end / overnight morning handoff:** concise completed/active/blocked summary with links to SHA, CI and Render, plus one deduplicated **Owner inputs needed** table. Continue to next unblocked item automatically within session and usage constraints.
5. **Growth control:** add stable IDs for new accepted work; deduplicate matching specialist IDs; link to detailed specs instead of pasting long handoffs into this file. Archive accepted tasks in an `Accepted` section when it becomes unwieldy; keep active index manageable. Never silently delete outstanding work.

## Canonical requirement links
- [Current v0.5 requirements](CURRENT_V05_REQUIREMENTS.md)
- [v0.5 implementation evidence](V05_IMPLEMENTATION_STATUS.md)
- [Full active handoff/incident history](ACTIVE_EXECUTION_QUEUE.md)
- [Development sequencing](DEVELOPER_EXECUTION_ORDER.md)
- [v0.6 consolidated requirements](V06_HANDOFF.md)
- [Legal provisional feature registry](LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json)
