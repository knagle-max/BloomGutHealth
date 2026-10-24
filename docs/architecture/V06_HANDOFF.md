# Bloom v0.6 — Consolidated Chief Architect Handoff (Living Draft)
**Created:** 2026-10-23 | **Owner:** Chief Architect & Integration Lead | **Status:** Architecture planning / specialist intake; NOT authorization to displace unfinished v0.5.

## 0. Scope and execution boundary
- This is the **single evolving v0.6 architectural handoff**. It supplements, rather than replaces, `docs/architecture/POST_V05_ROADMAP.md`.
- **Codex is sole implementation owner** of code, tests, GitHub changes and Render preview. Finish `docs/architecture/CURRENT_V05_REQUIREMENTS.md` first. Do not stop active v0.5 engineering to build Coach or advanced v0.6 systems.
- Continue safe v0.5 development, tests, commits and pushes without per-commit Product Owner approval. Specialist reviews can run in parallel. Security/consent/clinical/licensing and public release controls remain distinct.
- This document can be edited while v0.5 proceeds. Only change v0.6 status to implementation-ready after deduplication and dependency review; status is not proof of implementation.
- Screenshot comparisons are **selective for substantial visible UI/branding/workflow changes**, with annotated highlights of actual changes and original images preserved. No near-identical comparisons; backend features use contracts and test evidence.

## 1. Product structure and strategic intent
Bloom remains one brand with three distinct, permission-separated workspaces:
1. **Everyday:** practical nutrition and health goals; Today/Explore/Progress; measured outcomes.
2. **Athlete:** individual training, fueling, recovery and performance; fully usable without a coach, wearables or AI.
3. **Coach:** optional professional workspace for athlete-authorized rosters, programming, review and limited coaching data. Proposed indigo theme and final entitlement/brand palette require validation; do not expose a nonfunctional workspace as available.

Prioritize outcome-first, evidence-aware, feasible user actions over opaque health/biological-age/readiness scores. Keep measured observations separate from population evidence, functional potential, modeled outputs and unknowns.

## 2. Workstream A — Living evidence and safe recommendation lifecycle
**Sources:** Biology comprehensive v1.1 BIO-26-301–318; Integration living-evidence INT-EVID-2026-01–08; ML biological intelligence ML-26-201–206; Branding MKT-AI-201–204/207/208.
- Central **free-first, metadata-first** PubMed/Europe PMC discovery and Crossref integrity checks; provenance, indexing lag, rate limits, retries, identifier resolution and licensing manifest. ClinicalTrials.gov and licence-compatible PMC full text later. No automatic paid services or user-health-data transfers.
- Structured draft extraction: study population, intervention/comparator, endpoint/effects, harms, null studies, bias and applicability. Human Biology review; corrections and retractions propagate through dependencies.
- Immutable versioned source → claim → reviewed rule → recommendation, with status (draft/approved/restricted/withdrawn), complete attribution, changed-rule impact, reproducible prior plan versions and tested rollback.
- **Trust boundary:** external research, retrieved articles or LLM drafts cannot directly mutate active personal advice. Reviewed releases only, with deterministic safety/eligibility checks and user-visible meaningful change explanations.
- Evidence states visibly distinguish *recorded by user*, *provider reported*, *general research*, *model estimate*, *research simulation*, *unconfirmed/unknown* using text plus icons, never color alone.
- UI orders **one action → why → observed data used → alternative → limits → way to measure**, with optional mechanistic detail and an appropriate abstention alternative. No fabricated outcomes, doses, causal links or confidence percentages.
- Evaluate prospective benefit against guidelines and simpler baselines; logging, source freshness and click metrics alone do not validate effectiveness.

**Phasing:** A0 approved-claim/permission contracts and safeguards; A1 free-first discovery & review queue; A2 versioned rule releases/rollback and change notices; A3 validated personalization updates.

## 3. Workstream B — Outcome-first personal biological intelligence
**Sources:** BIO-26-301–312; ML-2026-101–112 and ML-26-201–206; Branding MKT-AI-201/202/204/207/208.
- Enhance reliable lab ingestion/units/provenance, observable outcomes and longitudinal N-of-1 plans. Never silently confirm inferred source units, invent missing data, or interpret method-incompatible trends as comparable.
- Reviewable typed host–microbe–food knowledge model: genes/variants, strain-resolved organisms, proteins, enzymes (EC), reactions (Rhea), substrates/cofactors/compartments, metabolites, interventions and measured outcomes. Distinguish biochemical capability, association, observed activity, simulated flux and demonstrated intervention effects.
- Keep research graph separate from approved personal intervention-evidence graph. Study-linked null/contradictory evidence must remain visible.
- Genotype, taxonomy or potential function is not demonstrated activity, metabolite concentration, causality or a validated individualized food/workout effect.
- Evidence-gated nutrigenomics; assay capability/quality classification (16S vs shotgun vs expression vs metabolomics, vendor summaries). Research pathway explorer optional, with explanatory text fallback.
- Research-only microbial ecological simulation until independent benchmarks, data coverage and validation; no clinical recommendations directly from simulated flux.
- Calibrated predictive models with baselines, held-out cohorts, subgroup performance, abstention, drift and evaluation of incremental benefit; no unsupported 'years gained' or fixed ideal microbiome.
- Permissions and licensing per dataset, source, content and AI provider; no hidden training on user data.

**Phasing:** B0 shared identity/evidence/assay contracts; B1 better measured-outcome personalization; B2 curated mechanistic graph + explorations; B3 model research/evaluation before clinical claims.

