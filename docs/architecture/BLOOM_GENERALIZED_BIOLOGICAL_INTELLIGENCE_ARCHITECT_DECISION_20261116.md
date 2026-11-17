# Bloom — Chief Architect Decision: Generalized Biological Intelligence
**Date:** 2026-11-16  
**Disposition:** APPROVED WITH BOUNDED IMPLEMENTATION AMENDMENTS — requirements approval only; not implementation, scientific validation, clinical authorization or deployment.  
**Owner:** Chief Architect & Integration Lead  
**Implementation:** Codex, using existing canonical Bloom systems.

## Sources and precedence
- Owner's *Generalized Biological Intelligence — Scientific Discovery, Causal Evaluation & Adaptive Optimization* Technical Implementation Addendum (2026-11-16).
- `BIO-ABD-20261116-R1`, 18 requirements and acceptance scenarios A–L and M–V.
- `INT-ABD-20261116-R1`, six integration refinements and seven added negative tests.
- AI/ML reconciliation `ML-ABD-2301–2308`.
- Existing `V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`, `CROSS_DOMAIN_PRIORITY_INTELLIGENCE_V06_ARCHITECT_ADDENDUM_20261114.md`, `V06_HANDOFF.md`, `AGENTS.md`, current `NEXT_ACTIONS.md` and the relevant shared modules. Their latest live branch versions and deployment receipts must be rechecked by Codex at implementation time.
- The supplied October 18 Nutrition & Biology handoff BIO-2026-101–108 (older, scientifically relevant, not independent validation of current head).
- Brand package `bloom_brand_delivery_v1(1).zip` as historical design input; current R4/M1 brand authority in repository supersedes conflicting earlier visual guidance.

## Binding architectural decisions A–F

### A. Initial statistical scope
v0.6: source-faithful comparable longitudinal descriptive differences and change summaries, plus data-series projection and method preflight only. v0.7 initial exploratory methods: (1) descriptive time series, (2) robust within-person contemporaneous/lagged association where valid, (3) change-point detection only after benchmark passing. No general regression, Bayesian causal, neural or universal predictor in initial public-release scope. Every method has type/unit/time support, expected question, estimand, method-specific effective information thresholds, missingness policy, autocorrelation adjustment, irregular-sampling/lag policy, diagnostics, multiplicity/search-family, validation and allowed output class. Reject method registry entries without executable preflight. A null result is valid.

### B. Finding representation
Store derived **owner- and purpose-scoped** finding records anchored to canonical observations and revisions. A finding is not a new observation, a knowledge graph edge or an approved scientific claim. Mandatory: stable finding ID; immutable result revision; definition of variable/observation identity; effective and recorded/entry chronology, temporal uncertainty; analysis source snapshot and dependency fingerprint; method/version; family/search count and diagnostics; statement/causal status; evidence links, contraindication/action authority; applicable limitation/abstention/status; consent epoch; visibility; human-readable correction/retraction reason. Use existing claim, source and action contracts. Revalidation required at compute/write/display and before action selection; source deletion/revocation suppresses cached or queued results, while retaining only deletion-lawful audit metadata.

### C. Causal estimation release boundary
Everyday user-facing output: recorded changes, scientifically constrained descriptive and cautiously qualified observational associations (only after v0.7 acceptance), approved population evidence context, and clearly labelled plausible mechanisms. No personal causal effect, individualized treatment or microbial response estimate without separate reviewed design, model validation, permissions and intended-use approval. Temporal order alone is not an identification strategy. Require explicit causal-identification checklist and permitted-conclusion gate before an analysis can claim causality. Missing confounders, reverse causation, simultaneously changing behaviors and invalid counterfactuals force observational-only or abstention. External causal evidence must not be re-labelled personal efficacy.

### D. Candidate construction and optimization
Generate parameterized candidates solely under previously approved `wellness-actions` families and strict validated family schemas; never allow arbitrary JSON to become an execution instruction. Reuse `meal-intelligence` and authoritative source nutrient calculations. Constraints (allergy/exclusions, clinical/goal protection, known adequacy, provenance, user purpose) are vetoes prior to ranking. Candidate novel recipe composition is permitted; new biological claims are not. Preserve choice vs planned vs actually performed/consumed receipts. Use single Cross-Domain Priority Intelligence route: one actionable primary insight and up to three distinct alternatives, otherwise none.

