# Bloom — Chief Architect disposition: external v0.5 README critiques
Date: 2026-10-28 | Status: ARCHITECT REVIEWED; implementation not verified | Scope: enhance/bloom-experience
Authority: Product Owner core-first directive and approved specialist handoffs supersede unsolicited generic engineering prescriptions.

## Decision
APPROVE a compact end-to-end core acceptance programme. DO NOT turn this into a new infrastructure initiative or overwrite existing records/rules. Inspect latest code first; classify already implemented / gap / externally blocked. Privacy, security, actual data corruption, medical safety and licensing remain nondeferrable.

### A. Immediate food acceptance, use existing application workflow
A1 KitKat branded lookup → adjust serving → explicit review → save → journal and Today (owner already reports search working; prevent rebuild).
A2 Homemade chili / ingredient meal → replace mistaken matched food, edit grams, add/remove arbitrary ingredients → nutrition recomputes correctly → save (no fixed row count).
A3 Restaurant food → true provider/source + country/serving identity, unknown nutrients visibly missing, manual fallback when not approved/no record. External catalogue activation not required.
A4 No external provider → manual entry persists, distinguishes user-entered nutrients and genuinely unavailable nutrients.
A5 Edit/delete meal → daily and historical totals reconcile with canonical persisted records.
A6 Recent/frequent repeat → preserve previously confirmed source, preparation and portion, avoid duplicate log writes; if feature not implemented, mark as core improvement not falsely passing.
Measure task duration as baseline/aspirational usability metric; do NOT make arbitrary <30 seconds a release-blocking guarantee before instrumented testing and user-study agreement. Test in existing browser/API/CI facilities first; Playwright only if compatible with current stack without infrastructure detour. Real device where relevant.

### B. Nutrient and source truth
Audit existing canonical nutrient calculation and journal; consolidate divergences rather than mandate a new parallel server function. Test item/meal/day identity including edits and partial unknowns, rounding, unit and per-100g scaling, household portions, raw/cooked and Canadian variant distinctions. Start with small high-value verified fixture set (expand toward ~50 if needed); never invent ground-truth package numbers or endorse unsupported tolerances. Missing nutrients != zero. Composition × grams estimates nutrient content, not bioavailability or individual absorption. Provenance uses **source identity and evidence relevance**, not a global CNF→USDA→user ranking: correct Canadian generic, verified branded SKU, actual recipe preparation, source jurisdiction and explicit user choice decide. USDA, CNF, user-entered are not substitutable universal priority tiers. OFF is not automatically “unverified” for all fields nor verified by default: label as external/crowdsourced with individual record quality and licensing, enable only after clearance. Report incorrect source data via existing correction/feedback path if available; optional UI improvement otherwise.

### C. Biological evidence and safety
Do not automatically delete all SNP-personalized functionality, nor assume 29-marker registry is the universal authoritative count; inspect reviewed evidence for each rule. Unsupported medical personalization, unvalidated organism/metabolite score masquerading as measurement, diagnoses and invented intervention effects must remain blocked/explicitly experimental. Existing educational genetic/microbiome explanations may remain with provenance and uncertainty. Audit any active scoring or clinical claim surfaces; restrict unsafe capabilities using existing flags and review gates, not an unconditional HTTP 410 requirement. The README's historical 410 assertions require actual endpoint verification. Preserve user's medically reviewed clinician-discussion boundary.

### D. Privacy and engineering priorities
Verify existing precision encryption, key backup/rotation/runbook and failure recovery; treat proven catastrophic key-loss or cross-account disclosure risk as P0, but do not immediately rewrite to envelope encryption without migration, KMS/operational cost, rollback and data recoverability assessment. Audit existing export, deletion and consent coverage under applicable Canadian laws and actual jurisdictions; implement material missing rights, privacy/safety requirements and verifiable delete semantics, not speculative “delete all backups immediately” promises inconsistent with retention law. Independently reviewed clinical escalation policies are a release gate for urgency messaging; neutral clinician discussion education may remain without invented urgency. Review current shared-rate limiter before demanding replacement: source already imports `SharedRateLimiter` in `server/index.ts`. Assess actual atomicity and deployed topology; don't assume it is process-local. Prevent health/body payload logging. Verify isolated Neon test environment before data-mutating integration smoke. Respect approved preview branch and schema migration safeguards.

### E. Engineering hygiene / status honesty
Verify README endpoint claims against exact actual route behavior and correct documentation if contradictory. Existing task index and feature management are sources of truth: do not create `features.json` as duplicate system without a concrete drift defect. Add focused normal-path automated tests and baseline Render/mobile acceptance; keep actual implemented/tested/deployed/independently accepted stages separate. Device-test barcode camera on real supported devices when it becomes a release claim. Basic privacy-safe error counters later if not already implemented.

## Concrete execution order
1. Audit A1-A6 against current app and record compact existing/missing/blocked matrix.
2. Fix **observed** P0 food input→recalculation→save→Today/Journal inconsistencies with minimal representative fixtures.
3. Complete missing A1-A6 normal user journeys incl. Canadian source clarity and manual fallback. Add representative CI/browser tests without expensive test infrastructure detour.
4. Verify essential privacy, medical and claims gating on the paths touched; capture actual problems in backlog and fix P0.
5. Continue Today/Activity/Progress, Bloodwork, Gut/Genetics, Athlete core experiences; consider advanced key migration, feature registry and large monitoring/deep edge matrices only after core milestone or evidenced high severity.
6. Publish exact commit/test/Render evidence. Independent User Testing/Branding/Science/Legal/Security approvals remain separate.

## Conflicts and clarification
The external briefs are critiques derived from the README, not authoritative code verification. They disagree on older endpoint 410 behavior, provider priority, key-management urgency and blanket SNP removal, and speculate about missing shared rate limiting. Do not accept these claims as observed defects without source and live reproduction. No paid integration, production feature flag, schema destruction or merge authorised.