## 4. Workstream C — Bloom Coach (new optional professional product)
**Sources:** Biology Coach v1.1 BIO-COACH-401–417; ML Coaching ML-COACH-201–206; Branding MKT-AI-205/206 and MKT-BRAND-301; User Testing UT-MLC-401–408.
- **Consent is the foundation**: athlete initiates/approves invitations; identity, purpose, permitted categories, duration and history scope explicitly reviewed; server-side per-athlete/per-record enforcement for role, purpose, export, search, AI, derived views and notification. Immediate future-access revocation and honest previously-seen/exported-data messaging; audit logs.
- Default coach access only to scoped training plans, completion and chosen availability/performance data. No default raw genetics, microbiome, labs, clinical history, body composition, private diary, precise location, sensitive recovery/mental-health information or private messages.
- Role-based access for independent/sport/strength coach, qualified nutrition or clinical specialist, head/assistant coach and team admin. **Role title != verified credential**. Handle youth/power imbalance and professional scope-of-practice with Security/Legal review.
- Reusable professional-owned **template library** (workouts, cycles, season programs, fueling, tests and instructions), with explicit versions, ownership, sharing rights and deidentified-by-default templates. Assignments are athlete-specific versioned snapshots; editing a template never silently alters active plans.
- Coach roster: 1 / 5 / 50 athlete scenarios, calendar, planned/completed sessions, goals, training load from duration × sRPE, measured performance tests, recovery information shared at athlete discretion, reviews/messages, missingness and stale records. No unsafe comparison leaderboard or invented injury/readiness risk.
- Multidisciplinary plans must detect conflicting schedule/workload or clinician restrictions while disclosing only minimum necessary details and respecting professional authority.
- **AI copilot optional**: drafts and critiques evidence-grounded training/nutrition plans; cannot approve, assign, publish or override medical restrictions. Deterministic constraints before/after model outputs; explicit human approval and visible change diff; AI drafts never mistaken for active plans. Template-only AI without personal health data by default; provider-context disclosures and consent on permitted derived data.
- Athlete solo app must remain complete without Coach. Tests: denial, scope narrowing, revocation, role switching, accidental cross-athlete data access, coach leaving team, missing inputs, unsafe drafts, licensing, minor handling, mixed units.

**Phasing:** C0 role/permission/consent threat model and data contracts; C1 opt-in coach relationship, roster, template/versioned plans and reviews; C2 multi-professional workflows and clinician boundary; C3 human-reviewed AI copilot, subject to validated safety/usability; C4 optional device integration after platform/access verification.

## 5. Workstream D — Unified visual, scientific and AI UX
**Sources:** Branding Biology/AI design signoff MKT-AI-201–208; MKT-BRAND-301; existing Bloom brand package; User Testing ML coaching review.
- One shared design system and accessible component semantics across Everyday, Athlete and Coach; distinct accent/navigation/priority, no independent brand fork. Proposed Coach indigo `#62558D` is a candidate only.
- Evidence status vocabulary consistent everywhere. One visible task/action on Everyday; training next action on Athlete; roster and outstanding review on Coach.
- Extend existing EvidenceCard/AdviceCard patterns; future EvidenceChange, CoachSharePermission, CoachAIReview, PathwayExplorer components only when needed by working features, not decorative mockups.
- Label AI draft vs approved/active vs restricted; show proposed-versus-current **plan content diff** for professional approval. This is not the same as before/after screenshot evidence.
- Accessible at 320px, 375px, tablet, desktop, dark mode and 200% zoom. Meaning not dependent on colors alone. Progressive disclosure, meaningful empty/loading/offline/revoked/error cases.
- Preserve current Everyday/Athlete navigation, assets and settings single-authority fixes in v0.5.

## 6. Workstream E — evaluation, governance and sustainable costs
- Security: data minimization, consent/revocation, anti-leakage and permission propagation; threat model for ingestion and cross-athlete AI contexts.
- Legal: clinical intended-use boundaries, regulated claims, minors, data licences, professions and commercial reuse; public-release gate, not routine safe development blocker.
- Biology: study appraisal, actionability, clinical and nutrition/exercise safety.
- ML: identifier/assay correctness, benchmark quality, model calibration, adversarial and leakage tests; champion/challenger governance.
- Design and User Testing: usability, comprehension, explainability and privacy affordances in 1/5/50-athlete, Everyday and Athlete journeys.
- Architect: deduplicate IDs and maintain cross-specialist traceability and release phases. Codex: sole builder/tester/deployer.
- Cost controls: metadata/free-first APIs, hard quotas and budgets; evaluate staff-curation costs, no subscriptions or new vendor expenditure without owner authorization.

## 7. Integrated work packages and high-level dependencies
| Package | Outcome | Core specialist IDs | Dependency | Proposed phase |
|---|---|---|---|---|
| V06-01 | Evidence status + approved-claim contract | BIO-26-310/315, ML-26-202/204, MKT-AI-201/202 | v0.5 source/evidence correctness | Foundation |
| V06-02 | Free-first literature ingestion & review queue | BIO-26-313/314, INT-EVID-01–06 | licence/source identity, V06-01 | Foundation |
| V06-03 | Reproducible rule update/revoke/rollback | BIO-26-315/316/318, INT-EVID-05/07/08 | V06-01/02 | Foundation |
| V06-04 | Measured-outcome personalization/experiments | BIO-26-301/303–305/308/312, ML-26-205 | lab safety/units, V06-01 | Near-term |
| V06-05 | Coach consent/role/resource access | BIO-COACH-401/406/407/414, ML-COACH-203, MKT-AI-205 | Security/Legal threat model | Coach foundation |
| V06-06 | Coach roster + template library + assigned plans | BIO-COACH-402/403/411/415, ML-COACH-201/206 | V06-05 | Coach foundation |
| V06-07 | Coach progress, collaboration + review UX | BIO-COACH-404/405/408/416, MKT-AI-206/207 | V06-05/06 | Coach expansion |
| V06-08 | Optional deterministic-gated AI coach copilot | BIO-COACH-412/413/417, ML-COACH-202/204, UT-MLC-402/404 | V06-05–07 + benchmark | Later Coach |
| V06-09 | Host–microbe reaction graph and cautious simulation | BIO-26-302/306/307, ML-26-201/203/204 | evidence/assay quality and licences | Research |
| V06-10 | Personalization evaluation, equity and model governance | BIO-26-309/317, ML-26-206, UT-MLC-404/407 | validated labels, independent holdouts | Cross-cutting |
| V06-11 | One-brand/three-workspace UX + trust labels | MKT-BRAND-301, MKT-AI-201–208 | appropriate real features and consent | Cross-cutting |