### E. Benchmark and acceptance design
Science/ML pre-register, per output/method: false positive rate/FDR policy, planted/held-out relationship detection, appropriate abstention, uncertainty calibration where applicable, false causal-claim target (zero in mandatory negative fixture battery), safety/constraint violation target (zero in mandatory battery), source attribution, revision invalidation, reproducibility, p95 compute/latency and dollar budget. Compare against no-alert, descriptive baseline, existing deterministic action rules and a simple statistical baseline. Use fully held-out seeds and variable pairs unseen during algorithm selection and exclude outcome leakage. Synthetic correctness is necessary, not proof of real-world efficacy. Independent science and user-task reviews are separately recorded PASS/FAIL/NOT RUN.

### F. Release and work sequencing
**v0.6 C0–C2 first:** preserve Food Issue #12, report-wide Response Issue #15, ordinary Today fallback; add typed feature-series contract, versioned time identity, safe dependency invalidation, optional lightweight methods registry/preflight and fixture harness only when needed for safe Core. Continue the previously approved reference/synthetic molecular Python work in its bounded research lane; do not activate personal flux claims.
**v0.7 discovery:** implement candidate selection, registered methods, held-out null/FDR/temporal tests, finding lifecycle, evidence retrieval, low-noise publication and revision-safe withdraw. Research/internal-first promotion; reviewed scope for any public association insight.
**v0.7 optimization:** family-schema candidate composer, multi-goal constraint handling, private practical feedback, robust outcome comparison without causal language.
**Advanced:** causal estimators, personal microbial/metabolic predictions, emerging scientific AI and population learning behind independently validated rights/consent/scientific/release gates. No pooled model learning authorized now.

## Codebase mapping (required inspection, not presumed completed)
- `shared/scientific-contracts.ts`: preserve existing claims taxonomy, extend with distinct finding semantics only where needed.
- `shared/biological-model.ts` and evidence registry: read-only evidence linking; no new graph.
- `shared/lab-comparability.ts` and `shared/lab-history.ts`: reuse assay identity/date/unit/preanalytics preflight; never infer analysis comparability from chart lines.
- `shared/wellness-actions.ts`: authoritative action family, purpose and hard veto; validate family-specific parameter schemas.
- `shared/today-focus.ts`: source-true fallback plus new approved CDPI route, never an AI replacement for all daily functionality.
- `shared/meal-intelligence.ts`, `shared/nutrition-summary.ts`: nutrient-grounded candidate composition, unknown != zero.
- Existing source/consent/revision event paths: server-derived owner, immutable source snapshot, safe invalidation and deletion.
- Python: optional minimized, versioned, bounded analytical worker; Node/server retains permissions, allowed claims, action authority and publication.

## Required transaction and work scheduling invariants
- Analysis jobs carry account scope (server derived), purpose, source fingerprint, consent/permission epoch, evidence version, method/version and idempotency key.
- Enforce right-to-process at submission and before compute; compare-and-publish only if eligibility/epoch/fingerprint still current, then verify again at read/display and action gate.
- Deletion and revocation invalidate queued jobs, active projections, owner caches, suggestion influence and derived data according to retention policy. No cross-user caches, telemetry with raw sensitive features or unrestricted model providers.
- On Python/worker/remote-source failure core Today, Food and Bloodwork remain usable and show truthful source freshness; distinguish NOT_RUN, INSUFFICIENT_DATA, NO_FINDING, SOURCE_UNAVAILABLE, RESEARCH_ONLY, WITHDRAWN, SUPPORTED_FINDING.
- Bound candidate families, lags and scans; batch and rate-limit dense wearable streams; prioritize decision-relevant results and avoid repeated notifications.

