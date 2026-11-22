# Bloom — Deferred Post-GI Feature Backlog and Code Scaffolds
**Date:** 2026-11-22  
**Status: DESIGN / PLANNING ONLY. Not active implementation.**  
**Repo/branch:** knagle-max/BloomGutHealth / enhance/bloom-experience.

## Authority and scope
This is a durable feature preservation / future implementation reference, **not a second task selector**. AGENTS.md and NEXT_ACTIONS.md alone govern current task selection. Codex's current sole task is the read-only GI-01–GI-10 canonical-input/source-gap baseline and file:line matrix, then STOP before fixes. Do not activate any work here, change NEXT_ACTIONS.md, install providers, modify schemas, run migrations, generate assets or deploy. After the GI report, an owner/Architect may choose a smallest eligible slice, subject to P0 precedence and current queue.

**Source of truth:** existing source files, current actual HEAD, immutable nutrition/health data contracts and already approved detailed handoffs govern over illustrative sketches here. No parallel workout tables, nutrient truth system, experiment engine, food diary, recommendation system, clinician diagnosis engine or visual asset registry. Existing feature != qualified shipped feature. Every row below requires FOUND/PARTIAL/MISSING/RIGHTS_PENDING/NOT_TESTED gap checks at eligible HEAD.

## Index and proposed future waves
| ID | User outcome | Existing foundation / controlling handoff | Proposed future wave | Status |
| --- | --- | --- | --- | --- |
| BL-01 | Exercise IDs and verified muscle coverage, front/back SVG | docs/architecture/Bloom_Exercise_Intelligence_Muscle_Map_Handoff_2026-11-22.md and proposed docs/visual-assets/Bloom_Exercise_Muscle_Map_Asset_Registry_Delta_2026-11-22.json | 2 | Design approved; delivery unverified |
| BL-02A | CNF 2026 Canadian food + LNHPD NPN/DIN-HM | docs/architecture/BLOOM_CANADIAN_NUTRITION_LNHPD_SOURCE_NATIVE_HANDOFF_20261122.md | 2 | Design approved; rights/import pending |
| BL-02B | Restaurant-selected dish advice + opt-in nearby venue hint | docs/architecture/BLOOM_RESTAURANT_SELECTED_MEAL_ASSISTANT_HANDOFF_20261122.md | 3 | Design approved; no place discovery engine |
| BL-03A | Capture friction, quick repeat, verified frequent meals | client/src/components/FoodCapture.tsx, SavedMealSource.tsx, consumer UX-A..J | 1 | Existing capture and templates; friction unmeasured |
| BL-03B | Clinician Visit Brief vs separate Full Data Export | CP-07; docs/architecture/BLOOM_COMPREHENSIVE_HEALTH_LIFE_STAGE_MODULAR_ARCHITECT_DECISION_20261117.md | 1 | Specified, implemented status not established |
| BL-03C | Safety-qualified hypothesis → existing experiments | shared/experience.ts experimentSchema, INV/HYP/action admission | 1 | Schema exists; bridge not verified |
| BL-03D | Durable bounded offline draft/retry | docs/operations/OFFLINE_SAVE_RECOVERY.md, FOOD-12/PRIV | 2 | Current recovery visit-scoped, not durable |
| BL-04A | Household meal preferences (not medical accounts) | shared/experience.ts practicalPreferencesSchema | Deferred | Scope later |
| BL-04B | Preventive care/vaccine intervals | PREV-01..07, CP-06 | Deferred | Clinical rights/applicability later |
| BL-04C | Multi-person/caregiver medical profiles | Separate per-person privacy/consent architecture | Deferred | Not authorized |

These waves describe *possible* product-value priorities, not automatic execution sequence. CNF “5,993 foods/up to 173 nutrients” is a **proposed owner figure**, not an audited import count; measure authoritative source bytes and entries when source is licensed and retrieved.

