# Bloom — AI-Led Scientific Governance & Scientific Model Integration
**Date:** 2026-11-14 | **Architect disposition:** APPROVED v0.6 architecture and actionable Codex delta | **Implementation/independent scientific acceptance:** NOT VERIFIED
**Authority:** Owner “Bloom — Architect Directive: AI-Led Scientific Governance & Model Integration”, 2026-11-14. This decision refines scientific authority, **not** a new AI architecture, source ledger, clinical clearance, or new approval checkpoint.
**Precedence:** Later owner-approved directives on full-panel Response Intelligence, source acquisition, super-user experimental visibility, and existing scope remain binding. Codex owns implementation, verification and preview. Product owner makes strategic/product-direction decisions, **not routine scientific claim reviews or fallback adjudications**.

## 1. Core resolution and existing-code inventory

**Decision:** AI-led automated scientific curation, critical review, classification, controlled routine promotion, monitoring and withdrawal shall run **over existing Bloom source/evidence/claims/permissions/rules and action IDs**. AI agents may propose/review; deterministic, versioned policy code makes the final **allow/qualify/research-only/gate/reject** decision. A model's own statement that a study is credible, or two agreeing language models, is not independent validation.

Source inspection on `enhance/bloom-experience` shows:
- `shared/biological-model.ts`: existing evidence-network projection, nodes/edges/source links, confidence, contradiction status and source IDs. A significant proportion explicitly says `not-systematically-reviewed`; that is not preapproved personalized guidance.
- `shared/scientific-contracts.ts`: measured/modelled/association/experimental/unknown claim vocabulary; `evidenceAudit` currently marks specialistReview pending, reviewDate null and each relationship awaiting specialist review. `hostMicrobeReactionSchema`, `reactionEligibility` and `simulationReadiness` explicitly prevent unsupported personal model activation.
- `shared/biology-content.ts`: existing educational and source-status content. It permits clearly labelled basic education pending independent review, but does not infer personal clinical biology.
- `docs/architecture/V06_HANDOFF.md` Workstream A: evidence discovery, structured extraction and claim lifecycle, though older prose says every routine claim needs Biology review. **That routine bottleneck is superseded by this owner authorization** for Tier 1 and eligible Tier 2 claims; clinical claims still require qualified external review as applicable.
- `docs/architecture/STRATEGIC_PRODUCT_EVOLUTION_ARCHITECT_DECISION_2026-11-06.md`: existing rule/source→eligible actions→safety veto→Today/Progress pipeline and deterministic baseline.
- `docs/architecture/PYTHON_ML_RESTORATION_AND_MOLECULAR_EXPANSION_DECISION_2026-11-06.md`, `ML_SHADOW_EXECUTION_PRIVILEGED_VISIBILITY_2026-11-06.md`: active Python research, restricted VIEW vs COMPUTE vs APPLY authority and synthetic/reference scope. Preserve existing `ExperimentalSettings.tsx`, `GET /api/capabilities`, `PATCH /api/capabilities/experimental`; `Tester1` grant is not presumed working.
- `docs/architecture/external-data/Bloom_External_Data_Scientific_Readiness_Architect_Handoff_2026-11-14.md`: 35 source IDs, D01–D06, rights-specific acquisition, evidence claim versioning, real coverage and real-app tests.
- Related existing: `shared/wellness-actions.ts`, `shared/goal-guidance.ts`, `shared/meal-intelligence.ts`, `shared/today-focus.ts`, `shared/nutrient-source-snapshot.ts`, existing lab history/Progress, canonical source and consent, and `ml_service/research/stoichiometry.py`. Codex shall check actual HEAD modules before code edits; this is a scoped inventory, **not** an exhaustive production/runtime audit.

**Implementation gaps to measure, not assume solved:** end-to-end bounded nonpersonal literature source acquisition, study/result extraction quality and independent critical review, negative/null studies, repeatable policy approval artifact, review validity by population/claim/version, change/retraction monitoring, approved-rule promotion/revocation/rollbacks, scientifically measured coverage and model registry readiness. Existing mechanistic graph edges and implementation dates do **not** constitute reviewed clinical evidence.

## 2. Binding scientific evidence-risk release policy

Risk classification uses **intended claim, targeted individual, supported evidence, decision consequence and output pathway**, not just what backend generated it. On ambiguity, choose the more restrictive tier. One model may support a T1 general output and a separate T3 research output, but no cross-promotion.