## Acceptance obligations
1. Preserve all original Biology A–L / M–V cases and Integrations' seven negative cases without substitutions.
2. New held-out, previously unseen eligible variable pairing appears correctly as exploratory (never causal) if robust significance and power survive prespecified controls.
3. Null/autocorrelated/seasonal/reverse-causal/multiple-testing/fake-lag fixtures abstain or remain qualified; search-family count and effective information recorded.
4. Source timestamp correction reversing exposure/outcome order retracts former insight and blocks action influence.
5. Job queued before revoked genetics/lab permission never publishes, and an account switch cannot view old cache.
6. Incompatible lab assays, same-day distinct specimens and unknown collection times never silently merge.
7. New permitted food inventory produces sourced nutrition math, strict exclusion protection, protected protein/energy needs, editable plan and confirmed actual-consumption distinction.
8. Diet + weight loss preceding triglyceride change does not allow apportioning caused percentage to either; missing-confounder case abstains.
9. Simulated/reference molecular outputs cannot be promoted to personal SCFA/gut concentration or clinical action.
10. Proactive Today finding is comprehensible, nonduplicate, source-labelled and optional; no-finding is not error; core works when Python offline.
11. Test exact source SHA, CI, DB migration/owner scope, authenticated browser save/reload, Render deployed SHA, scientific review and UX evaluation separately; report all incomplete evidence as NOT RUN, not PASS.

## Independent status as of this architecture review
| Item | Classification |
|---|---|
| Source provenance, graph/claims, general wellness action IDs, Today routing, lab comparability | Existing code verified by targeted source inspection; integrated discovery behavior incomplete |
| Generalized method registry, novel association engine, persistent finding lifecycle | Requires additional implementation/held-out test evidence; not shown deployed |
| Causal individualized estimation | Research-only and scientifically restricted |
| Meal/Today/Response real decision journeys | Existing portions but open v0.6 Core implementation and deployed user-journey verification |
| Molecular Python reference research | Approved active bounded R&D; actual current model acceptance not verified in this review |
| Specialist independent scientific/UX/security approval and Render new discovery SHA | NOT VERIFIED |

## Mandatory code-preservation policy for future Architect handoffs
When owner or specialist material supplies TypeScript, Python, SQL, JSON examples, algorithms, pseudocode, schemas, API signatures, tests or migration specifications, the consolidated Architect handoff must include the substantive code in a **Source Proposal** or **Architect-Adjusted Implementation Reference** section, or provide a stable exact-version reference if verbatim inclusion would be impractical. It must identify which snippets are original, which are amended, why changes were made, what is illustrative, what is binding, what is prohibited, and the current verification state. No example is proof of existing code. Never silently discard or overwrite submitted code. Codex must inspect HEAD and adapt names/contracts to existing canonical modules rather than blindly copy new parallel systems.

## Appendix A — Architect-adjusted reference contracts (TypeScript)
**Provenance:** The following is adapted from the owner's November 16 addendum (`ObservationSeries`, `DiscoveryMethod`, `BiologicalFinding`, `CausalAssessment`, `ImprovementCandidate`). They are implementation references, **not verified repository interfaces**. The owner-provided field intents are preserved; amendments are described in Appendix D. Codex should reuse existing Zod schemas/identifiers and domain modules before adopting the illustrative names.