## 8. Decision log (2026-10-23)
- D01 **Approved architectural direction:** a single Bloom brand with Everyday, Athlete and separate, optional Coach workspace.
- D02 **Approved architectural direction:** professional templates and assigned plans are separate immutable/versioned constructs.
- D03 **Mandatory safety design:** athlete-controlled purpose-limited grants with narrow defaults and record-level server checks; no blanket medical data access by role label.
- D04 **Mandatory AI design:** draft/critique only; authorized human approval to activate plans; deterministic checks and consented provider contexts.
- D05 **Mandatory evidence design:** retrieval/article/LLM candidate path must never publish directly to user recommendations.
- D06 **Release separation:** no claim of clinical outcome advantage or validated personal microbial flux without independent scientific tests.
- D07 **v0.5 protected:** none of these future Coach/research features is a reason to stall remaining v0.5 work.
- D08 **Visual evidence:** only substantial visible UI changes merit before/after screenshot comparisons, with numbered annotations identifying actual changes.

## 9. Open architecture items for subsequent revisions
- Final coach role/entitlement model, verified credentials and jurisdiction coverage (Legal/Security).
- Group/team tenancy, organizational billing, and athlete-team affiliation lifecycle.
- Exact scoped schema and permission derivation contracts; separate medical-professional restricted notes.
- UI token accessibility and final Coach icon/palette sign-off.
- Choice of evidence-review staffing, frequency and legally reusable full-text sources.
- Exact efficacy study/clinical benefit benchmarks and staged rollout thresholds.
- Implementation-level dependency review after v0.5 is complete and Codex has reported final v0.5 status.

## 10. Source and verification ledger
Documents reviewed (2026-10-23): Biology comprehensive research v1.1; Integration living-evidence free-first; ML & Biological Intelligence; Biology Coach v1.1; ML Coaching addendum; Branding Biology/AI design signoff + Amendment A; User Testing science/AI and ML coaching review/addendum. Their source inspection and conditional specialist approvals are not independent runtime validation or production sign-off. Current v0.6 is architect-consolidated **planning**, not a report of shipped functionality.

**Update protocol:** Future specialists add dated source handoffs; Chief Architect updates this file with new/revised IDs, acceptance, dependencies, supersession and decision log. Keep v0.5 requirements separately authoritative until completed. Do not silently reinterpret source proposals as implemented.


---

## 11. Research directive intake — October 23, 2026 (Revision 1)

**Intake scope and verification:** Reviewed finalized research submissions accessible in the shared Bloom Library from Nutrition & Biology (BIO-OPT-01–05; LEARN-01–06; INFO-01–04), Integrations (INT-OPT-01–06), Branding & UX (UX-OPT-01–07), User Testing (UT-OPT-01–07), Security (SEC-OPT-01–10), and Legal/Regulatory (LEG-V06-001–012). Research complete **for these six specialties**, but acceptance is architectural only: none represents live v0.6 implementation, real participant efficacy data, device availability or counsel clearance. The dedicated **ML-OPT-01–06** optimization handoff has now been located and reviewed in the repository at `docs/agent-handoffs/Bloom_ML_V06_Unified_Optimization_Research_Handoff_2026-10-23.md` (22,326-character full source), with a matching shared Library coordination copy. **All seven requested specialist tracks now have submitted research handoffs**. Submission and architect intake do not imply clinical validation or implementation.