| Tier | Claims/examples | Automated decision authority | Release behavior / stopping condition |
|---|---|---|---|
| **1 — established low-risk wellness** | General dietary pattern, ordinary dietary fibre, nutrient reference explanations, established movement guidance | **Automated approval permitted** only for exact scoped policy template + source-reviewed guideline/version + authoritative applicable population, hard exclusions, regression and source rights. No per-item human signoff. | Publish normal wellness action with source/uncertainty; dynamic user input may modify feasibility, **not** manufacture medical significance. Contradiction or missing required reference → safe known general fallback or abstain. |
| **2 — personalized, nonclinical** | Food ranking by known intake/preferences; nonclinical genetics education; microbiome hypotheses; comparable lab trends; voluntary dietary experiments | **Automated conditional approval/qualification** after evidence retrieval, separate critical review, applicability and negative-evidence checks, safety+consent+method gates and deterministic policy. No presumption that education supports personal effects. | Exact eligibility permits personal nonclinical interpretation; ambiguous inference → explicitly bounded educational/research wording or abstain. Severe or potentially clinical outputs escalate to Tier 4, not ordinary ranking. |
| **3 — experimental computational research** | AlphaGenome/AlphaMissense, molecular simulations, predicted enzyme/protein/pathway changes, theoretical host–microbe metabolites | **Automated approval only for gated research display**, if model rights, reproducible method, scientific limitations, suitable input quality and purpose-scoped VIEW_RESTRICTED are satisfied. | Separate exploration, **measured vs reported vs predicted vs hypothetical** labels, uncertainty and baseline; cannot enter food totals, observed lab history, public advice, treatments, notifications or APPLY_TO_USER. Unsafe/unlicensed/corrupt outputs withheld. |
| **4 — consequential clinical/safety** | Diagnosis/exclusion, altered prescriptions/doses, high-impact hereditary disease interpretation, experimental-model-driven disease/treatment recommendations, urgent threshold claims | **No autonomous AI clinical authorization**. Appropriate external qualified review, intended-use regulatory, validation and rights/security clearance must exist for the exact purpose. | GATED until reviewed and authorized under an explicit compatible clinical feature release; where appropriate show general non-diagnostic information or advise discussion with qualified clinician. Owner is **not** substitute scientific reviewer. |

**Additional claim-level vetoes:** inadequate data identity/units/assay; unknown study population; contradiction unresolved; retraction; unsuitable input quality; unsupported dose/form; direct clinical recommendations; sensitive variant not properly assayed; missing rights; insufficient user consent; account segregation failure; OOD model; uncertain licensing or incident-disabled capability. Any failed required gate means **no approval**, regardless of LLM score.

**Existing low-risk educational notes** with accurate general source identity remain visible with review status and caveats when allowed; don't remove them because deeper personalized effect review is pending. Users without labs/omics/devices still receive eligible general actions.

## 3. Reusable AI scientific review → policy decision state machine

Use existing evidence claim IDs/registries, versioned references and source manifests. No parallel knowledge graph and no LLM authority to write active claim permissions.