## BL-01 — Exercise identity and anatomical history
**Objective:** Reuse actualSetsSchema, activityComponentsSchema, activitySchema, activityRoutineSchema and trainingSessionSchema in shared/experience.ts. Preserve original exercise text and stable set IDs. Associate optional exerciseId **separately** from mappingConfidence (confirmed/candidate/unmapped) and pin reviewed catalog/mapping revisions. Variation, equipment, movement pattern and laterality support planning later. A custom user movement is not automatically anatomically reviewed.

**Source assets:** Curated 40–80 featured, ~150–250 reviewed; rights-cleared extended exercises, per-image licence and original source review. Existing exercise editorial art BVA-0022 is not a clickable anatomical map. Front/back proposed BVA-0078/BVA-0079 are pending ID reuse check and integration into the sole canonical visual asset registry, not already-produced SVGs.

**Projection must distinguish:** completed confirmed direct/secondary resistance *sets* vs endurance *minutes* recorded once per canonical session/component, not once per set; stabilizers are descriptive; no weighted growth/stimulus/recovery scores. 7/14/30 inclusive **user-local calendar days**, not raw UTC milliseconds. Deduplicate same physical session in Everyday/Athlete. Mapping uncertainty is not evidence of missing actual work; the copy must say “No direct sets recorded”, not “You didn't train this muscle.” Mixed workouts must not inflate endurance time. Keep unknown/unmapped source counts and corrections.

**Suggested file:** shared/exercise-coverage.ts (only if a duplicate does not exist). Conceptual types, **not production code**:

~~~ts
export type MappingConfidence = "confirmed" | "candidate" | "unmapped";
export type MuscleRole = "primary" | "secondary" | "stabilizer";
export type BodyMapWindowDays = 7 | 14 | 30;
export type MuscleGroupId =
  | "pectorals" | "deltoids_anterior" | "deltoids_lateral"
  | "deltoids_posterior" | "biceps" | "triceps" | "forearms_grip"
  | "lats" | "upper_back_traps" | "spinal_erectors"
  | "abs_obliques" | "glutes" | "quadriceps" | "hamstrings" | "calves";
interface ExerciseIdentity {
  rawLabel: string;
  exerciseId?: string; // immutable reviewed catalog identity, distinct from guess certainty
  mappingConfidence: MappingConfidence;
  reviewedMappingRevision?: string;
  variationId?: string;
  laterality?: "bilateral" | "unilateral" | "alternating" | "unknown";
}
interface CompletedResistanceSet {
  eventKey: string; // canonical source + stable set id, cross-mode dedupe
  activityId: string; setId: string; localDate: string;
  performed: true; exercise: ExerciseIdentity;
}
interface RecordedEnduranceComponent {
  eventKey: string; activityId: string;
  localDate: string; durationMinutes: number | null;
  exercise: ExerciseIdentity;
}
interface MuscleCoverage {
  directSets: number; secondarySets: number;
  enduranceMinutes: number; lastDirectWorkDate: string | null;
  contributingActivityIds: readonly string[];
}
// Future implementation projects only completed + confirmed + reviewed mappings,
// per set in resistance and per component in endurance, with event dedupe,
// local-calendar windows and explicit global unknown/missingness disclosure.
// Do not use Math weighting or infer set intensity from mere completion.
~~~

**Acceptance:** BL-01-1 legacy raw text/confirmed correction; -2 planned/cancelled excluded; -3 dedup by true event, not name; -4 7/14/30 local boundaries; -5 no endurance double-count; -6 unconfirmed never inflates; -7 honest incomplete coverage, no injury readiness score; -8 responsive/keyboard/SR SVG plus source/licence/science rights receipts.

## BL-02A — Canadian source-native foods and supplements
**Detailed authority:** Canadian Nutrition handoff, CAN-01..16. Add source-native, version-pinned **CNF 2026** data alongside server/food-catalog.ts FNDDS and product adapters in server/products.ts, no replacement. Preserve raw identifiers, names, original nutrient units, fortification/preparation, chemical forms, source licence/attribution, vintage and actual SHA/row counts. Map reviewed native nutrients to existing canonical definitions only where semantically comparable; unknown ≠ source zero. Preserve shared/nutrient-coverage.ts and nutrition-summary.ts rules. shared/nutrient-source-snapshot.ts v1 is explicitly USDA-only; only a compatible separately versioned extension can represent CNF; no synthetic old snapshots.