### 11.1 Accepted priorities and crosswalk: no duplicate systems
| Consolidated implementation package | New source IDs | Architects' scope/prioritization | Existing workstream |
|---|---|---|---|
| **V06-12 Goal-to-action and trade-off contract** | BIO-OPT-01/02, UX-OPT-01/02, UT-OPT-02/03, SEC-OPT-05, LEG-V06-001/003 | **P0 core concept.** Multi-goal priority & conflicts, feasibility and no-assay default; evidence-based nutrition, exercise and recovery together, not three contradictory plans. Deterministic safety constraints first; human goal adjustments and traceable source inputs. | V06-04 / V06-11; ML-OPT-01 integrated: constrained ranking, Pareto/epsilon alternatives, explicit hard exclusions |
| **V06-13 Measured adaptive response loop** | BIO-OPT-05, LEARN-01–06, UX-OPT-05, UT-OPT-06/07, SEC-OPT-07, LEG-V06-006/007 | **P0 safety/P1 iterative feature.** Baselines, intervention, adherence, confounders, comparable outcome and time; missing/null/worsening paths; versioned reevaluation and abstention; no causal claim from ordinary before/after results. | V06-04 / V06-10; ML-OPT-03–05 integrated: longitudinal reliability, counterfactual assumptions, baseline ablations |
| **V06-14 Functional human and microbial gene evidence** | BIO-OPT-03/04, INT-OPT-02/04, UX-OPT-04/06, UT-OPT-04, SEC-OPT-05/08, LEG-V06-011 | **P0 representation boundaries/P1 curated evidence/P2 modeling.** Separate genotype, assay/taxon, encoded potential, activity, flux, metabolite and human outcome; strain/assay QC, unknowns, permission/licences. No speculative personal effect. | V06-09 / V06-01; ML-OPT-02 integrated: typed graph boundaries and separate intervention evidence |
| **V06-15 Value-of-measurement decision** | INFO-01–04, UX-OPT-06, SEC-OPT-08, LEG-V06-011 | **P1 research UX.** Ask if another lab/assay can change an approved decision after burden, privacy/cost and potential error. Never require or promote optional assays to unlock general advice. | V06-04 / V06-10; ML-OPT-05 integrated: incremental decision-value ablation |
| **V06-16 Ingestion with validated provenance** | INT-OPT-01–06, SEC-OPT-01/04/09, LEG-V06-004/005/009 | **P0 integrity/safety; P1 providers.** HealthKit/Health Connect are native-only; web mode honest. Use existing USDA, lab and health ingestion structures. Canonical values + original source unit/method/time, dedupe, provenance/correction, revocation and commercial licensing. Literature ingestion remains centralized and free-first by default. | V06-02 / V06-04 / V06-09 |
| **V06-17 Scientific trust UX** | UX-OPT-03/04/05/07, UT-OPT-01/03/04/05/07, SEC-OPT-05, LEG-V06-002/010 | **P0 claim clarity/accessibility.** One practical action; precise label for recorded, provider, research, association, validated estimate, simulation, unknown; understandable limits, tests and alternatives. WCAG 2.2 AA and baseline-only journey. Preserve existing Bloom assets and IA. | V06-01 / V06-11 |
| **V06-18 Security, regulatory and evaluation gates** | SEC-OPT-01–10, LEG-V06-001–012, UT-OPT-01–07 | **P0 before relevant release/claims.** Combined longitudinal model and derivatives are sensitive; permission follows outputs and third-party prompts. Intended-use classification per feature/territory; evidence/claims ledger, vulnerable-user gates, rights, data incidents, research ethics and evaluation vs conventional baseline. | V06-05 / V06-08 / V06-10 / cross-cutting |

### 11.2 Architecture decisions / conflict resolutions
1. **Unified plan is a single decision process, not separate silo recommendations.** Everyday presents one primary next action; expanded day view coordinates Eat/Move/Recover; Athlete receives training-day-specific detail. No DNA or wearable requirement. Reuse v0.5 Today/goal/training components rather than fork.
2. **Outcome data outranks a speculative biological pathway.** Strong human intervention evidence and direct observations guide choices. Genotype and microbial genes only alter ranking when incremental, population-applicable human evidence supports the change. Never claim unique optimality or validated improvement without studies.
3. **Learning changes are gated:** reviewed evidence/eligibility + measured outcome quality + consent + safe versioned rollback. A user's uncontrolled improvement is an observation, not a treatment effect.
4. **Measurement source preservation is a hard invariant.** Imported lab/source unit, assay, original value and date never overwritten by display preference; guessed units remain unconfirmed. Do not generate definitive clinical classes until applicable verification.
5. **Integrations are capability-scoped:** user consent, valid data rights, dedupe and source-specific accessibility. Native HealthKit/Health Connect require an actual native client. Commercially restricted datasets/providers remain feature-gated.
6. **One evidence vocabulary across all workspaces**, with semantics in text plus icons, not color or cosmetic confidence meters. Coach access permissions and AI provider scopes require separate authorization and tested least privilege.
7. **Product claims are feature-specific:** wellness education must not be described as autonomous treatment optimization or regulatory-certified advice. Legal/clinical sign-off required for qualifying high-risk clinical decisions and research studies; none of these external release checks is a routine pre-commit approval.
8. **Research completion ≠ product acceptance.** User Testing's protocol is ready for architect intake, but no participants were enrolled, comparative benefit proven, production code certified, or live UX signoff granted.

### 11.3 Implementation-ready decomposition to refine once AI final handoff arrives
- **Slice 0 — contracts and fixtures:** Cross-referenced goal/constraint/action/outcome/evidence contracts, authorization/privacy, missingness and source-unit fixture tests, static prototype examples. Can plan independently without starting v0.6 development.
- **Slice 1 — coordinated baseline:** Evidence-reviewed nutrition+exercise+recovery actions with goals/trade-off explanation, no-assay support, clear alternatives and contraindication handling. No predictive ML dependency.
- **Slice 2 — longitudinal decision and evidence lifecycle:** Measured outcomes, comparable history, adherence, supervised revisions and approved living evidence releases.
- **Slice 3 — value-added mechanisms:** Conditional human genotype/microbial assay interpretation, named pathway provenance, uncertainty and conservative value-of-test reasoning.
- **Slice 4 — ML/rich modeling only if justified:** Use baseline-vs-model holdouts, bias/harms, calibration and efficacy evaluation. Do not imply model success simply from more features.
- **Coach remains its own permissioned V06-05–08 sequence**, not an implicit data recipient of the personal optimizer.

**Codex execution boundary:** No interruption or new v0.5 scope. v0.6 is a living draft; Codex continues v0.5 commits and preview. The dedicated AI optimization handoff has been architect-reconciled with these packages. This closes the **research-submission gap**, not model-science validation, v0.6 implementation readiness or public-release authorization. Visual before/after images only for substantial visible changes; annotate actual differences and retain originals.


## 12. AI / ML optimization handoff — Architect integrated (2026-10-23)