1. **Intake / exact proposed claim:** Stable claim ID, claim text, predicate/entity IDs, population, comparator, endpoint, direction, dose/form/time horizon, risk, intended exposure and capability ID; idempotent revisions. One claim may have multiple purpose-scoped dispositions.
2. **Retrieve:** Nonpersonal scheduled bounded PubMed/Europe PMC/DOI/registered-trial/guideline search from approved versioned sources; record query, query/version, retrieval time, identifiers/metadata and negative/unpublished candidates. **Never send real user's labs/genotypes/Viome file to research APIs.**
3. **Structured extract:** Capture PICO, sample size/study design, outcomes/effect magnitude and CI where given, harms/null results, applicability, evidence type, evidence date, potential bias and method uncertainty. Each extracted fact requires a quote-location/structured source field and link; fabricated or unlocatable numerical data fail.
4. **Independent challenge:** Separate critical-review pass with **different evidence retrieval query/source set or independent deterministic outcome extraction**, review of full null/contradictory studies, review protocol and separate model when cost justified. Do not treat repeated prompt self-agreement as independence. Explicit disagreement and missing evidence must stay unresolved until sufficient independent support.
5. **Apply applicability tests:** Correct population/age/health state, biological entity/strain/allele/build, source units, assay, exact intervention amount/form, realistic feasibility, adverse-event and contraindication context; evidence of general benefit is not proof of individual causal effect.
6. **Policy classify:** Deterministic release-policy evaluator consumes typed study/critical reviews + versioned source rights, risk, permissions, coverage and applicable negative tests. Decisions `approved | qualified | research_only | gated | rejected | withdrawn`; approval **scoped to exact claim/purpose/population/version**, never blanket source approval. `qualified` authorizes only vetted qualified wording.
7. **Write immutable decision receipt:** source snapshot hashes/revisions (public data only), claim+rule version, risk tier, reviewer engine/version/prompts/tool configs, disagreement and contraindications, rights/consent references, regression build/commit, scope, expiry/reassessment schedule, reason-coded exclusions. This receipt is produced by authorized policy code, not untrusted research content. Do not hash private raw report files in public registers.
8. **Promote only through existing approved-action/evidence registry:** Preflight deterministic eligibility plus tests+policy receipt must succeed. A research/qualified claim cannot set `allowPersonalAction` without separate action-specific Tier 1/2 policy proof. Ordinary runtime should read local latest eligible approved version; online retrieval outage ≠ all actions unavailable.
9. **Monitor and retract:** Weekly change/retraction checks for active claims as proposed by owner, monthly candidate discovery, quarterly structured source reviews, earlier on material guideline/claim alert. Evidence changed or critical contradiction → reevaluate and versioned downgrade/withdraw only dependencies; invalidate impacted recommendation caches/queued outputs, preserve signed historical context and show current limits. Policy rollback on incident; offline preserve only valid nonwithdrawn approved snapshot.

**Audit implementation:** Prefer existing SQL/source receipt/evidence revision and trusted job infrastructure. A small policy library+typed adapter+review/receipt records are permissible **extensions**; do not add second general AI orchestration, vector DB, autonomous paid API agent, unbounded citation crawler or user-facing scientific approval dashboard. Rate/cost-budget/rights and model-output prompt-injection defenses apply; literature is untrusted data.

## 4. Independent verification and promotion criteria

- **Evidence groundedness:** 100% actionable factual clauses must point to canonical, versioned source excerpts or reviewed guideline rules; any invented trial, dose, effect size, PMID or scope → fail.
- **Contradiction coverage:** documented independent search for null/harms, pre-registered results and corrections appropriate to claim; absence of found contradiction is **not** proof none exists. Report retrieval coverage limits.
- **Policy correctness:** 0 critical unsafe promotions across deterministic curated adversarial set; mandatory 0 unauthorized personal/clinical writes and 0 licence/consent/account violations. Model agreement is not a safety metric by itself.
- **Evidence relevance:** study population, intervention, preparation and outcome match exact claim; track separate source accuracy, study-extraction precision/recall against independently checked gold fixtures, disagreement detection and false-approval rate. Set numeric statistical thresholds based on benchmark difficulty/qualified validation rather than inventing a universal evidence score.
- **Baseline comparisons:** compare review pipeline to deterministic guidelines-only rules and a manual curated expert-reviewed subset; false positive/negative, error types, latency/cost, abstention and change-detection speed documented. Stratify by risk and domain. If Tier 2 reviewer unsupported, downgrade to education or abstain.
- **Separation of duties:** evidence author/generator cannot directly approve own model output; critical reviewer and policy evaluator independent in code/data lineage; no hidden “approval” on LLM prose. Independent model optional—not automatically required for every routine Tier 1 guideline.
- **Human external review:** ONLY Tier 4 or specified high-stakes/regulated/validation boundary; could include scientific/medical experts and counsel. An unresolved Tier 4 item remains gated even if owner desires rollout.

## 5. Scientific AI model registry — catalogue, not activation

**Reuse existing capability/model adapters and evidence/source/version manifests.** Create one versioned *registry view or configuration* linked to capability and provider keys; no new model-serving platform.