LNHPD NPN/DIN-HM is licence lookup, not bottle composition proof or personal dose. Preserve uncollapsed official status, medicinal ingredient quantities/dose basis, non-medicinal names with often unknown amounts, official revision, package-label verification separately and actual user intake separately. Current licence is not proof currently sold or safe. Distinguish Canadian %DV from individual requirements. Never infer country from barcode prefixes. No private health information to public lookup.

**Starter adapter interface, illustrative only:**

~~~ts
export type CanadianSourceKind = "CNF_2026" | "LNHPD";
export interface NativeNutrientFact {
  sourceNutrientCode: string; rawName: string; rawUnit: string;
  rawValue: number | null; sourceReportedZero: boolean | null;
  canonicalKey: string | null; canonicalValue: number | null;
  mappingRevision: string | null;
}
export interface SourceReceipt {
  sourceKind: CanadianSourceKind; sourceRecordId: string;
  sourceRelease: string; sourceSha256: string; observedAtIso: string;
  originalAttribution: string; reviewedRights: boolean;
}
export interface LicensedSupplementProduct {
  licenceType: "NPN" | "DIN-HM"; licenceNumber: string;
  officialStatusText: string; statusObservedAtIso: string;
  medicinalIngredients: readonly NativeNutrientFact[];
  nonMedicinalIngredientNames: readonly string[];
  packageLabelVerifiedSeparately: boolean;
  provenance: SourceReceipt;
}
// Adapt to existing Product and source snapshot contracts; not a new record store.
~~~

**Acceptance:** pinned source release/licence counts and rights, CNF preparation/units/fibres and null/zero, nutrition snapshot backward compatibility, bilingual search, product-market evidence not GTIN country, NPN status/formulation vs verified bottle, bounded offline/error/manual fallback, account correction/revocation.

## BL-02B — Restaurant-selected meal helper with on-demand venue suggestions
**Detailed authority:** Restaurant handoff, REST-01..25. One user-confirmed restaurant; manual name/menu paste/photo/text works without location, internet menu provider or GPS. Optional **user-tapped** “Use my location” single foreground location fix suggests nearby names; no background location, automatic selection, user-health egress, false venue certainty, silent provider activation, or universal place-cache permission. Preserve venue brand/country/branch/menu version, serving size and actual publisher vs aggregator vs user-provided provenance; US vs CA same-name recipes do not inherit each other's values.

Three states: eligible_for_comparison, needs_verification, known_conflict. Critically, **eligible for nutrition comparison does not mean allergy-safe or medically safe**. Do not use substring ingredient matching to establish allergens/medication risk; cross-contact is unknown from menu titles. Apply independently qualified restriction checks first and keep safety uncertainty separate from nutrition ranking. Menu parsing isolated from private context. Do not invent micronutrients, numeric adjustments or microbiome personalization.

**Starter classification only combines ALREADY REVIEWED conflict and unknown evidence:**

~~~ts
export type Suitability =
  | "eligible_for_comparison" | "needs_verification" | "known_conflict";
export interface ReviewedDishEvidence {
  dishId: string; menuSourceRevision: string;
  verifiedConflictCodes: readonly string[];    // reviewed restriction evaluator only
  unresolvedSafetyChecks: readonly string[];    // never assumed empty from menu title
  documentedComparisonFacts: readonly string[];
}
export function classifyReviewedDish(x: ReviewedDishEvidence): {
  state: Suitability; hasNutritionFacts: boolean;
} {
  return {
    state: x.verifiedConflictCodes.length
      ? "known_conflict"
      : x.unresolvedSafetyChecks.length
        ? "needs_verification"
        : "eligible_for_comparison",
    hasNutritionFacts: x.documentedComparisonFacts.length > 0,
  };
}
// This is not an allergen detector or safety clearance. Caller cannot supply
// empty unresolvedSafetyChecks without complete applicable safety evidence.
~~~