**Source of truth:** [ML Unified Optimization & Personal Learning Research Handoff](../agent-handoffs/Bloom_ML_V06_Unified_Optimization_Research_Handoff_2026-10-23.md), authored by Machine Learning & Biological Intelligence Specialist on 2026-10-23. Shared Library copy: `Bloom_ML_V06_Optimization_Handoff_Shared_2026-10-23.md`. **Status:** received, source-reviewed and architect-consolidated. Neither algorithm benchmark nor live code was independently verified in the specialist submission.

| AI requirement | Consolidation and mandatory acceptance | Existing v0.6 work package |
|---|---|---|
| **ML-OPT-01 P0** | Reproducible constrained multi-objective ranked daily/weekly Eat–Move–Recover action plan; clinically safe exclusions outrank weighted user priorities; explicit conflicts/trade-offs, cost/time/ability constraints, alternative/maintenance/no-change option, reason for each exclusion. Compare transparent lexicographic and Pareto approaches before complex ML. | V06-12, V06-04 |
| **ML-OPT-02 P0** | Versioned human+strain microbial gene/protein/enzyme/reaction/metabolite graph with typed provenance; separate evidence graph for interventions, null/harms/retractions; prohibit upgrading taxonomic abundance to activity or modeled flux to human concentration. Curate 3 end-to-end positive/negative pathway evaluations (resistant starch, tryptophan, bile acids). | V06-14, V06-09, V06-01 |
| **ML-OPT-03 P0** | Comparable dated personal outcomes, repeated baselines, uncertainty, adherence and confounding; evaluate hierarchical/N-of-1 methods conditional on data sufficiency, allow abstention and guideline-first fallback. No universal sample count; no unreviewed autonomous treatment titration. | V06-13, V06-04, V06-10 |
| **ML-OPT-04 P0** | Distinguish evidence-based population action comparisons, statistically validated individual response predictions and causal individual effects. Show assumptions/uncertainty and no-change alternative; suppress personal causal estimates for sparse or confounded data. | V06-12, V06-13, V06-10 |
| **ML-OPT-05 P0** | Predeclared evaluation ladder M0 general guidance → M1 goals/habits/measured labs/diet/training → M2 host genotype → M3 microbe taxonomy → M4 validated measured functional genes → M5 relevant metabolomics/longitudinal inputs. Participant- and cohort-held-out testing, calibration/subgroups/harms/cost/burden; no boosting recommendation rank for inputs without incremental decision benefit. | V06-10, V06-14, V06-15 |
| **ML-OPT-06 P0** | Structured action output binds approved action ID, goals, measured inputs, excluded alternatives, rule/evidence/model versions, contraindications, burden, applicability, abstention and measurement plan. Deterministic authorization/clinical safety before and after constrained LLM explanation; adversarial prompt injection, fabricated biological link, unit, dose and unauthorized cross-user data tests. | V06-01, V06-12, V06-17, V06-18 |
| **LEARN-01–06 P0 joint** | Explicit Measure → Recommend → Implement → Observe → Evaluate → Adjust lifecycle, with baseline, adherence, missingness, null/worse observations, safety escalations and pinned prior plan versions. No causal inference from naive before/after. | V06-13 |
| **INFO-01–04 P1 joint** | Value of testing decides whether extra biology actually changes an approved action; model test limitations, price, uncertainty, privacy and burden; no test upsell by default. | V06-15 |

**Architect priority:** implement reliable guideline-based combined actions, honest explanations, provenance, and ongoing measurements before any learned optimization or molecular simulations. Preserve separate user-facing vs research-only release states. The comparative ML and causal methods are **research proposals**, not a promise of personalized effectiveness. Coordinate safety gates with Biology, Security and Legal; measure comprehension with User Testing. Codex should keep focusing on v0.5 until that scope finishes; v0.6 remains a planning specification.

**Submission checkpoint:** Biology, AI/ML, Integrations, Branding/UX, Security, User Testing and Legal handoffs all located as of 2026-10-23. Final v0.6 cross-specialist testing, clinical evidence decisions, licensing and release gates remain outstanding; no new user permission needed for ordinary future development commits once v0.6 is approved for implementation.


## 13. Minimum useful v0.6 release checklist (Architect, 2026-10-23)

These are the mandatory functional acceptance criteria for a useful first v0.6 release, not additions to v0.5. Research proposals and approved architecture do not imply implemented features.

| ID | Acceptance target |
|---|---|
| V06-MH-01 | Multiple prioritized user goals, health limits, allergies, time/equipment and budget constraints; explicit trade-offs; optional assays never block setup. |
| V06-MH-02 | One coordinated and usable Eat–Move–Recover daily/weekly plan with feasible concrete actions, edits/swaps, reasons and tracking. No conflicting parallel plans. |
| V06-MH-03 | Evidence-reviewed guideline-first plan for users without genetics, microbiome data, wearables, coach or paid service; transparent sources and meaningful abstention. |
| V06-MH-04 | Original biological assay, genetic, microbial and lab provenance and units preserved; no unsupported inference of enzymes, microbial flux, individual causation or clinical benefit. |
| V06-MH-05 | Reliable reusable nutrition, activity and laboratory capture, import reconciliation, dated history and manual fallback; native device links only where actually supported. |
| V06-MH-06 | Baselines, measurable goal outcomes, adherence, missingness and confounders; safe reviewable and reversible plan reassessment without naive causal claims. |
| V06-MH-07 | Clear action-first mobile/desktop and accessible UI, canonical settings, transparent evidence statuses and no mandatory scientific graph exploration. |
| V06-MH-08 | Tested account/data boundaries, scoped sharing, clinical contraindication checks, protected sensitive data, safe errors and abstention, applicable legal/licensing safeguards. |
| V06-MH-09 | Versioned and reviewed research-to-claim-to-rule pipeline with correction/retraction handling, rollback and user-visible meaningful updates; no publication-to-advice autopublish. |
| V06-MH-10 | End-to-end scenario tests from goal to action to outcome reassessment, including missing data, competing goals, unsafe inputs, unit errors and access denial; independent usability review and baseline comparative evaluation. |