```ts
// A1. Read-only projection over canonical observations, never a second ledger.
type ObservationDomain =
  | "food" | "activity" | "laboratory" | "symptom"
  | "body" | "sleep" | "other";
type ValueKind = "measured" | "reported" | "estimated";
type ObservationSeries = {
  projectionVersion: string;
  variableId: string;                   // typed canonical identity, not raw user label
  domain: ObservationDomain;
  valueKind: ValueKind;
  unit: string | null;
  observations: Array<{
    observedAt: string | null;         // effective/start time, if known
    observedUntil?: string | null;     // optional interval end
    recordedAt: string;                // distinct import/entry time
    timezone: string | null;
    timePrecision: "instant" | "day" | "interval" | "estimated" | "unknown";
    value: number | null;              // unknown stays null; never synthesize zero
    eventState: "observed" | "reported" | "estimated"
      | "planned" | "confirmed-performed" | "confirmed-missed" | "unknown";
    sourceId: string;
    sourceRevision: string;
    identityId: string | null;         // analyte/food/device/assay identity
    qualityFlags: string[];
  }>;
  coverage: {
    expectedCount: number | null;
    observedCount: number;
    missingCount: number | null;
    effectiveIndependentCount: number | null; // method-computed, not raw row count
    coverageBasis: string | null;
  };
};

// A2. Registry declarations and *separate executable preflight*.
type DiscoveryMethod = {
  id: string;
  version: string;
  question: string;
  estimand: string | null;
  supportedDomains: ObservationDomain[];
  supportedValueKinds: ValueKind[];
  requiredInputCharacteristics: {
    minimumIndependentInformation: number | "method-specific";
    requiresRepeatedOutcomes: boolean;
    requiresTemporalOrdering: boolean;
    supportsIrregularSampling: boolean;
  };
  assumptions: string[];
  supportsConfounderAdjustment: boolean;
  multipleTestingPolicy: string;
  validationStatus: "research" | "engineering-tested" | "independently-validated";
  permittedOutput: "descriptive" | "exploratory-association" | "qualified-response-estimate";
};
type MethodPreflight = {
  methodId: string;
  methodVersion: string;
  eligible: boolean;
  reasonCodes: string[];
  rawObservationCount: number;
  effectiveIndependentCount: number | null;
  usablePairedCount: number | null;
  prespecifiedExposureWindow: string | null;
  diagnosticsPlanned: string[];
  selectionFamilyId: string;
  totalCandidateTestsInFamily: number;
};
// Registry data by itself NEVER establishes eligibility. `preflightMethod`
// must implement versioned, testable method-specific scientific checks.

// A3. Owner-private derived finding, not evidence approval or a new source record.
type BiologicalFinding = {
  id: string;
  revision: string;
  findingKind: "recorded-change" | "exploratory-association"
    | "population-supported-relationship" | "mechanistic-hypothesis"
    | "qualified-individual-response";
  status: "candidate" | "insufficient-data" | "under-evaluation"
    | "qualified" | "contradicted" | "superseded" | "retracted";
  variables: string[];
  methodId: string | null;
  methodVersion: string | null;
  selectionFamilyId: string | null;
  result: {
    effectEstimate: number | null;
    effectUnit: string | null;
    intervalLow: number | null;
    intervalHigh: number | null;
    uncertaintyDescription: string;
    diagnostics: Record<string, number | string | boolean | null>;
  };
  causalStatus: "not-assessed" | "not-identified"
    | "observational-only" | "causal-evidence-reviewed";
  sourceDependencies: Array<{ sourceId: string; revision: string }>;
  evidenceClaimIds: string[];       // linkage, not permission to use as clinical claim
  limitations: string[];
  abstentionReasons: string[];
  actionEligibility: "none" | "education-only"
    | "approved-general-action" | "approved-personalized-nonclinical";
  analysisVersion: string;
  evidenceVersion: string;
  sourceFingerprint: string;
  authorizationEpoch: string;     // server-derived; never supplied as trusted client data
  purpose: string;
  evaluatedAt: string;
  expireAt: string | null;
  retractionReason: string | null;
};
// The storage and user-facing DTO MUST derive account ownership server-side.
// The `causal-evidence-reviewed` state is not itself an authorization to expose
// individual causal effects. Separate evidence/action policy remains authoritative.

// A4. Identification assessment, not automatic causal estimation.
type CausalAssessment = {
  proposedExposure: string;
  proposedOutcome: string;
  temporalOrderingEstablished: boolean;
  confounders: Array<{variableId: string; status: "observed" | "unobserved" | "unknown"}>;
  competingExplanations: string[];
  identificationStatus: "not-assessable" | "not-identified"
    | "candidate-design" | "validated-design";
  assumptions: string[];
  sensitivityChecks: string[];
  permittedConclusion: "description-only" | "association-only"
    | "population-evidence-context" | "qualified-causal-estimate";
  reviewReferenceIds: string[];
};
// `qualified-causal-estimate` remains restricted by independent release policy.

// A5. Novel feasible composition, existing approved action family only.
type ImprovementCandidate = {
  candidateId: string;
  actionFamilyId: string;
  actionFamilyVersion: string;
  parameters: unknown;                // validated using family-specific strict Zod schema
  supportingFindingIds: string[];
  supportingEvidenceIds: string[];
  goalsSupported: string[];
  goalsPotentiallyAffected: string[];
  eligibility: { passed: boolean; vetoReasons: string[] };
  predictedQuantities: Array<{
    metric: string; value: number; unit: string;
    sourceId: string; sourceRevision: string;
    coverageStatus: "complete" | "partial";
  }>;
  clinicalEffectEstimate: null;        // conservative initial release contract
  feasibility: {
    preparationTimeMinutes: number | null;
    userPreferenceMatch: string;
    restrictionsSatisfied: boolean;
  };
};
// Never assume unknown nutrients are zero, unknown contraindications are safe,
// or a proposed meal was eaten. Only signed-in user confirmation records actual use.
```