```ts
type ScientificModelRegistryEntry = {
  modelId: string; family: string; provider: string;
  exactVersion?: string; artifactOrEndpoint?: string;
  questions: string[]; requiredInputEntities: string[];
  requiredAssayAndResolution: string[]; supportedOutputs: string[];
  calibrationPopulationOrReference?: string;
  evidenceRefs: string[]; validationBenchmarkRefs: string[];
  validatedUseScopes: string[]; knownFailureModes: string[];
  researchStatus: 'candidate'|'reference-only'|'shadow-tested'|'independently-benchmarked';
  capabilityId: string; execution: 'offline-catalogue'|'bounded-api'|'private-cpu'|'licensed-cloud';
  dependencies: string[]; expectedCostAndQuota?: string; latencyAndCompute?: string;
  privacyClass: 'nonpersonal'|'sensitive-requires-purpose-consent';
  outboundDataPolicy: 'none'|'reviewed-minimized-only';
  termsUri: string; licenceDecision: 'unreviewed'|'scoped-approved'|'blocked';
  modelRightsReceipt?: string; outputRightsReceipt?: string;
  canComputeShadow: boolean; canViewRestricted: boolean; canApplyToUser: false | 'separately-approved';
  lastCheckedAt?: string; reassessmentDueAt?: string;
  fallback: string; disabledReason?: string;
};
```

**Seed candidates, with readiness initially NOT VERIFIED (do not misstate availability, costs or licence):**

| Model family | Intended scientific question / outputs | Major limitations | Integration stance |
|---|---|---|---|
| **AlphaGenome, including newer versions** | Regulatory sequence variation, predicted gene-regulatory/molecular readouts | Tissue/assay context, model predictions ≠ measured expression or validated disease consequence; exact model version and input constraints required | Candidate Tier 3 only. Official docs: `https://github.com/google-deepmind/alphagenome`; public API research terms and commercial deployment are distinct, investigate per exact version and intended use; no credential/paid activation by catalogue. |
| **AlphaMissense** | Predicted effect of *missense* variants on protein function/pathogenicity-like classification | Not a clinical diagnosis, no guarantee for non-missense variants, uncertain calibration by variant/condition/population | Tier 3 educational research only, not standalone clinical PGx. Official `https://github.com/google-deepmind/alphamissense`; code vs prediction-data licences differ; pin model/score edition. |
| **AlphaFold 2/3 and protein-interaction/structure models** | Predicted protein / complex structure, confidence metrics | Structure is not activity/biological flux/treatment benefit; structure errors/dynamics, ligands, compatibility | Optional Tier 3, only if an explicit Bloom use case defeats simpler references. `https://github.com/google-deepmind/alphafold3`; weights, code, server and commercial terms are separate. |
| **Host reference metabolic model** | Constrained reaction/pathway feasibility for studied human tissue/compartment | Tissue context, sparse measured inputs, regulatory state; stoichiometric feasibility ≠ personal response | Tier 3 curated reference case only, exact repository/model/source rights and benchmark required. |
| **MICOM + AGORA2/VMH microbial reconstructions** | Reference-community substrate uptake, exchange, cross-feeding | Species/strain mismatch, missing substrate detail, unknown expression and absent external biological calibration | Existing private Python Track B synthetic→licensed reference→independent benchmark. No personal metabolite amount. |
| **Other validated candidate models** | Specific biological question demonstrably affecting usefulness | Must beat simpler credible baseline, and pass rights, provenance, independent tests and budget | Register/review on candidate demand; do not add unsupported costly infrastructure. |

**Model lifecycle:** `identified → rights/metadata checked → source/input mapping → synthetic/reference sandbox → independently benchmarked → restricted inspectable → separately considered for applied use`. A model may be permanently research-only; Tier 4 clinical use is a separate application release and external qualification, not registry status. Model retire/rights withdrawal revokes access and dependent output. Store model artifact/content digest when legally obtained, not guessed.

**Current official-provider caveats (Nov 2026):** AlphaGenome's repository/docs describe direct API/Atlas research restrictions and distinct commercial access; AlphaMissense repository distinguishes Apache-licensed code from CC BY prediction data and explicitly disclaims clinical validity; AlphaFold 3 code, model parameters/server and commercial usage have separate requirements. Reconfirm at integration time and log current exact version/terms before any request, download or display. No unconsented private DNA transport.

## 6. Research visibility and user explanation

Every public user sees **one feasible evidenced action** plus eligible alternatives and source-backed limits. Details disclose direct observations, source dates, claim versions, negative evidence and why alternatives weren't selected. A super-user `VIEW_RESTRICTED` role can inspect **scientifically honest** unapproved/pending-review educational, model and synthetic/reference outputs on authorized existing Biology/Explore surfaces, without ability to apply them. Three independent controls `COMPUTE_SHADOW`, `VIEW_RESTRICTED`, `APPLY_TO_USER` remain; signed-in preference switch alone does not confer server privilege or personal processing consent. Source/data correction, expiry/revocation and incident disables read and cached access promptly. Unknown model output has no numeric invented 0; no false organism/allele/assay join; no personally calibrated gut molecule from qualitative Viome.

