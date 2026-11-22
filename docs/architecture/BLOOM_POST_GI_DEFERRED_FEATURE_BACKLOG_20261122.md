# Bloom — Deferred Post-GI Feature Backlog (Design and Code Scaffolds)
**Date:** 2026-11-22  
**Status:** FUTURE BACKLOG / DESIGN EXAMPLES ONLY. Not an active handoff, implementation assignment, code change, scientific validation or release instruction.  
**Repository:** \`knagle-max/BloomGutHealth\` · branch \`enhance/bloom-experience\`

## Gate, priority and interpretation
The **only current next Codex assignment** is the read-only **GI-01–GI-10 baseline, genuine canonical fixture execution where possible, file:line gap matrix and stop-before-fixes** under current \`AGENTS.md\` and \`NEXT_ACTIONS.md\`. No item below may be selected, coded, promoted or used to alter that queue until the baseline is reviewed and the live owner/Architect selection authorizes a bounded slice. A reproducible urgent P0 integrity/safety issue follows the existing precedence independently. The sequence below is **suggested future relative value, not a new P0–P4 task-selection policy**.

Do **not** duplicate meal diary, supplements, biological investigator, clinical rules, action service, workout/session store, experiment engine, account profile, nutrition source snapshots or visual asset registry. Every future slice first inventories actual current HEAD with \`FOUND / PARTIAL / MISSING / RIGHTS_PENDING / NOT_TESTED\`, exact \`file:line\` and existing tests. Keep design approval distinct from actual implementation, scientific approval, provider/licence clearance and released UX.

## Index / links to controlling architecture
| Backlog | Scope and controlling existing reference |
| --- | --- |
| **BL-01** | Exercise identity → recorded muscle coverage → interactive body map. [Approved detailed exercise handoff](Bloom_Exercise_Intelligence_Muscle_Map_Handoff_2026-11-22.md); [proposed anatomical asset delta](../visual-assets/Bloom_Exercise_Muscle_Map_Asset_Registry_Delta_2026-11-22.json). |
| **BL-02A** | Canadian CNF 2026 + LNHPD and bilingual/barcode source-native adapters. [Approved Canadian source contract](BLOOM_CANADIAN_NUTRITION_LNHPD_SOURCE_NATIVE_HANDOFF_20261122.md). |
| **BL-02B** | Single-restaurant ordering assistant and user-opt-in “Are you here?” venue hints. [Approved restaurant contract](BLOOM_RESTAURANT_SELECTED_MEAL_ASSISTANT_HANDOFF_20261122.md). |
| **BL-03A** | Existing multimodal capture + frequent-meal discoverability; \`client/src/components/FoodCapture.tsx\`, \`SavedMealSource.tsx\`, \`shared/experience.ts\` \`templateSchema\`, [consumer UX contract](BLOOM_CONSUMER_EXPERIENCE_ACCEPTANCE_AND_FOUR_CONTRACT_INTEGRATION_HANDOFF_20261121.md). |
| **BL-03B** | User-curated clinician brief (CP-07) and **separate** raw/exportable archive. [Life-stage modular contract](BLOOM_COMPREHENSIVE_HEALTH_LIFE_STAGE_MODULAR_ARCHITECT_DECISION_20261117.md), v0.6 and [source/private storage contract](BLOOM_PRIVATE_DATA_AND_MYFOODDATA_ARCHITECT_IMPLEMENTATION_DECISION_20261118.md). |
| **BL-03C** | Approved hypotheses → existing \`experimentSchema\`; v0.6 LEARN, HYP, clinical action-admission and source permissions. |
| **BL-03D** | Bounded account-isolated offline drafts and recovery beyond current [visit-scoped FOOD-12](../operations/OFFLINE_SAVE_RECOVERY.md). |
| **BL-LATER** | Household dietary preferences; PREV-01–07/CP-06; distinct caregiver/multi-person medical profiles. |

### Future wave recommendation (not mandatory ordering)
- **Wave 1, once eligible and measured:** BL-03A first (user journey/friction metrics and smallest correction), BL-03B basic print/portable export, BL-03C bridge to existing experiments. Keep GI baseline and higher live queue untouched.
- **Wave 2:** BL-02A source-native Canadian food/supplement adapters, BL-01 documented history/body map, BL-03D narrowly bounded durable offline capture, sequenced by real readiness/risks rather than fixed dependency assumptions.
- **Wave 3:** BL-02B single-restaurant decision experience (manual first, nearby suggestion separately gated), then BL-LATER if demand and rights/privacy controls justify it.
- Do not construe these waves as authorization to implement all features; choose the smallest genuinely missing, source-qualified increment. Current external dataset counts, including the proposed **5,993 CNF foods / up to 173 nutrients**, are **unverified planning figures** until the exact official 2026 release and import manifest establish them. Do not encode them as guaranteed coverage or test passes.

---

# BL-01 — Athlete exercise identity and recorded muscle coverage
**Outcome:** With one canonical account-owned workout record, show meaningful **recorded** direct resistance sets, secondary sets and endurance duration on front/back 7/14/30-day anatomy views. Users can correct ambiguous activity. Do not claim optimal stimulus, muscle growth, untrained muscles, injury readiness or energy expenditure from a colored map.

**Reuse:** \`shared/experience.ts\` \`actualSetsSchema\` (including set id/state/completed), \`activityComponentsSchema\`, \`activitySchema\`, \`activityRoutineSchema\`, \`trainingSessionSchema\`; existing reviewed exercise parser, sourceSpan, Everyday/Athlete projection, review/correction. No \`workouts\` or \`workout_sets\` parallel tables. Source dataset \`yuhonas/free-exercise-db\` is a rights-review *candidate* only, including per-image rights/quality; curated 40–80 featured, ~150–250 reviewed, extended searchable rights-qualified, plus account-owned custom entries.

**Classification:** Use confirmed \`exerciseId\` with separate \`mappingConfidence: confirmed|candidate|unmapped\`. A text match does not mean user confirmed it. Variation-specific primary/secondary anatomy, movement pattern, equipment, resistance/endurance/mobility modality, laterality, mapping revision and source provenance are independent. Anatomical taxonomy **must be reconciled**: the suggested 15 IDs below use three deltoid divisions; the previously approved exercise handoff's taxonomy has its own reviewed mapping and must not be silently replaced. Resolve IDs and forward/back SVG path geometry **before** public migrations and preserve old revisions.

**Critical implementation corrections to supplied illustrative algorithm:**
1. Do **not** count endurance minutes for each set: project one canonical **activity/component session duration event** per appropriate modality, and associate relevant anatomy **only where reviewed associations exist**. If activity has multiple overlapping set/component durations, don't sum both.
2. Resistance set count comes only from **confirmed completed actual resistance sets**, never planned, cancelled, mere routine/scheduled completion or exercises inferred from prose. Do not count work as hard/effective sets.
3. Deduplicate the same underlying session across Everyday/Athlete and nested component/set representations by stable canonical ID and source lineage; avoid a global collision on repeated legitimate separate sessions.
4. Use source local activity date/timezone for 7/14/30 inclusive **calendar-day windows**, not a naïve \`Date.parse(asOfDate) - days * 86400000\` that excludes the first day and varies by time zone/DST. Future/invalid dates abstain.
5. Partial logging/unmapped work is visible as a **window-level caveat** and possibly relevant activity rows; it is not a claim that any particular muscle had work. Do not set every unknown muscle to “not worked”.
6. Preserve confirmed exact mappings and user edit invalidation. If mapping classifications change, recompute with pinned classification revision (or explain historical recalculation policy), not silently reinterpret saved sessions.

**Suggested types (illustrative pure projection API, NOT an approved second storage layer):**
\`\`\`ts
type MappingConfidence = 'confirmed' | 'candidate' | 'unmapped';
type MuscleRole = 'primary' | 'secondary';
type WindowDays = 7 | 14 | 30;
type TrainingMode = 'strength' | 'endurance';
type MuscleGroupId = string; // use a SINGLE versioned, reviewed canonical taxonomy, NOT arbitrary persisted free text

interface ClassifiedExercise {
  exerciseId: string;
  sourceRevision: string;
  classificationRevision: string;
  modality: 'resistance' | 'endurance' | 'mixed' | 'mobility';
  pattern?: 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'lunge' | 'core' | 'cardio' | 'mobility';
  equipment: readonly string[];
  laterality?: 'bilateral' | 'unilateral' | 'alternating';
  muscleMappings: readonly { groupId: MuscleGroupId; role: MuscleRole; regionIds: readonly string[] }[];
}
interface ConfirmedSetEvent {
  sessionId: string; componentId: string; setId: string;
  localDate: string; sourceRevision: string;
  completed: true; state: 'performed';
  exerciseId: string; mappingConfidence: 'confirmed';
}
interface RecordedDurationEvent {
  // one event per qualified endurance activity, not one per set
  sessionId: string; componentId: string; localDate: string;
  minutes: number; exerciseId: string; mappingConfidence: 'confirmed';
}
interface MuscleCoverageBucket {
  directResistanceSets: number;
  secondaryResistanceSets: number;
  enduranceMinutes: number; // context-associated, not resistance stimulus
  lastDirectWorkDate: string | null;
  contributingSessionIds: readonly string[];
}
interface CoverageProjection {
  windowDays: WindowDays; asOfLocalDate: string;
  classificationRevision: string; byGroup: Readonly<Record<MuscleGroupId, MuscleCoverageBucket>>;
  unresolvedActivityCount: number; partialLog: boolean;
}
function projectCoverage(
  canonicalSets: readonly ConfirmedSetEvent[],
  canonicalDurations: readonly RecordedDurationEvent[],
  catalogById: ReadonlyMap<string, ClassifiedExercise>,
  window: {days: WindowDays; asOfLocalDate: string; timeZone: string},
): CoverageProjection {
  // Design contract, implement using existing dated projections and IDs.
  // Validate source revision and explicit user confirmation; dedup stable set/session IDs.
  // Count confirmed completed resistance sets by primary vs secondary mapping.
  // Count qualified endurance durations ONCE per component/activity.
  // Preserve omitted/candidate events in unresolvedActivityCount; report partial logging.
  // Compute inclusive calendar-day window with existing date-time utility.
  throw new Error('DEFERRED_BACKLOG_ONLY');
}
\`\`\`
**Illustrative semantics:** \`No direct resistance sets recorded for hamstrings in this window\`; if unresolved data exists, add \`Some recorded activities were not mapped\`. Always distinguish secondary exposure and endurance associations. No tissue stimulus score or blanket absence conclusion.

**Acceptance:** exact set ID dedup, cancelled/planned exclusion, shoulder raises unresolved until user confirms variation, repeated legitimate sessions counted separately, no duration amplification, 7/14/30 boundary/time-zone/DST, source corrections, offline/duplicate saves, private custom exercise isolation, accessible SVG keyboard/touch/front-back/light-dark/reduced motion, source and image rights, fallback when anatomy SVGs unavailable, no unconfirmed work promoted into count. **Visual:** current registry only; proposed BVA-0078/0079 reviewed for actual SVG region geometry/anatomy before integrating, and BVA-0005/0022/0023 reuse candidates.

---

# BL-02A — Canadian CNF 2026, LNHPD and retail identity
**Outcome:** Fast Canadian reference food/label lookup and correctly qualified Health Canada regulatory supplement identification without replacing USDA, DSLD or current product/private label capability.

**Source adapters:** \`server/food-catalog.ts\` compact server-only CNF relational source alongside FNDDS; \`server/products.ts\` product source adapter and LNHPD lookup; \`shared/nutrient-coverage.ts\` / \`shared/nutrient-source-snapshot.ts\` versioned, compatible source-native meanings. Pin CNF exact source file URLs, official licence/attribution, download digest, food/nutrient counts from actual import, units, methods/fortification, source food IDs and bilingual aliases. Map reviewed original nutrient IDs by chemistry/unit/method and preserve unmapped/missing. Avoid Canadian market inference from GS1 prefix. Canadian DV for labels is distinct from requirements/UL.

NPN/DIN-HM identifies a **licence** and status observed at a time, not an exact bottle formula, evidence of ingestion or personalized use. Store licensed medicinal ingredient amounts with dose/chemical form basis only when actually supplied; excipient presence without quantity remains nonnumeric. Separate package-verified label and account-confirmed ingestion.

**Suggested adapter boundary — reuse source snapshot/product contracts rather than create separate persistent model:**
\`\`\`ts
type SourceNativeFact = {
  sourceKind: 'cnf' | 'usda-fndds' | 'restaurant-published' | 'lnhpd';
  sourceId: string; sourceRelease: string; sourceCapturedAt: string;
  originalNutrientCode: string; originalValue: number | null; originalUnit: string;
  state: 'reported' | 'explicit-zero' | 'unknown' | 'not-comparable';
  normalized?: {canonicalKey: string; value: number; unit: string; mappingRevision: string};
};
type LicenseIdentity = {
  licenceKind: 'NPN' | 'DIN-HM'; licenceNumber: string;
  sourceStatusText: string; observedAt: string; sourceRevision: string;
  productLabelVerified: boolean; // should default false; never inferred from active status
};
\`\`\`
The scaffold is NOT a complete authoritative CNF schema; only allocate actual fields that current adapters require. Don't conflate LNHPD product licence with a nutrient composition row.

**Acceptance:** validated source bytes/rights, count/comparability receipt, exact Canadian-vs-US difference with no silent substitution; bilingual alias collisions; CNF generic vs branded; zero vs missing; supplement cancelled/stale licence; unknown excipient quantities; no health data public provider egress; v1 snapshots unchanged and actual source-native extension tested after eligibility. Follow [Canadian handoff](BLOOM_CANADIAN_NUTRITION_LNHPD_SOURCE_NATIVE_HANDOFF_20261122.md) for detailed CAN-01..16.

---

# BL-02B — Selected restaurant and on-demand possible-venue shortcut
**Outcome:** User selects *one restaurant* (manually or by tapping a nearby suggestion); see 2–4 menu choices with source-qualified benefits and explicit uncertainty. No citywide discovery/ranking, location tracking or restaurant safety guarantee.

**Sources:** Chain **country + market + menu edition/effective date + item/portion**, original published/aggregator values with distinct rights/vintage; independent restaurant user text/photo/URL with reviewable source snippets. Only actually published nutrient numbers can be published as such. Null micronutrients are unknown; menu description alone cannot yield exact macros, FODMAPs, allergens or sodium savings. Viewing menu never records meal consumption. Reuse \`shared/meal-intelligence.ts\` \`restaurantContext\`, meal diary and existing restrictions/consent.

**Three-state policy:** Nutrition comparison eligibility and food safety are **different dimensions**. \`eligible_for_comparison\` means enough facts for a specified comparison, **not allergy- or medication-safe**. \`needs_verification\` means relevant ingredients/cross-contact/medication/food-safety context lacks authoritative confirmation; a publisher's allergen panel NEVER alone certifies kitchen cross-contact safety. \`known_conflict\` requires reviewed exact ingredient/preparation evidence plus applicable confirmed restriction; do not mark conflicts using naive \`text.includes(term)\` substring matching (false positives, missing aliases, trace ingredients, recipes). An uncertain model match is a verification prompt, not known proof.

**Suggested dependency-light policy API sketch:**
\`\`\`ts
type Suitability = 'eligible_for_comparison' | 'needs_verification' | 'known_conflict';
type RestrictionEvidence = {
  restrictionId: string; applicabilityConfirmed: boolean;
  sourceRevision: string; kind: 'allergy' | 'explicit-exclusion' | 'reviewed-medical';
};
type DishEvidence = {
  menuItemId: string; restaurantId: string; country: 'CA' | 'US' | 'unknown';
  menuRevision: string; sourceRevision: string;
  sourceKind: 'restaurant-published' | 'licensed-aggregator' | 'user-supplied';
  ingredientDisclosure: 'documented' | 'partial' | 'unknown';
  crossContactInfo: 'documented' | 'uncertain' | 'unknown';
  nutrientFacts: Readonly<Record<string, {value: number | null; unit: string; sourceStatus: string}>>;
};
type SuitabilityDecision = {
  menuItemId: string; outcome: Suitability;
  qualifiedReasons: readonly string[]; questionsToAsk: readonly string[];
  nutritionComparisonAvailable: boolean;
  safetyClearance: never; // represent NO global 'safe' status or certificate
};
// Resolve ingredient aliases, exact known recipes, published disclosures and rules using
// existing reviewed source/evidence policy and applicable private user constraints.
// Uncertain/missing high-stakes evidence must not be promoted to eligible as 'safe'.
// Do not write a new generic clinical rules engine.
\`\`\`
**On-demand optional venue suggestions:** Explicit tap for single foreground \`getCurrentPosition\`, then bounded provider search with minimal location request; never trigger on general page open, share user health context, persist raw GPS, guarantee user presence or assume a blanket 30-day Places cache licence. Up to 3–5 possible candidates, user confirms one, manual text always usable; geolocation denial/indoor uncertainty/offline doesn't block the assistant. Provider activation, attribution, storage and costs separately reviewed. No new map/discovery engine.

**Acceptance:** chain CA/US parity; source differences; unknown nutrients; exact allergy conflict vs incomplete disclosure; confirmed medical restrictions never made up; user-confirmed restaurant identity and logged meal only once; provider opt-in/latency/denial/fallback, no raw GPS persistence/private profile egress, account switch/consent/source invalidation. See [restaurant handoff](BLOOM_RESTAURANT_SELECTED_MEAL_ASSISTANT_HANDOFF_20261122.md) REST-01..25.

---

# BL-03A — Existing food capture friction and repeat-meal user experience
**Observed reusable code:** \`client/src/components/FoodCapture.tsx\` already offers browser voice dictation, photo meal descriptions, consented third-party label photos, barcode/product lookup and restaurant/takeout entry. \`client/src/components/SavedMealSource.tsx\` loads an owned saved template into review; \`shared/experience.ts\` defines \`templateSchema\`. Reproduce real discoverability/friction before designing new capture engines. Browser voice service may process audio; retain explicit disclosure and manual fallback.

**First step:** timings/error journey: (a) repeat breakfast and change portion, (b) home-cooked dinner and reuse tomorrow, (c) scan supplement/food label, (d) edit incorrectly recognized ingredient, (e) complete or recover a save with poor connectivity. Metrics: taps, median time, corrections, incorrect commits, completion/abandonment and confidence, with synthetic or consented user testing rather than private tracking by default.

**Smallest UX improvement:** one obvious “Log something” entry with \`Repeat / Describe / Photo / Barcode\` paths already wired to the **same existing source-review-and-confirmation mechanism**. Suggest frequent meals only from actually confirmed, account-owned historical entries; count and rank locally/source-revision-aware without sending private meals to outside suggestions. Explicit “confirm today's meal/portion”; never auto-create ingestion from saved template, plan or predicted habit. Keep voice, photo and manual options, consent, detailed corrections, successful/failed save receipts, accessibility, light/dark/mobile.

**Suggested pure chooser (not a tracking or ML engine):**
\`\`\`ts
type ConfirmedMealOccurrence = {
  mealId: string; localDate: string; sourceRevision: string;
  reviewedRecipeKey: string; confirmedConsumed: true;
};
type FrequentMealCandidate = { recipeKey: string; occurrenceCount: number; lastRecordedOn: string };
function suggestRecentMeals(
  confirmed: readonly ConfirmedMealOccurrence[],
  options: { nowLocalDate: string; max: number },
): FrequentMealCandidate[] {
  // Review canonical identifiers; deduplicate mealId and corrections.
  // No future days, non-consumed plans, stale/revoked sources, or wrong-account events.
  // Sort by repeated confirmed occurrence then recency; present only editable suggestions.
  // Use existing records/hooks; no persistent 'meal suggestions' database.
  throw new Error('DEFERRED_BACKLOG_ONLY');
}
\`\`\`
**Acceptance:** deliberate user confirmation; copy does not mutate template/previous day; correct portion and unknown micronutrients; no duplicate events; revoked source excluded; source and account switch; accessible action paths, mobile real devices, no invented “80% time saved” without actual measurement. **Do not** build full receipt-to-consumption inference unless separately justified.

---

# BL-03B — CP-07 clinician visit brief and separate complete export
**Outcome 1 — Clinician brief:** short, printable/PDF-ready, **user-curated**, dated, source-qualified concise questions and observations; no speculative AI hypotheses by default. Include only selected authorized date ranges/topics; actual medications vs prescribed/scheduled vs reported/unknown use; verified supplements with NPN when available, lab analyte value/unit/reference/assay/date and comparable-vs-not comparable changes, symptoms/timing and user questions. Every copied claim traceable back to the exact original current account-owned source and revision. Preview and selective omission before any share/download. Never imply that a printed brief is a clinical record or diagnosis.

**Outcome 2 — Full data export:** separate user-owned archive with source-typed records, revisions/lineage, original units, lab document details, unknown/zero state, deletion/withdrawal semantics where legally retainable, consent/permissions and dates; CSV for specific tabular sets and JSON/manifest for lossless structure. FHIR-style export **only where genuinely mapped and standards-qualified**, not a mislabeled arbitrary ZIP. Exclude raw tokens, provider secrets, other people's profiles or records, unintended hidden evaluators/system data. Account scope enforced server-side and actual user export confirmation. Export and brief must not be a public share endpoint by default.

**Suggested selector API boundaries (concepts; reuse current source readers):**
\`\`\`ts
type ExportScope = {
  fromLocalDate: string | null; throughLocalDate: string | null;
  include: readonly ('labs' | 'medications' | 'supplements' | 'symptoms' | 'meals' | 'activity' | 'experiments')[];
  includeExploratoryHypotheses: boolean; // default false, explicit user opt-in only
};
type BriefFact = {
  sourceRecordId: string; sourceRevision: string; occurredAt: string;
  statement: string; confidence: 'observed' | 'reported' | 'source-qualified';
  caveats: readonly string[];
};
interface ClinicianBriefDraft {
  generatedAt: string; scope: ExportScope;
  selectedConcerns: readonly string[];
  facts: readonly BriefFact[];
  questions: readonly string[];
  reviewBeforeExport: true;
}
function buildClinicianBriefDraft(
  approvedOwnedFacts: readonly BriefFact[], // obtained by authenticated, purpose-authorized server
  scope: ExportScope,
): ClinicianBriefDraft {
  // Filter only authorized scope and selected records; redact unrelated sensitive topic.
  // Never infer active medication from prescription alone or lab interpretation without validation.
  throw new Error('DEFERRED_BACKLOG_ONLY');
}
\`\`\`
**Acceptance:** correct account/consent/source revocation and export authorization; differential permissions; incomplete labs/assays; no uncontrolled source citations; no model-generated factual statements without provenance; PDF print readable and no unintended background assets; machine archive can be round-tripped or schema-validated, restoring precise unknown/zero and original units; no misleading “FHIR” label. **Assets:** text/print-first, likely none needed; only existing visual registry if a demonstrable requirement arises.

---

# BL-03C — Hypothesis-to-experiment bridge: no second N-of-1 engine
**Observed:** \`shared/experience.ts:190–218\` \`experimentSchema\` already supports planned/active/completed states, intervention dates <=90 days, separate pre-intervention baseline, metric/method/unit, expected direction, adherence, confounders, dated observations, reflection and history. Do not introduce another experiment table, adherence tracker or free-form causal “response score.”

**Minimum future bridge:** user selects an **eligible reviewed** hypothesis or a safe self-observation question → show plain-language rationale, competing factors/uncertainty and baseline evidence → user reviews proposed action and measurement method → only then create existing \`experimentSchema\` with a source link, using compatible revision handling (add optional provenance only when necessary). Clinical/medication/medical-device changes need reviewed action admission and clinician involvement as appropriate; do not auto-propose restrictive diets, supplement-dose changes or medication cessation merely because a hypothesis exists.

**Suggested admission pseudocode (boundary, NOT a new recommendation engine):**
\`\`\`ts
type ExperimentPrefillDecision =
  | {status:'eligible_for_review'; proposed: {title:string; action:string; outcome:string; metricUnit:string; measurementMethod:string}; sourceRevision:string}
  | {status:'needs_source_or_permission'; reason:string}
  | {status:'not_eligible'; reason:string};
function prepareExistingExperimentPrefill(
  admittedHypothesisId: string,
  authorizedSnapshotRef: string,
): Promise<ExperimentPrefillDecision> {
  // Resolve via EXISTING candidate/evidence/permissions/action-admission authorities.
  // Require purpose/ownership and reviewed safety, measurable non-harmful outcome.
  // Return prefill for manual user confirmation, not persisted intervention or clinical advice.
  throw new Error('DEFERRED_BACKLOG_ONLY');
}
\`\`\`
**Acceptance:** no created experiment from an unadmitted/withdrawn hypothesis, missing baseline ≠ known baseline, distinct source/effective/log times, dates valid, adherence/confounders/unknown observations, counter-hypothesis and null/worse result visible, duplicate-save avoidance, user stop/revise, no personal causal attribution, no medication change by app.

---

# BL-03D — Bounded durable offline draft saving beyond FOOD-12
**Observed:** [\`OFFLINE_SAVE_RECOVERY.md\`](../operations/OFFLINE_SAVE_RECOVERY.md) explicitly describes **open-page memory** retry; no persistent IndexedDB, across-restart guaranteed recovery or background worker. Existing server frozen-revision/idempotency and actor guard **must remain authoritative**. This is a distinct unimplemented capability, with material private-device threat model before writing sensitive local data.

**Scope:** start with a **small private draft** for manually entered meal review or activity actual-sets (and later supplement/water only if proven necessary). Do not replicate the entire health database or cache medical/hypothesis content by default. No server writes merely from seeing a saved offline draft; require user-triggered confirm/sync. Status: unsynced → submitting → confirmed receipt or needs review/conflict; use exact existing stable idempotency key and frozen save payload/revision when retrying, no “new key each retry,” no blind 4xx retry. Clear or seal drafts on account logout/switch, revoke, expiry or key loss; no cross-account read. Strong honest UX: “Saved on this device, not yet in your Bloom account” only after persistence actually succeeded. Never say “synced” without server receipt.

**Security decision before implementation:** whether local secret availability permits at-rest cryptographic protection; per-user isolation, key lifecycle, shared-device browser, stolen device/browser extension/XSS exposure, data minimization and time-to-live/explicit clear. Do not assume \`accountId\` in a client object confers server ownership, or that IndexedDB is encrypted just because the browser stores it. On insecure devices/no trustworthy storage, offer the current visit-scoped recovery and honest limitations.

**Suggested state machine and typed draft boundary (illustrative, not separate event store):**
\`\`\`ts
type LocalDraftStatus = 'local_only' | 'sending' | 'needs_review' | 'server_confirmed';
type AllowedOfflineKind = 'meal_review_draft' | 'activity_set_draft';
interface ScopedOfflineDraft<T> {
  draftId: string; kind: AllowedOfflineKind; schemaVersion: 1;
  actorBindingDigest: string; // derived from authenticated actor; not a user-editable authorization claim
  createdAt: string; revisedAt: string; expiresAt: string;
  status: LocalDraftStatus;
  payload: T; // minimal allowed fields, encrypted only under approved device/key design
  frozenSourceRevision: string; idempotencyKey: string;
}
type DraftRecoveryResult =
  | {kind:'local_only'; requiresExplicitReview: true}
  | {kind:'confirmed'; authoritativeServerRecordId: string}
  | {kind:'conflict'; requireFreshSourceAndConsentReview: true}
  | {kind:'unavailable'; reason: string};
\`\`\`
**Acceptance:** browser shutdown/restart; offline and lost-response; repeated reconnect/idempotent single canonical save, stale source conflict, account switch and logout, revoke/delete, expired/replayed draft, compromised or missing key, storage denial/quota, no health data in cache/devtools/logs, no auto-entry, clear visible unsynced state, mobile Safari/PWA and desktop. Run hardware/browser as well as synthetic tests before claims of durable success.

---

# BL-LATER — honest deferrals
**Household shared meal preferences:** May reuse household size and user-entered, permissioned shared diet dislikes/allergen cautions for shopping/meal choice without treating household member as a patient or claiming individual medical facts. No automatic transfer of health data or invented consent from “family” label.

**PREV-01–07 and CP-06:** Existing prevention architecture; future source-backed guideline applicability requires jurisdiction/age/actual pertinent anatomy/history, latest guideline revision, confirmed prior screening/vaccine history, explicit unknown/no-record vs overdue distinction, appropriate confirmation/correction. No autonomous clinical alarms and no new notification system solely for future cards.

**Caregiver / multi-person health profiles:** Separate future privacy/legal/age and guardian authority, per-person encrypted records, permissions/cross-profile audit, explicit child-specific safety and source disclosures; never model as a \`householdId\` on existing single-user records without a designed authorization boundary.

---

## Common future work and acceptance policy
- **Implementation pass begins only after GI baseline, a separate owner/Architect queue selection, source/rights clearance and actual current HEAD inspection.**
- Each selected slice: minimum useful consumer task and real failure/measurement; \`REUSE/SMALLEST_CHANGE/DEFER\` decision with file:line and test anchors; original source, version, units, privacy consent, medically appropriate abstention, accessibility and meaningful unavailable/manual fallback; no duplicate source stores.
- Test 3 states distinctly: **specified**, **code present/partially wired**, **verified functioning**, plus rights/science/release qualification. Do not state a shipped feature because a scaffold/interface is present.
- Implement sketches by adapting existing types, not by copy-pasting placeholder \`throw\` functions. **Nothing in this file is executable code or an instruction to add the proposed filenames yet.**
- The deferred backlog itself may be checked into GitHub so all agents can read it; this does not authorize any implementation or modify \`NEXT_ACTIONS.md\`.