**Scope control:** Coach/team workflows, AI copilot, advanced genetic/microbial predictions, molecular simulation and extra connectors are separate phased capabilities with their own safety and validation gates; they cannot be claimed as complete merely because this initial core works. Compare sophisticated AI against a transparent guideline baseline before any outcome superiority claims.

**Status contract:** Codex eventually reports each ID as proposed, built, tested or specialist-reviewed with specific SHA and working-preview evidence. Continue v0.5 independently now. Generate highlighted before/after UI screenshots only for substantive visual differences, not for invisible code changes.


## 14. Adaptive Training Readiness & Workload Guidance — Product Owner approved (2026-10-23)

**Requirement V06-TRAIN-01 — Explainable three-state exercise guidance (P1 feature; P0 safety/claim integrity).** Bloom shall provide daily, context-sensitive training advice that helps a user decide *whether to train, how hard, and when to recover*, complemented by a goal-aligned weekly training schedule. **No numerical readiness score is required or implied.** The three user-facing states are:

1. **Train as planned** — No meaningful, supported reason identified to change the scheduled workout. Does not guarantee readiness or absence of injury.
2. **Consider modifying** — Suggest an explainable reduction in effort, volume or duration, or an appropriate switch in workout modality, based on recent workload, recovery context and user-reported symptoms.
3. **Recovery or assessment advised** — Recommend recovery or professional assessment when appropriate to the observed context; do not diagnose injury, illness or overtraining.

**Signals and appropriate use:** Combine validated and available wearable measures (sleep duration/trends, resting heart rate, HRV trends, activity and completed training) with workload (frequency, volume/intensity, duration × session RPE where available, rest between demanding sessions), recent performance, and optional athlete-reported sleep quality, fatigue, soreness, illness and limitations. Compare within-person baselines and account for device quality, artifacts, travel, changing devices, unusual circumstances and missing data. A lone HRV/sleep score may not dictate a high-stakes workout change. Human genotype and microbiome signals must **not** drive readiness classification without specific prospective evidence.

**Weekly prescription:** In addition to today's state, suggest goal-dependent training frequency, intensity distribution, progressive loading, recovery days and feasible alternatives based on equipment, availability, athlete experience and previous training—not a universal weekly prescription. Explicitly distinguish recommended plan from observed activities and allow review/adjustment without silently rescheduling or overwriting coach-approved/clinician-restricted programs.

**Transparency and uncertainty:** Show *why* the state was offered, which actual signals were used, what is missing, and a practical next action. When data are insufficient, explicitly say that readiness cannot be assessed reliably and fall back to the existing safe, guideline-based training plan with self-assessment advice; **do not automatically label missing data as “Train as planned.”** Avoid invented probabilities of injury, readiness certainty, universal acute:chronic workload thresholds or diagnosis. Do not discourage safe exercise just because a consumer wearable value fluctuates.

**Consent/integration:** Wearable access is opt-in and provenance-aware; source permissions, revocation and account isolation must work end to end. Native Apple Health/HealthKit and Android Health Connect require supported native app capabilities; do not claim web-browser access. The functionality must remain usable with manually recorded workouts and symptoms and with no wearable connected.

**Acceptance tests:**
- Representative recorded scenarios yield distinguishable explanations for all three states, plus an **insufficient-information/unknown** fallback that is *not* falsely presented as a fourth readiness rating.
- Test rest vs planned interval workout, strength progressions, newly intensified training, fatigue without wearable data, sleep/HRV disagreement, bad sensor data, illness/injury symptoms, and conflicting clinician restrictions.
- Test normal training history with no unsupported physiological alarm, incomplete/contradictory source data, unverified device source, and high-risk symptoms triggering suitable abstention or professional assessment.
- Validate across novice strength, endurance, mixed-goal Everyday and Athlete personas; compare to simple schedule+symptom rules before promoting wearable-specific logic. Independent Biology, Security and User Testing reviews required before claiming validated readiness behavior.
- Check mobile accessibility, user understanding of state vs diagnosis, manual input, control over adjustments, historical decision reproducibility and visual evidence only if the implementation makes a substantial visible UI change.

**Crosswalk:** V06-12 (goal-to-action), V06-13 (personal outcomes), V06-16 (wearable provenance), V06-17 (trust UX), V06-18 (safety/validation), V06-MH-02/05/06/08/10; BIO-COACH-404/405/416 and existing Athlete load/recovery features. This is a *functional refinement* of the combined exercise optimizer, not a new independent scoring system or Coach prerequisite.

**Ownership and status:** Architect approved for v0.6 planning; Codex implements later after v0.5 scope, Biology validates exercise science, Integrations confirms source capabilities, Security checks consent and safety, User Testing validates comprehension. **Not implemented or independently validated by this documentation change.**



## 15. Branding asset intake — Athlete three-state guidance (2026-10-23)

**Source:** Branding & UX `Bloom_Athlete_Training_States_Design_Handoff_2026-10-23.md`, shared Library package `Bloom_Athlete_Training_States_Assets_2026-10-23.zip` (three icons and six SVG light/dark illustrative cards). **Design status:** approved for architecture intake only; not validated as deployed functionality. Supersedes no requirement in V06-TRAIN-01.