## 7. BIO-2026-101–108 crosswalk and status

| Biology ID | Existing foundation | Scientific governance delta |
|---|---|---|
| **101 evidence traceability, contradictions** | linked `shared/biological-model.ts` sources + source version lifecycle | Automated PICO/extraction provenance, null/adverse challenge, independent reviewer, policy receipt, retraction/downgrade. |
| **102 biological claims regression** | `shared/scientific-contracts.ts` claim kind, research-only checks | API/UI/export/cache claim-kind invariant tests for Tier 1–4, no personal flux or false clinical claims. |
| **103 host–microbe reaction model** | existing typed schema and reference network, Python research | Exact source chemical/taxon/strain graph joins, validated reaction/mass balance; Tier 3 only until separately evaluated. |
| **104 objective outcomes** | existing source-specific lab histories and trend timing | Review comparability, source/assay, observation vs individual causality, whole-report actions and missing contexts. |
| **105 nutrition intervention** | existing precision food evidence and guidance | Tier 1 action templates + Tier 2 food customization with studied dose/preparation and evidence disagreements. |
| **106 Athlete/healthspan** | Athlete data and general activity guidance | Tier 1 progressive activity/recovery, no fictional fitness/longevity score; actual injury/health constraints checked. |
| **107 microbial modelling** | research schema + synthetic LP + shadow/privileged viewer policy | Curated model registry, versioned source-specific reference simulations, negative controls and benchmark before applied use. |
| **108 prospective/N-of-1 validation** | action/experiment/log histories | source-based prospective design, baseline and simple alternative, separate chosen/performed/observed, outcomes and limitations. |

**Authority substitution:** For BIO-101/105/106 and routine BIO-102 cases, a completed automated review receipt and passing deterministic policies replace automatic *individual specialist approval requests*. The scientific specialist can audit sampled policies, failure rates and consequential exceptions, not sign every low-risk oat/fibre/walking recommendation. Human qualified clinical review remains for Tier 4.

## 8. Prioritized Codex implementation, no extra owner checkpoint

**P0-A — Reuse, classify, prove:** Inspect actual source, existing linked datasets, claim rules, endpoint eligibility and review status. Add shared typed claim-risk and purpose-scope assessment tied to existing evidence IDs and active capability flag. Migration only when required. Produce accurate current coverage numerator/denominators and negative-case inventory; keep active Food #12, Response #15, source pilots and current v0.6 work proceeding concurrently.
**P0-B — First fully automated Tier 1 policy slice:** Select a **small existing authoritative and truly reviewed** general action family (e.g. ordinary fibre/food swap or general movement). Populate sourced PICO/scope/guideline/exception records and test AI-assisted evidence discovery + independent critical review + deterministic approval. Require success with no remote model or low-cost external provider at normal action runtime; claim version/rights/rollback receipt and on/off regression tests.
**P0-C — Tier 2 qualified scenario:** Test one personal food preference/consumed food context and one whole-panel lab trend interpretation. Guard lab assay method; validate separate population research, user record reliability and causality limitations. Missing fasting or personal event triggers one relevant question or general action, not invented causal statement.
**P1-A — Scientific evidence acquisition/review jobs:** Extend current PubMed/Europe PMC/Crossref/ClinicalTrials dataset pipeline per original 35-source handoff; bounded metadata-only nonpersonal discovery and correction/retraction schedule. Make review quality measurable against gold fixtures; persist decision receipts and scoped reversals.
**P1-B — Model registry + super-user research:** Seed the six model families as **unactivated candidate metadata**, with concrete benefit hypothesis, cost, rights, validation and fallback. Integrate authorized viewer to existing Biology/Explore research, synthetic/reference and one source-backed microbial benchmark; keep model calculations from ordinary action ranking.
**P1-C — Scientifically meaningful monitoring:** Per-claim retraction, guideline changes, review expiry, conflicts, rights changes, coverage and reviewer disagreement; observe false approvals, abstentions, drift, latency and resource costs.
**P2 — Evaluated expansion:** More domains, qualified high-value personalized effects, separate clinical validation only where justified. High-cost model activation requires demonstrated incremental utility, scoped licence/consent and applicable approvals, not novelty.