## Appendix B — Adapted orchestration pseudocode
**Provenance:** Keeps the owner's `evaluateEligibleChanges` sequence while incorporating Integrations `INT-ABD-01–06`, ML `ML-ABD-2301–2308`, and Biology's existing pipeline responsibilities. **Conceptual only:** exact functions, transaction primitives and policies must be mapped to existing working code.

```ts
async function evaluateEligibleChanges(
  authenticatedScope: AuthenticatedScope, // created by server auth; never client-claimed
  changedSources: SourceRevision[],
  purpose: ApprovedPurpose
): Promise<void> {
  const snapshot = await buildAuthorizedSnapshot(authenticatedScope, changedSources, purpose);
  const fingerprint = fingerprintAuthorizedDependencies(snapshot); // incl. evidence/consent epoch
  const affected = determineAffectedAnalyses(snapshot);
  const family = generateGovernedCandidateFamilies(affected, snapshot); // bounded, auditable
  const preflight = selectAndPreflightMethods(family, snapshot);        // real scientific checks
  const results = await runBoundedAnalyses(preflight.eligible, snapshot, {
    idempotencyKey: fingerprint,
    resourceLimits: approvedComputationLimits,
  });
  const statistical = evaluateStatisticalValidity(results, preflight, snapshot);
  const evidenceQualified = await attachExistingScientificEvidence(statistical);
  const causalClassified = evidenceQualified.map(f =>
    assignPermittedConclusion(f, assessCausalIdentification(f, snapshot))
  );
  const candidateOptions = generatePermittedImprovementOptions(causalClassified, snapshot);
  const validatedOptions = validateFamilyParameters(candidateOptions); // strict schemas
  const eligibleOptions = enforceExistingActionGates(validatedOptions, snapshot);
  const prioritized = rankWithExistingCrossDomainPriority(eligibleOptions, snapshot);

  // Mandatory server-side compare-and-publish: one authorized, version-consistent
  // operation. A revoked source, stale epoch, edited assay or withdrawn claim wins.
  await publishOnlyIfCurrent({
    scope: authenticatedScope,
    purpose,
    expectedFingerprint: fingerprint,
    sourceRevisions: snapshot.sourceRevisions,
    evidenceRevision: snapshot.evidenceRevision,
    authorizationEpoch: snapshot.authorizationEpoch,
    findings: causalClassified,
    actions: prioritized,
  });
  // Every subsequent read/display/action eligibility also rechecks authority.
}
```

**Separation of authority:** statistical computation proposes candidates; scientific evidence adjudication qualifies interpretations; the existing approved-action and safety gate determines what may be offered; the person chooses what is actually performed. Research-only molecular results and unreviewed LLM text cannot bypass the action gate.

## Appendix C — Source-derived integration signatures and tests
The Biology specialist's conceptual discovery boundaries are preserved below; these are responsibility contracts, not instructions to create redundant services.

```ts
buildOwnedTimeline(actor, purpose, consent, revisionWindow);
eligibleAnalyses(timeline, methodRegistry, qualityPolicy);
generateCandidates(plan);
evaluateCandidate(candidate, evidenceRegistry, sensitivityPolicy);
proposeEligibleActions(reviewedFinding, existingActionCatalog, constraints);
selectPresentation(existingPrioritySelector, candidates);
invalidateBySourceRevisionOrConsent(affectedDependencies);
```

ML specifies mandatory reason-coded method preflight and family-wise search accounting. Integrations specifies **bitemporal observed-vs-recorded events**, source-native assay/identity rules, authorization before compute/write/display, compare-and-publish, revocation/race invalidation, idempotent jobs and truthful source-unavailable states. Codex must preserve **the full original A–L, M–V and seven Integrations negative tests**, plus the addendum's novel held-out association, confounded simultaneous diet/weight/TG, source-retraction, food-composition and generalization criteria. These are acceptance specifications, not fabricated test implementations.

Reference *test harness pattern* (requires concrete repository fixture APIs and deterministic seeded generator):