**Acceptance:** country/menu edition differences; partial macros/unknown micros; severe allergy/cross-contact "verify", confirmed excluded ingredient "conflict"; no unsupported medication/pregnancy clearance; source-based customization only; exact consumed item requires explicit meal save; GPS denial/accuracy, provider rights/cost and privacy tests.

## BL-03A — Food capture discoverability and repeat flow
Existing client/src/components/FoodCapture.tsx already offers text, voice speech recognition, meal/label photos requiring AI consent, barcode and restaurant input; SavedMealSource.tsx loads saved ingredient list into review, with no consumed event merely from loading. No second OCR/voice pipeline, separate food ledger, receipt ingestion or invented 80% performance claim. First run real task timing, taps, confusion, correction and save completion on mobile/desktop for repeat breakfast, home-cooked dinner, portion adjustment, label/photo and offline. Measure baseline before changing UI.

**Small proposed UX:** discoverable “Log food” entry with Repeat / Describe or dictate / Photo meal or label / Barcode or type, all leading to existing review → explicit consumption confirmation → canonical save. Frequent meal shortcuts derive from account-owned **confirmed** historical meal logs or owned templates; no claim that a repeated suggestion was actually eaten today. Preserve original source/revision, recheck portions and present known vs unknown nutrient values.

~~~ts
export interface ConfirmedMealShortcut {
  ownedMealId: string; sourceRevision: string;
  label: string; lastConfirmedLocalDate: string;
  from: "confirmed-journal" | "owned-template";
}
// On selection: re-fetch authorized current source, load into EXISTING
// review UI; no journal write until user confirms exact consumed portion.
~~~

**Acceptance:** measured improvement in real tasks, accessible visible capture, no accidental duplicate saving, review corrected source amounts, provider denial/error/manual fallback, photo/voice consent and known missing nutrients.

## BL-03B — CP-07: clinician brief and separate full data export
Existing CP-07 is specified in the comprehensive life-stage architecture. Keep **two separate user actions**:

1. **Clinician Visit Brief**: user-selected concerns/date range; relevant reported symptoms, source-qualified measured lab values with dates/units/method/comparability; medications and *confirmed* supplements/NPN where available; question list. Default OFF for exploratory AI hypotheses; user selects exactly what to include. Preview and redact before print/PDF export. Never infer doses taken, diagnose or call outdated labs current.
2. **Full export**: authenticated, account-scoped versioned JSON archive containing raw canonical records, provenance/revision, known omissions, source references and correction status; optional CSV scoped tables; FHIR-style mappings only after standards-specific validation. Exclude provider secrets, unrelated accounts, revoked/inaccessible material. Source archive not automatically a clinician report.

~~~ts
export interface VisitBriefSelection {
  fromLocalDate: string; throughLocalDate: string;
  concernIds: readonly string[]; symptomRecordIds: readonly string[];
  medicationAndSupplementIds: readonly string[];
  labRecordIds: readonly string[]; questions: readonly string[];
  includeExploratoryHypotheses: boolean; // UI default FALSE, explicit opt-in
}
export interface SourceQualifiedBriefFact<T> {
  sourceRecordId: string; sourceRevision: string;
  observationDate: string; fact: T;
  epistemicStatus: "measured" | "reported" | "unverified" | "unknown";
}
export interface FullExportManifest {
  schemaVersion: string; generatedAtIso: string;
  sourceDefinitionVersions: readonly string[];
  includedRecordClasses: readonly string[]; omittedClasses: readonly string[];
  attachmentStatus: "included" | "excluded" | "unavailable";
}
// Server authentication/authorization defines actor; client IDs are selectors,
// never proof of access. PDF/print is a presentation, not scientific approval.
~~~

**Acceptance:** two outputs genuinely separate, patient preview/edit/selection, hypothesis default off, lab/source status, revoked-source and cross-account denial, secure export, provenance preserved, actual print PDF/manual and restore limitations described.