**MKT-WORKOUT-301–305 accepted as implementation guidance for V06-TRAIN-01:**
- **301 (P0), scientific boundaries:** Three states are decision support, not exercise/medical clearance. Biology-reviewed policies determine states; distinguish ordinary recovery from symptoms requiring professional evaluation; no invented numerical readiness score or injury-risk estimate.
- **302 (P0), provenance:** Optional `Why this guidance?` reveals dated signals actually used, device/source quality, missing/stale observations, policy version and limits; separate coach instructions, approved deterministic rules and AI drafts. If data are insufficient, show an explicit unassessed fallback, *not* `Train as planned`.
- **303 (P1), control:** Train → View workout; Modify → Review adjustments; Recover → Review recovery guidance or assessment information. No silent change to calendar/coach/clinical plan.
- **304 (P0), accessibility:** Use Athlete blue as common workspace styling with restrained green/amber/rose state accents, accompanied by text and icons. One dominant state at 320px, WCAG 2.2 AA and dark-mode checks, and semantic HTML for production headings/text (SVG cards are only design templates).
- **305 (P0), regression/privacy:** Cover normal load, high load, fatigue, conflicting/missing data, symptoms, stale sensors, corrections, clinician warnings and withdrawn coach permissions. Status must not leak private medical data to coach outside scoped derived-data consent.

**Deliverable inventory:** `train-icon.svg`, `modify-icon.svg`, `recover-icon.svg`, `train-light.svg`, `train-dark.svg`, `modify-light.svg`, `modify-dark.svg`, `recover-light.svg`, `recover-dark.svg`. Branding's source archive also carries `DESIGN_HANDOFF.md`. Colours are proposals. Preserve the existing Bloom icon and token families; build a reusable semantic status component rather than dropping a complete SVG card as inaccessible UI text.

**Validation/implementation state:** Received + Architect reviewed; not implemented, rendered, Biology certified, Security approved or UX tested. Assets must be checked into an accessible version-controlled location before Codex implementation; shared Library existence alone is not proof assets are in the Codex checkout. This is post-v0.5 scope and must not pause active v0.5 development.


## 16. V06-TRAIN-02 — Post-workout intensity, load and recovery guidance (2026-10-23)

**Status:** Product Owner requested; Architect approved for v0.6 planning, NOT built or clinically validated. **Priority:** P1 user experience and progressive training capability; P0 safety, uncertainty and data integrity. **Dependency:** V06-TRAIN-01 three-state guidance, existing Athlete sessions, V06-16 wearable provenance, V06-13 personal learning, V06-MH-05/06/08/10. Preserve v0.5 implementation priority.

### Core user value
After a run, ride, swim, resistance workout or other supported session, explain **how demanding it was**, *which signals support that assessment*, and **how to plan the next workout and recovery**. Feed completed-session load into weekly frequency/intensity planning and the established three training guidance states. Do not create a pseudo-clinical universal recovery clock or demand that a user wait a fixed number of hours before exercising.

### Data, calculated concepts and constraints
- **Session inputs:** duration, modality, time stamps/time zone, distance/pace/speed, elevation, power when available, heart rate time series and time in *individually configured/validated* zones, documented threshold estimates, intervals, and session RPE/notes; resistance workouts use sets/reps/external load, proximity-to-failure/RPE when reported, and affected muscle groups. Avoid inventing an unsupported one-size-fits-all running-versus-strength workload equivalence.
- **External load vs internal response:** Keep distance/volume/intensity/power distinct from cardiovascular response (heart-rate pattern, duration in validated zones, perceived effort). Prefer transparent sport-specific summaries and documented methods; HR sensor artifacts, lag during intervals, temperature, medication, illness and other confounders weaken inference. Do not report calories or training stress as measured if estimated.
- **Within-person comparisons:** Compare session demands against the user's own recent comparable workouts and training baseline with a clear window and minimum quality rule. If insufficient history, explain effort from observed metrics/self-report without claiming unusual stress or personal recovery time.
- **Intensity description:** e.g. Easy / Moderate / Hard / Very hard, or a similarly tested verbal scale, accompanied by observed evidence and confidence/quality limitations. Labels are **session-effort descriptions**, not a fourth daily readiness state, a universal score, or an injury-risk probability. Can be adjusted using RPE feedback; imported workout and subjective report may disagree and must remain separately visible.
- **Recovery guidance:** Display *suggested next-session timing/intensity* and rest/recovery considerations from training plan, recent load, subjective recovery and symptoms. Where the reviewed evidence supports only broad ranges or training principles, show qualified language (e.g. 'Consider an easier session tomorrow' or 'Allow recovery before repeating this demanding session') rather than an invented precise '31 hours 20 minutes to full recovery' countdown. A numeric time/range must be sourced, context-specific, reviewed, explicitly estimated and validated; otherwise abstain from it.
- **Goal-specific programming:** Distinguish repeated hard aerobic intervals, easy aerobic days, resistance sessions and muscle-group recovery. A demanding run may justify modifying another hard run without prohibiting an appropriate low-intensity walk or different-muscle-group workout. Never imply that a single HRV/RHR/sleep observation gives definitive clearance or that high effort automatically requires complete inactivity.
- **Safety:** Symptoms such as chest pain, fainting, new neurologic deficit or other concerning exertional symptoms trigger appropriate clinical advice independent of a training load label. No diagnoses, guaranteed readiness, injury-risk percentages, unsupported physiological certainty or unreviewed algorithmic medical restrictions.