```ts
// Pseudocode only; must be replaced with real executable test runner calls.
for (const scenario of heldOutScenarios) {
  const result = await evaluateSyntheticFixture(scenario.seed, scenario.sources);
  assert.equal(result.accountScope, scenario.expectedAuthorizedOwner);
  assert.noUnsupportedCausalClaim(result);
  assert.noUnapprovedAction(result);
  assert.sourceVersionConsistent(result);
  assert.conformsToExpectedAbstentionOrFinding(result, scenario.expected);
}
// Separate prespecified null-family/FDR benchmark with 500/1000 variables;
// preserve all tested comparisons, family IDs, observed false discoveries and
// the source/seed/method identity of each run. Never tune on final holdout seeds.
```

## Appendix D — Change log relative to supplied code
| Original supplied concept | Architect disposition / reason |
|---|---|
| `ObservationSeries` | **Retained and extended:** occurrence interval, entered time, precision, event state, identity and effective information, to avoid false temporal ordering and inflated sample counts. |
| `DiscoveryMethod` | **Retained and extended:** question/estimand and separate executable `MethodPreflight`; declarations alone cannot establish method validity. |
| `BiologicalFinding` | **Retained and extended:** revision, diagnostics, family, abstention, source fingerprint, evidence revision, consent epoch and retraction reason. Private ownership always enforced server-side. |
| `CausalAssessment` | **Retained:** separate assessment; individual causal estimates remain gated, even if schema permits that enum value. |
| `ImprovementCandidate` | **Retained and tightened:** original arbitrary `parameters: Record<string, unknown>` becomes `unknown` until validation by approved action-family schema; signed source revisions on calculated quantities. |
| `evaluateEligibleChanges(...)` | **Retained and revised:** governs candidate search, validates method preflight and input schemas, enforces version/authorization compare-and-publish; no duplicate evidence/action platform. |
| Biology discovery API signature list | **Preserved conceptually:** maps to current modules; no requirement to create seven new services. |
| Specialist example JSON finding | **Preserved by reference** to BIO-ABD §6; intentionally null/insufficient-data example, never real user result or executable data. |
| ML/Integration contracts | **Integrated:** searches/multiplicity, authorization epoch, bitemporal identity, worker failures, source revocation, late-job races, independence and no-population training. |

## Implementation discipline for Codex
- Treat snippets as *approved design references*, not copy/paste-ready code and not evidence of deployed functionality. Replace placeholder `AuthenticatedScope`, `ApprovedPurpose`, `SourceRevision` and unknown helper names with existing canonical interfaces or narrowly typed extensions.
- Validate runtime and persisted boundary schemas (existing Zod style), enforce strict input limits and ownership, and avoid introducing redundant persistence tables. Never store a full genomic/raw PDF source merely to compute minimized features.
- Confirm consistency of analysis units, event time, source revisions, evidence selection family, claim release class and action parameters through real executable tests and audited server integrations.
- Any deviation from supplied substantive code must be documented as an explicit code disposition (retained, revised with rationale, superseded by exact existing module, deferred for validation, or rejected for safety).

## Directive to Codex
At start of implementation inspect actual current HEAD/branch and all existing canonical module/contracts, issue #12/#15 scope and deployed preview. Merge/deduplicate the requirement IDs into the existing dependency backlog, not a new workstream. Complete C0/C1/C2 real user journeys before new analytics features; implement no redundant ledger/graph/engine. Submit exact-version diffs, source-to-feature crosswalk, reproducible holdout fixtures, status matrix and live proof of safe source invalidation. Continue authorized safe implementation without interim owner approvals; retain separate scientific, sensitive-data, production and public-release authorization gates.

## Mandatory Codex-accessible publication policy (Owner directive, 2026-11-16)
All future Chief Architect handoffs intended for Codex must be committed to the active authorized Bloom development branch under `docs/architecture/` (or the existing canonical handoff path), not merely delivered as a local download. Publish the full substantive code examples/contracts and their amendment rationale, link the exact GitHub commit and file, and verify the remote content. Honor the current `AGENTS.md`/`NEXT_ACTIONS.md` execution order and do not independently change `main`, activate production, alter sensitive data, or introduce new owner gates. A local artifact is a convenience copy, not a substitute for repository publication.