Do **not** pause source acquisition, Food/Today or full-panel Response to build an overarching AI review platform; deliver narrow vertical slices and reusable policies in existing code paths.

## 9. Executable acceptance tests / release gates

1. Established Tier 1 fibre/food or movement claim with valid source population, permitted use, approved template and tests becomes eligible without individual human scientific approval.
2. Tier 1 guideline missing/retracted/conflicted or irrelevant age/life-stage fails promotion; unrelated safe action remains available offline.
3. Nonexistent fabricated study/PMID/effect-size in one extractor response is rejected by canonical citation identity/excerpt check; model prose cannot bypass policy.
4. Two reviewers agreeing using same retrieval set without independent checks cannot claim 'independent'; contradictory RCT/null event found in source challenge changes to qualified/gated and is recorded.
5. Tier 2 food ranking with known food allergies and unknown nutrient fields respects hard veto, retained unknowns and exact claims; no guessed deficiency or individual benefit.
6. Tier 2 two-point TG/lipid change with incompatible assay or missing fasting information must abstain from significance/causality; every original 30+ report marker remains viewable and another reviewed marker can lead.
7. Genetics: missing APOE defining variant, ambiguous build/palindromic genotype, unreviewed variant effect → research/educational or withheld, no therapeutic personalized dose.
8. Microbiome qualitative taxon and research reaction → no numerical measured SCFA, no production of microbial vitamins into eaten totals; model exchange remains theoretical.
9. Tier 3 candidate model entered in registry cannot be invoked, displayed or used without matching licence, model version, role, purpose and consent; a valid synthetic research outcome can be viewed by authorized super-user with explicit model type.
10. Tier 4 drug/dose/diagnosis claim with confident AI endorsement but no qualified clinical clearance remains GATED; no owner-as-reviewer fallback.
11. Account/user/role/consent and research-toggle changes deny read at API and cached state; research output cannot persist food plans, modify labs, issue medication advice or change ranking.
12. A literature correction/retraction, licence revocation or version change withdraws affected claim/action receipts, invalidates dependent caches, preserves historical source facts and leaves independent approved actions working.
13. Timed test: no reference API/LLM availability → normal existing allowed deterministic Today guidance and source-backed meal/save still function.
14. Model benchmarking: signed Rhea/ChEBI/strain joins, mass balance, bounds, baseline, invalid stoichiometry, version digest and negative control. No model-registry candidate falsely marks scientific validation.
15. Accepted evidence receipts include claim/version, study IDs, reviewer independence provenance, negative/null rationale, population, method, scientific risk, rights, release scope, tests, expiry and recusal/gate reason; no versionless "AI-approved" switch.
16. Science audit examines independent gold evidence sets for groundedness, contradiction misses, false approvals, clinical escalation, abstention calibration and source withdrawal latency; automated CI PASS and expert scientific validation are reported separately, not fabricated.
17. Food/Today and report-wide Response baseline acceptance continue to pass; no new approval checkpoint or mandatory genetic/Viome/device upload.

**Release evidence:** Codex reports exact SHA, source editions, claim and model registry versions, test+coverage denominators, false approval/negative errors, rights decision, specialist/qualified exceptions, API/SQL/actual Render and device/human tests as **PASS / FAIL / NOT TESTED**, and next action. No unmeasured 'clinical safety verified' claim. Public Tier 1/2 policy activation needs validated policy fixtures and source rights; Tier 3 stays restricted; Tier 4 awaits appropriate external governance.

## 10. Decision boundaries

- Product owner: strategy, market/product launch and major expenditure/rights commitments, not scientific fallback.
- Architect: integrated policy, priority and resolving cross-domain overlap; review implementation receipts, not every guideline.
- Codex: typed policy implementation, source acquisition, independently checkable review, tests, version/promotion hooks and actual deployment evidence.
- AI evidence/reviewer processes: routine nonclinical evidence classification, research extraction, contradiction and candidate approval only through policy gates.
- Qualified clinical/scientific review: clinical consequence/validation when required; external reviewers do not automatically approve a whole family.
- Legal/Security: scoped data rights, regulated intended use, sensitive processing and tenant isolation. AI does not waive legal authority.

**Final rule:** Scientific uncertainty changes *scope, label and permission*; it never fabricates a validated action. Research should progress autonomously where lawful, while routine general wellness recommendations do not require manual owner signoff.