## BL-03C — Investigator hypothesis → existing experimentSchema
shared/experience.ts already specifies planned/active/completed, baseline windows, units/method/expected direction, observations, adherence, confounders, reflection and version history. **Do not build new experiment models**. Bridge a *source-qualified and admitted* observation/hypothesis to a **user-reviewable draft** under existing safety/action admission, without medication cessation or unjustified elimination diet. Any actual action requires eligibility and user confirmation; observational experiments may be more appropriate. Missing baseline, incomparable measurements, withdrawal of source or medical review block or qualify proposal. Outcomes are associations not proof of causation.

~~~ts
export type ExperimentBridgeDecision =
  | { state: "allowed_observational_draft"; sourceId: string;
      sourceRevision: string; userReviewRequired: true;
      missingRequirements: readonly string[] }
  | { state: "requires_clinician_review"; reasonCode: string }
  | { state: "not_admitted"; reasonCode: string };
// Use existing HYP/INV/admission boundaries BEFORE creating a draft.
// Populate existing experimentSchema only via user review; no automatic active trial.
~~~

**Acceptance:** unsafe hypothesis blocked, baseline/time/method validated, source revocation and corrections, user confirmation, confounders, null/worse results displayed, no personalized treatment/causal claims.

## BL-03D — Offline draft/queue recovery beyond current FOOD-12
Current docs/operations/OFFLINE_SAVE_RECOVERY.md explicitly limits recovery to open visit; no current durable IndexedDB guarantee. Future **security-reviewed bounded persistence** for confirmed/unsynced meal and set drafts may help gyms/travel, but must not silently store sensitive health data or create separate source-of-truth. Threat-model key access, device compromise, private browsing, browsers and multi-account logout, XSS, storage quota, expiry and recovery. Reuse frozen source revisions/idempotency receipts and server authority. No automatic recording from merely drafted nutrition/activity or impossible-to-safeguard offline AI advice.

~~~ts
export type OfflineDraftStatus =
  | "draft_only" | "confirmed_pending_sync" | "syncing"
  | "conflict_requires_review" | "server_confirmed" | "expired";
export interface OfflineDraftMetadata {
  localDraftId: string;
  kind: "meal_draft" | "activity_set_draft";
  sourceRevision: string; contentDigest: string;
  createdAtIso: string; expiresAtIso: string;
  status: OfflineDraftStatus; idempotencyKey: string;
  actorBinding: string; // verified against real session, NOT authorizing itself
}
// Only an approved encryption/key/privacy design may persist payload bytes.
// On reconnect check actual actor/source and stop on conflicts; preserve one
// original idempotency key for a confirmed uncertain save, never duplicate.
~~~

**Acceptance:** browser restart recovery on actual devices, correct session and account, conflict/revoked source, uncertain-receipt dedup, privacy/key leakage audit, quota/expired drafts, visible unsynced status and deliberate discard, no false safety guarantees.

## BL-04 — Deliberate deferrals
- **Household shared meal preferences**: optional combined dietary dislikes/allergen *preferences* for family shopping/menus, but not proof of another person's medically diagnosed allergies. Existing household-size scalar is not a person profile. No shared health records or imported child data.
- **PREV-01..07 / CP-06 reminders**: governed by territorial, age, anatomy, date-effective guideline applicability and source/rights review; separate routine cadence vs diagnostic warning. No generic automatically “overdue” claims without confirmed records.
- **Caregiver and multiple health profiles**: future distinct per-person identity/consent, pediatric clinical safety, guardian permissions, revocation and independent scientific snapshots. Defer until source-safe single-user experience proven.

## Future acceptance and receipt discipline
For each future owner-selected slice: confirm current HEAD/file:line/actual implementation and evidence; reuse-first diff; baseline of actual user outcome; original source/right/licence/version; account/consent and negative tests; accessible real UI; type/API/browser and source-correction fixtures; explicit NOT_TESTED vs engineering-only vs scientifically/legally/hosted qualified; exact SHA and remaining blocker. No invented metrics, menu nutritional precision, muscle physiology, allergy-safety certification, provider retention or offline encryption guarantees.

**STOP:** This document is an archival design backlog and suggested scaffolds only. No executable code, queue change, provider activation, clinical endorsement or implementation permission follows from publication.