### UX information architecture / Branding assignment
Create reusable **Workout Effort & Recovery** components that fit Athlete's existing blue workspace and the approved V06-TRAIN-01 states:
1. **Post-workout summary:** Sport, duration/date, observed workload and verbal **effort category**, alongside key contributing metrics; visually distinguish measured, user-reported and estimated fields. Avoid a giant opaque numeric score.
2. **What made it demanding?** Expandable explanation of HR-zone duration (only with a validated baseline), pace/power/load, session RPE and recent comparison; show missing or stale data.
3. **Recovery/next action card:** Plain-language guidance: recovery considerations, next appropriate training type/intensity, when to reassess and optional exercise alternatives. Do not display a precise recovery countdown unless independently validated.
4. **Weekly training context:** Show how completed intense sessions affect the planned distribution of challenging, easy and recovery days; separate proposed changes from approved workout calendar.
5. **States and provenance:** Explicitly link session effort (what happened) to V06-TRAIN-01 guidance (what to do next), without equating 'Very hard' with 'Recovery or assessment advised'. Provide no-wearable, HR-only, richer-metrics and strength-training examples.
6. **Design deliverables:** component/content specification, Athlete light/dark assets or vector icons when appropriate, mobile 320/375px plus desktop layouts, 200% zoom and keyboard/screen-reader behavior. Use text+icons, not color only; preserve existing brand assets and accessible semantic text. Examples should be marked **illustrative, not actual wearable-derived analysis**.

### Acceptance tests and ownership
- Given a comparable recorded easy run, a hard interval run, a long easy run, a high-volume resistance workout, conflicting HR/RPE, inaccurate optical HR, missing personal zones and no wearable, clearly distinguish observed effort, uncertain inference and next-session suggestion without fabricating recovery times.
- User can correct activity type, RPE, HR zones/baseline and source values where permitted; changes update analyses safely with version/provenance and deduplication. Missing data never silently becomes zero or reassuring evidence.
- Explain when a user can train another modality or muscle group versus repeating a hard session; preserve clinician restrictions and never silently edit a coach-approved plan.
- Benchmark session classification and next-day guidance against transparent baseline workload/sRPE approaches and independent Biology review; assess comprehension in User Testing before stronger claims. Security/Integrations review provider provenance, disclosure and authorization.
- **Role split:** Biology defines defensible workload and recovery heuristics and safety conditions; Integrations validates device data and HR-zone derivation; AI/ML assesses whether learned inference beats simpler baselines; Branding develops the above UX/visual assets; User Testing validates actual decision comprehension; Security reviews data scopes; Architect reconciles, Codex implements after current v0.5.
- **Evidence rule:** No unreviewed wearable-derived *exact* recovery timer. No new generic readiness number. Distinguish suggested training guidance from medical clearance.

**Implementation scope:** Research/UX specification now; functionality, wearable integration, algorithms, clinical validation and actual user sessions are unverified. Major visible UI changes may warrant highlighted before/after screenshots; unchanged views do not.


## 17. Branding concept intake — Post-workout effort/recovery dashboard (2026-10-23)

**Received visual concept:** `Bloom Athlete Training Guidance Dashboard.png` (shared Bloom Library; added 2026-10-23) depicting V06-TRAIN-02. **Review disposition:** Architect accepts its component architecture as the visual direction, conditional on Biology, accessibility and implementation verification. This is an illustrative **design image**, not a live screenshot, an interactive build, proven recovery algorithm, or confirmation of a separate production-ready SVG/component package.

**Visual structure approved as reference:** (1) Workout Effort Summary with observed duration, heart rate and user-entered RPE; verbal Easy/Moderate/Hard/Very hard classification; (2) expandable `What made it demanding?` inputs with available/not-applicable provenance; (3) Recovery & Next Workout with reviewable alternatives; (4) Weekly Training Load, clearly identifying session modality/effort and rest/recovery rather than pretending all load units are interchangeable; (5) Connection to three-state training guidance; (6) reusable effort badges, icons, explanations, next-session cards and Athlete semantic tokens.

**Corrections/constraints before production:** 
- The illustrated hypothetical 45-minute run, HR 158 bpm, RPE 7/10, time in zones, 320 m elevation, and comparative load wording are *placeholder values*; real labels and classifications must derive from traceable source inputs, user-specific zone validation, signal-quality checks and Biology-approved rules.
- `HRV stable` or `sleep adequate` may be displayed as dated observations, but cannot alone guarantee recovery or resolve clinical warnings. Preserve an explicit insufficient-data state.
- The dashboard's graphical `relative training load` values are illustrative only; Codex must define a modality-sensitive, validated metric/legend or prefer session counts, duration, RPE and separate sport views. Never fabricate unified stress units.
- Hard/Very hard workout labels do **not** automatically map to `Recovery or assessment advised`. The training guidance state is a separate forward-looking judgment with user-reported context.
- The composition is desktop-wide; produce responsive mobile, dark-mode, 200% zoom, keyboard/screen-reader specifications and semantic HTML rather than a flattened image/card text.
- The concept's colours and example recommendations remain conditional on contrast verification, science review and safety/error-case tests.

**Asset tracking:** Source visual `/Bloom gut health/Bloom Athlete Training Guidance Dashboard.png` is accessible through the shared project Library. No separately dated V06-TRAIN-02-specific editable SVG/React asset archive or accompanying final written handoff was discoverable at this intake; the previously reviewed `Bloom_Athlete_Training_States_Assets_2026-10-23.zip` belongs to **V06-TRAIN-01**, not proof of a new V06-TRAIN-02 source asset package. Branding should supply/check in the editable original components and current design tokens for Codex whenever ready, ideally `docs/agent-handoffs/` and a stable asset folder. Do not confuse Library files with already committed GitHub assets.

**Status:** visual reference received and architect-reviewed; developer implementation and corresponding source asset publication not verified. This does not add v0.6 work to active v0.5.
