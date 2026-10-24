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

**Asset tracking update:** The subsequently delivered, editable V06-TRAIN-02 source package has been located and inspected: `Bloom_V06_TRAIN_02_Editable_Component_Package_2026-10-23.zip` (shared Library `/Bloom gut health/Agent Handoffs/`), with accompanying `Bloom_V06_TRAIN_02_Design_Handoff_2026-10-23.md`. See Section 18 for exact inventory and integration checks. The source package is in Library, not yet verified in the GitHub checkout.

**Status:** visual reference received and architect-reviewed; developer implementation and corresponding source asset publication not verified. This does not add v0.6 work to active v0.5.


## 18. Editable training-analysis assets intake — 2026-10-23

**Received and inspected:** `Bloom_V06_TRAIN_02_Editable_Component_Package_2026-10-23.zip`, dated Branding/UX handoff `Bloom_V06_TRAIN_02_Design_Handoff_2026-10-23.md`, shared Library folder `/Bloom gut health/Agent Handoffs/`. Archive was verified to contain 15 entries: `DESIGN_HANDOFF.md`; 11 editable, currentColor SVG icons (`moon`, `edit`, `calendar`, `run`, `check`, `weight`, `chevron`, `heart`, `effort`, `rest`, `info`); `components/TrainingGuidance.tsx`; `components/training-guidance.css`; and `examples/Usage.example.tsx`. These are **actual editable source components**, not merely a dashboard screenshot.

**Architect design disposition: ACCEPT for V06-TRAIN-02 implementation handoff, with the following safeguards.** This supersedes Section 17's older finding that no editable package could be found. It does not signify Codex has implemented it or that source files are already committed into GitHub.

| Branding ID | Priority | Source component | Acceptance and required integration |
|---|---|---|---|
| **MKT-TRAIN-401** | P0 scientific clarity | `WorkoutEffortSummary` | Easy/Moderate/Hard/Very hard describes completed workout effort only; do not infer from raw average HR or unsupported RPE without reviewed policy. Missing data -> unclassified. |
| **MKT-TRAIN-402** | P0 explainability | `DemandingFactors` | Show only actually used contributing observations; mark missing, stale or not-used inputs; show source and date. No fabricated sleep, zone or training-history signals. |
| **MKT-TRAIN-403** | P0 safety | `RecoveryNextWorkout` | Distinguish recovery advice from exertion rating; conditional reviewed next-session alternatives, no exact countdown/diagnosis, appropriate symptom escalation. |
| **MKT-TRAIN-404** | P1 | `WeeklyTrainingLoad` | Use compatible and meaningful sport-specific workload units/scale and source provenance; no universal fake load or rest-day imputation. Accessible text equivalent and responsive chart. |
| **MKT-TRAIN-405** | P0 | `TrainingGuidanceLink` | Link to separately determined train/modify/recovery/insufficient state; completed effort must never directly set readiness, clinical clearance or Coach sharing. |
| **MKT-TRAIN-406** | P0 UI/accessibility | shared stylesheet and 11 icons | Reuse existing Bloom Athlete tokens, verify light/dark WCAG 2.2 AA, 320px/375px, 200% zoom, keyboard, screen-reader semantics; don't replace semantic content with decorative SVG cards. |

**Source code integration precautions identified by Architect inspection:**
- Components are **presentational only**; they accept typed props and contain no classification algorithm, wearable connection, clinical eligibility evaluation or persistence. Codex must supply independently reviewed domain services, source-validated metrics and permission checks.
- The example `158 bpm`, `7/10` RPE and `Hard` status are synthetic. Use them only in explicitly labelled fixtures and tests, never as evidence of measured readiness.
- The `WeeklyTrainingLoad` component currently renders bars with CSS percentages by clamping `load` to 2–100 without a defined unit or normalization policy, and renders a tiny placeholder bar for missing load. **Do not ship arbitrary chart heights as real training load**: revise the component to require explicitly comparable normalized values or use trustworthy actual duration/effort categories instead; label unavailable data as unknown and provide an accessible equivalent.
- The `DemandingFactors` static explanation says inputs were used in an “illustrative explanation”; adapt production copy to actual provenance and runtime review state. Validate derived observations rather than trusting UI props from unreviewed data.

**Proposed staging:** Keep original archive in shared Library and version it in the future Codex implementation checkout under a stable source-assets location once the development phase begins; preserve the original design handoff and avoid forking independent visual systems. Codex owns code/assets import, adaptations and tests after v0.5. No user authorization pause needed for standard commits. No requirement for before/after screenshots until the feature produces substantial visible UI changes; highlight those actual changes if captured.

**Implementation status:** design source received and content reviewed, **not implemented or validated**. Security, Biology, Integrations and User Testing review remains needed for deployed functionality.


## 19. Science translation and frontier AI intake — Architect review (2026-10-23)

**Source handoffs reviewed:** `Bloom_V06_Lab_to_Product_Research_Handoff_2026-10-23.md` (Biology: LAB-TRANS-01–08); `Bloom_ML_Frontier_Biological_AI_Research_2026-10-23.md` (AI: ML-FRONTIER-01–06); and `Bloom_ML_Free_Biological_AI_Implementation_Plan_2026-10-23.md` (AI: FREE-BIO-01–07). All three are research/architecture proposals, **not implementations, published scientific validation or regulatory approval**. These extend, rather than supersede, prior BIO-OPT, ML-OPT, V06-01–18 and governance requirements.

### Acceptance, deduplication and binding priority

| New IDs | Priority *within affected feature* | Architect decision / acceptance | Existing package and execution phase |
|---|---|---|---|
| **LAB-TRANS-01**, **ML-FRONTIER-01**, **FREE-BIO-06** | **P0 trust gate** | Every actionable claim has a population-specific, versioned evidence docket (PICO, effect/uncertainty, null and harms, reviewer, rights). Hard boundary between molecular potential/association/model output and supported human intervention advice. | V06-01 / V06-14 / V06-18; **foundation** for planner |
| **LAB-TRANS-02/03**, **ML-FRONTIER-04**, **FREE-BIO-07** | **P0 before enhanced predictions or efficacy claims** | Independent participant/site/time holdouts, assay QC, calibration, subgroup harms, predeclared comparator and **clinical decision utility**; compare guideline-only baseline against gradual phenotype, behavior, genetics, taxa, functional genes and combined inputs. Failed replication does not promote model. | V06-10 / V06-13; evaluation design early, **model activation late** |
| **LAB-TRANS-04/05** | **P0 before regulated or revised clinical advice** | Feature-specific intended-use assessment; deterministic safety eligibility; expert-approved evidence releases; rollback/canary and monitored correction/retraction handling. Papers and LLM outputs cannot directly change live care advice. | V06-02/03 / V06-18; release governance |
| **LAB-TRANS-06/07/08** | **P1** | Safety and outcome monitoring, evidence of incremental testing value, named curators/protocol/COI and licence ledgers; university/clinic partnerships where justified. Controlled research requires appropriate ethics determination. | V06-10 / V06-15 / V06-18; planned validation |
| **FREE-BIO-01**, **ML-FRONTIER-05** | **P0 security/licensing gate** | Source-, release-, model-weight- and dependency-specific commercial-rights/attribution manifest; consent and cost caps. Never ship unapproved datasets, model weights or private biological uploads to external providers. | V06-09 / V06-16/18; gate before particular imports/experiments |
| **FREE-BIO-02/03**, **ML-FRONTIER-06** | **P1 research foundation** | Small canonical identifier/annotation graph in existing PostgreSQL where feasible; auditable source snapshots; benchmark oat beta-glucan/LDL, resistant starch, tryptophan and bile acid examples; curated gut strain annotation versus non-AI orthology baselines. Wrong-strain, stereochemistry and broken-provenance tests. | V06-09; **after useful core** unless small shared ontology necessary for claims |
| **FREE-BIO-04/05**, **ML-FRONTIER-02** | **P2 experimental research** | Optional commercially permitted protein embedding / Evo 2 / suitable sequence model study **only** after rights/hardware/accuracy checks against simple sequence/orthology methods on independent labelled enzymes. No mandatory live paid/GPU API or from-scratch foundation model. No person-specific action without separate human evidence. | V06-09 / V06-10; research lane |
| **ML-FRONTIER-03** | **P2 experimental research** | AGORA2/MICOM scenario simulations with explicit microbial strain/assay coverage, substrate availability, solver assumptions, sensitivity analysis and external metabolomic benchmarks. Flux is **not** measured concentration or demonstrated human benefit. | V06-09; research lane |

**Explicit scientific process:** Adopt `Discover → Replicate → Predict → Intervene → Validate → Review → Controlled Release → Monitor` as a scientific *claim lifecycle*; distinguish mechanistic plausibility, retrospective prediction, external validation, observed decision utility, prospective benefits and applicable legal clearance. A research result never advances automatically into a user recommendation. A reported safety signal/retraction can trigger expedited restriction under reviewed procedures.

**Free-first engineering preference:** Existing relational database and versioned claims, scoped UniProt/Rhea/ChEBI/Reactome/NCBI/GTDB/InterPro or other licensed source snapshots, lightweight offline ETL, CPU-first canonical sequence annotation and immutable dataset manifests. Larger models, compute-heavy graphs and wet-lab collaboration are contingent on evaluation, feasible funding and confirmed rights—not prerequisites for the v0.6 everyday planner or training guidance.

**Priority conflict resolution:** The specialist **P0** designation for model reproducibility and regulatory boundaries is a *must-pass gate before relying on such predictions/claims*, **not** an instruction to build protein foundation models, a simulation engine or prospective trials before an evidence-based Eat–Move–Recover experience. Retain the ordering in `DEVELOPER_EXECUTION_ORDER.md`: v0.5 completion → data/safety/evidence contract → useful plan → workout guidance → reliable feedback → applied biological actionability → full reviewed evidence pipeline → Coach → advanced models. Scientific clinical/regulated claim gates apply to each activated feature and can hold only that feature, never unrelated development.

**Research status:** Received → Architect reviewed and prioritized; implementation, independent benchmarks, trial outcomes, cost confirmation, licence authorization and scientific/clinical sign-off still pending. Codex remains sole application developer.


## 20. Participant-Controlled Research Network — future-ready collection, no research launch (2026-10-23)

**Binding Product Owner decision:** Bloom will **NOT launch with a research network, studies, participant recruitment, research consent solicitation, investigator access or external research connections**. The near-term requirement is **research-useful, privacy-respecting personal data by design**, captured for the product's own useful goals. Do not secretly repurpose existing consent or service data for research. Future research is a separately scoped opt-in product phase requiring fresh consent and applicable approvals. No research dashboard or recruitment entry is part of the first functional release.

**Source review:** Biology `Bloom_V06_Research_Network_Handoff_2026-10-23.md` (BIO-RNET-501–510); Legal `Bloom_Legal_Review_Participant_Controlled_Research_Network_2026-10-23.md` (LEG-RNET-601–610); User Testing `Bloom_User_Testing_Participant_Controlled_Research_Network_Review_2026-10-23.md` (UT-RNET-701–710). Biology proposes an eventual opt-in network, Legal conditionally supports architecture but says NO GO for live research, and User Testing approves only architectural/synthetic prototypes. No production/test/research ethics sign-off established. Distinct network-specific Security, ML, Integrations and Branding reviews were not located at intake; older general policies still apply, but do not constitute network sign-off.

### 20.1 Prioritize data utility now, not speculative research infrastructure

| Requirement | Phase/priority | Product-ready acceptance now | Deferred research-only functionality |
|---|---|---|---|
| **RNET-DATA-01** (BIO-RNET-501, UT-RNET-707) | **Core data foundation P0** | Preserve original value/unit, timestamp/time zone, source/device/lab, assay specimen/method and relevant QC, revision history, identity/account scope, provenance and transformation versions where legitimately obtained. Unknown ≠ zero; imported vs self-reported vs estimated clearly separated. | Formal longitudinal research extracts and study QC dashboard |
| **RNET-DATA-02** (BIO-RNET-502, UT-RNET-705) | **Core learning-loop P1; safety P0** | Track baseline, goal, planned intervention, start/stop, dose when supported, adherence, missed/changed sessions, concurrent diet/training/medication/context changes *when relevant and voluntarily provided*, dated repeat outcomes and missingness. Capture only what improves user tracking/coaching/advice; never mandate research questionnaires. | Comparator assignment, protocol deviations, prespecified study outcomes and controlled trial monitoring |
| **RNET-DATA-03** (BIO-RNET-504) | **Architecture compatibility P1** | Stable canonical identifiers, units, event IDs, versioned schema, correction lineage and provenance dictionary. Establish **export mapping readiness** to FHIR/LOINC/UCUM/SNOMED/OMOP and appropriate genomic/metagenomic formats when applicable; do not force a research warehouse or claim conformance before tested. | Full OMOP warehouse/clinical interoperability certification and investigator export services |
| **RNET-DATA-04** (BIO-RNET-503, LEG-RNET-602/603, UT-RNET-701/702/703/708) | **Privacy boundary P0; research implementation deferred** | Distinguish consent/purpose semantics in architecture so ordinary account operation never implies research sharing/training rights. No consent checkbox or research recruitment UI at launch. Plan data deletion, audit, retention and future independent grants without storing fictitious opt-in. | Versioned study/broad consents, research participation dashboard, withdrawal and derived/export copies lifecycle |
| **RNET-DATA-05** (BIO-RNET-507/509, LEG-RNET-608) | **Evidence guardrail P0** | Individual product observations never automatically become causal evidence or publish clinical rules. Keep reviewed research evidence and personal events separately provenance-bearing; only approved scientific releases can change advice. | Cohort studies, observational causal inference, prospectively evaluated research-to-product claims |
| **RNET-DATA-06** (BIO-RNET-505/506/508/510, LEG-RNET-601/604–607/609/610, UT-RNET-704/706/709/710) | **Deferred P2 network with independent P0 activation gates** | Document future separation of participants, protocols, research datasets, researcher purposes, consent grants and governed exports without building those workflows now. | Researcher workbench, recruitment, controlled cohort analyses, intervention/randomization, result return, recontact, commercial use, institutional operations and governance |

### 20.2 Data design principles for future reuse
- Store **immutable-or-versioned source observations** plus correction events, not destructive rewrites; keep service records logically separate from research copies and feature-derived assessments. Avoid exposing precise GPS/genetic material to hypothetical network operators.
- **Observation context matters:** heart-rate firmware and zones, workout type/intensity/sets or session RPE, food portion/recipe and preparation, lab analyte/assay/reference context, genetics assembly/strand/platform quality, microbiome specimen/assay/pipeline and source provenance *only if actually available*. Do not invent missing detail.
- Track interventions as explicit **user goals, planned and completed actions, durations and adherence**, with relevant co-interventions/confounders and longitudinal endpoint comparability. Log corrections and time-zone changes. Avoid interpreting an ordinary meal log as experimentally confirmed administered dose.
- Apply data minimization and fair burden: useful everyday product fields first; research-specific collection later only under approved study protocols and permission. Raw DNA and high-resolution sensitive streams should not automatically be retained merely for possible future research.
- Future research should reference approved, auditable **snapshots** from permitted data categories; it must not secretly inherit a user's personal-product processing permissions. Revoking an eventual future grant must stop new use under the applicable policy, with truthful limits regarding previous exports and publication.
- Avoid claims such as “fully anonymous genome,” automatic enrollment, guaranteed deletion of already published aggregates or scientific validation inferred from data volume. Research eligibility and actual external collection require qualified study leadership, applicable ethics determination, legal contracts and security testing.

### 20.3 Explicitly not in launch scope
No research portal or invitations; no participant/study onboarding; no university or commercial data feeds; no sponsor/employer/coach research entitlement; no user-data transfer to literature APIs; no cohort warehouse with broad export; no uncontrolled model-training reuse; no randomized intervention assignments; no individual research finding return. Future research support must be independently approved. No research-use permission should be inferred from ordinary personal nutrition, Athlete or Coach use.

### 20.4 Review gates and scope
**Now:** incorporate RNET-DATA-01 through -05 through *existing* v0.6 goal/observation/consent/evidence structures; test provenance, missingness, account isolation and controlled export **internally with synthetic data**. Data collection must remain justified by personal user benefit and privacy safeguards, not blanket speculative research needs.
**Later:** address RNET-DATA-06 with separate network-specific Security, Integrations, ML, Branding and independent user testing, then the extensive Legal and Biology prerequisites for each enabled study function.
**Implementation status:** Architect reviewed and classified; no research network built/authorized. Codex continues v0.5 first.


## 21. AI-ready and research-ready data foundation acceptance contract (2026-10-23)

**Architect determination:** Existing RNET-DATA-01–06 are directionally correct but **insufficient to guarantee reusable AI/research data** until concrete contracts and validation tests exist. This amendment fills the gaps without launching any research network. Collection must improve a current user feature or be independently justified and consented; do not stockpile genomic, GPS or granular sensor streams for hypothetical future studies. Service processing, product personalization, optional model training/evaluation, and third-party research are **different authorized purposes**, never one permission.

| ID | Priority | Reusable contract/acceptance | Consumer/dependency |
|---|---|---|---|
| **DATA-AI-01** | **P0 foundation** | Typed, versioned schemas for Person/account, Goal, Constraint, Observation, Assay, Meal/Food/Recipe, Activity/TrainingSession, Plan/Intervention, Adherence, Outcome, Source, ConsentPurpose, EvidenceVersion and derived Recommendation. Stable event IDs and explicit relationships support goal→planned action→actual exposure→observed result, including many simultaneous actions and sources. Add schema migrations/backward compatibility and machine-readable dictionary. | Optimizer, Athlete, longitudinal learning, future research |
| **DATA-AI-02** | **P0 integrity** | For original events retain observation time and capture/ingest time, local timezone, original value/unit and canonical unit, source/device/vendor/assay/firmware/pipeline as available, type of measure, user-reported versus sensor versus clinically verified status, precision/QC, corrections and deletion/tombstone lineage. Absence, not recorded, below-detection, device failure, declined and true zero are distinct. | Labs, food, wearable, human/microbial omics, AI input |
| **DATA-AI-03** | **P0 privacy** | Per-purpose permissions and policy decisions extend to derived features, aggregates, caches, training/evaluation exports, model provider requests and Coach scopes. Default: personal service use only under the product's valid basis; research sharing/training/recruitment entirely **off and unavailable** at launch. Revoke future use and purge/invalidate eligible derived stores, caches or exports according to documented lifecycle; log non-recallable exceptions honestly. | Security, Legal, future research |
| **DATA-AI-04** | **P0 correctness** | Reconcile deduplicated imports by provider record identity and time, prefer no silent overwrites; represent error corrections as new versions with as-of and effective times; changes recompute derived features safely with source/version links. Prevent cross-user feature joins and stale-derived-value propagation. | Integrations, analytics and recommendations |
| **DATA-AI-05** | **P0 before adaptive AI** | Maintain reproducible features: feature name/definition, source query/code version, observation cutoff, unit, aggregation window, missingness policy, assay/device quality, consent snapshot, evidence version, computation time and derivation lineage. Training-serving transformations must agree; prevent future-outcome data leaking into predictions. A dedicated paid feature-store product is not required: PostgreSQL tables/views + versioned jobs are acceptable initially. | Workout load, adaptive response, ML, evaluation |
| **DATA-AI-06** | **P0 evaluation gate** | Reproducible privacy-authorized **synthetic and, only when permitted, real** dataset snapshots; data dictionary, source/consent/feature version, deidentified/pseudonymous handling with re-identification risk assessment, cohort inclusion/exclusion, participant/time/site splits, outcome ascertainment, temporal leakage and overlap checks, demographic fairness and missingness coverage. No assumption that historical product records automatically become authorized research/model-training data. | AI benchmark and future studies |
| **DATA-AI-07** | **P1 completeness** | Display coverage and quality per modality (food portions, workout RPE, validated HR zones, original lab units, genotype genome build/strand/QC, microbiome assay/strain/assembly/pipeline). If an unavailable field matters to a recommendation, ask once when appropriate or abstain; do not force specialized science fields on everyday users. | Product quality, science and UX |
| **DATA-AI-08** | **P1 interoperability** | Establish versioned controlled vocabulary/identifier and export adapters for appropriate standards: UCUM for units; LOINC for lab concepts; FHIR resources where relevant; OMOP as a **future mapping**, not a second service database; stable genotype reference build and microbiome taxonomy/database metadata when available. Test round-trip semantics, unmapped fields and version drift. | Future network interoperability |
| **DATA-AI-09** | **P0 AI transparency** | Every live recommendation records which user data categories and *actual selected signals* were used, excluded, unavailable, transformed or inferred, with rule/model version, approved evidence/claim IDs, policy checks and time. Never infer “complete readiness” from missing wearable data, or infer biological activity from taxonomy. | Explanations, safety audits, corrections |
| **DATA-AI-10** | **P1 operational feasibility** | Document minimal collection, retention/deletion schedules, storage cost, long-term schema support, data access/request-export tests and restoration/backup integrity. Separate volatile raw device streams from durable clinically relevant summarized features where defensible; collect no new sensitive fields solely to populate a future research database. | Cost, privacy, maintainability |

### Definition-of-done tests
1. **Traceability:** From a workout or meal to original source/version, derived feature, recommended action, user change and subsequent measurement; replay decision against historical “as-of” data.
2. **Cross-source correctness:** Same session from two devices dedupes without erasing original provenance; changed device or invalid heart-rate stream affects quality/missingness rather than fabricating normal readiness.
3. **Clinical integrity:** A lab imported with unknown units is not clinically classified until appropriate verification; unit display changes do not rewrite source; genomic strand/build ambiguity abstains; 16S organism evidence never becomes measured enzyme function.
4. **Permissions:** A user with no research/model-training grant still receives personalized service; no silent transfer into future datasets, Coach, external model training or research APIs; revoke scope prevents future derivative extraction.
5. **Temporal ML:** Feature calculations use only data available at prediction cutoff; participant-held-out and site/time splits avoid leakage; changes to a past observation cause controlled recalculation and audit without altering immutable experiment/release snapshots.
6. **Useful missingness:** No wearable, genotype or microbiome record still yields valid baseline recommendations and explicitly marks unknown fields; zero and no-measurement scenarios differ.
7. **Interoperability:** Can export a synthetic longitudinal profile with goals, intervention, provenance, lab/workout outcomes, corrected readings and missingness into versioned intermediate records, then reconstruct without meaningful loss; unmapped standards reported rather than silently filled.

**Implementation ordering:** DATA-AI-01–04, 09 are foundations before the integrated planner; DATA-AI-05 before adaptive recommendations; DATA-AI-06 before learned-model training/evaluation; DATA-AI-07/08 incrementally as corresponding imports/features exist; DATA-AI-10 is operational cross-cutting. Reuse existing v0.5 persistence and APIs; no second source-of-truth database or wholesale rewrite for a hypothetical research network. Codex only builds when the workstream is active. Source standards, research/ethics approvals, field availability and clinical suitability require verification by Integrations, Biology, AI, Security and Legal. **Specification accepted; repository runtime/data migration verification outstanding.**


## 22. Architecture modularity and isolation — Integration Agent recommendation (2026-10-23)

**Decision: ACCEPT as v0.6 foundation P0 architecture/verification requirement, not a mandate to rewrite working v0.5 code.** Source is the Integration Agent's owner-shared review: existing useful separation, but unverified interchangeability and isolation. No actual dependency graph or measured refactor inventory was delivered with this recommendation; Codex must produce them from the current checkout.

**MOD-ARCH-01 — Actual-code architecture audit (P0 before major v0.6 feature expansion).** Generate a dependency diagram **from repository imports/references/build manifests**, not an idealized drawing. Identify modules and direction of dependencies for food/catalogue/providers, nutrition and recommendations, Athlete/training, wearables, labs, genetics/microbiome, research evidence, permissions, user profile, persistence, and UI. Report cycles, forbidden cross-domain imports, oversized shared utilities and coupling to vendor DTOs. Record exact tool/command, baseline commit, diagram and machine-readable violation inventory. Account for dynamic imports/configuration and runtime call paths the static analyzer cannot see; mark omissions.

**MOD-ARCH-02 — Replaceable adapters and stable domain contracts (P0).** Source-specific connectors (USDA branded/generic food, optional Open Food Facts, HealthKit, Health Connect, clinical labs, research publications) map provider data to typed, versioned domain contracts at boundaries. No external DTO leakage into unrelated engines. Replacing a USDA adapter must require **no code edits to exercise, lab or research engines**; consumer-facing food schema changes must be explicit/versioned. Keep consent, clinical eligibility, and source-provenance checks in dedicated domain-owned services, with deny-by-default provider-specific activation.

**MOD-ARCH-03 — Enforced dependency direction (P0).** Document domain owners and permitted import edges, use automated checks for module boundaries/cycles in CI, isolate infrastructure behind interfaces where it materially helps testing, and prevent new cross-domain coupling. Shared utilities may contain stable primitives, not a de facto god module or circular dependencies. Avoid abstracting every function or extracting microservices purely for modularity; prefer incremental modular-monolith improvements with existing database and deploy topology.

**MOD-ARCH-04 — Demonstrable swap and fault isolation (P0 acceptance).** Implement contract tests with at least two food data adapters/fixtures, including source disabled/unavailable and manual entry; swap a provider with no unrelated code modifications. Run isolated unit/integration tests for food, workouts, labs and evidence. Simulate provider timeouts/invalid data and show that unrelated domains still function, privacy barriers hold, and no silent fabricated data is introduced. Capture import-boundary and contract regression failures in CI.

**MOD-ARCH-05 — Incremental coupling-remediation plan (P1 after audit; P0 for blockers).** Rank actual violations by risk to upcoming v0.6 capabilities, privacy, correctness and change impact. Give each finding path(s), dependency/owner, business consequence, smallest safe refactor, tests and before/after diagram. Repair critical dependency cycles and cross-domain P0 blockers ahead of affected features; postpone non-blocking aesthetic refactors. Report progress with commit SHAs and passing regression tests.

**Priority and ownership:** First v0.6 step after successful v0.5 completion is an **audit + bounded contracts/boundaries implementation** alongside DATA-AI-01–04/09 and consent/evidence foundations. Do not delay user-value milestones for broad rearchitecture beyond identified blockers. Codex owns actual-code audit, diagrams, modifications, CI and deployment; Integration Agent reviews adapter boundaries; Security reviews isolation; Architect reconciles; User Testing verifies behavior. **Status: specified, not yet audited or implemented.**


## 23. Safe evolution engineering contract — blast-radius control (2026-10-23)

**Architect assessment:** MOD-ARCH-01–05 establish module isolation but do not independently prevent schema breakage, cross-version behavior regressions, invisible production failures, or unsafe rollout. Add the following verifiable nonfunctional requirements, proportional to the application's size. Do not demand microservices or rewrite working v0.5 systems.

| ID | Priority | Acceptance |
|---|---|---|
| **ENG-EVOL-01** | P0 | **Versioned provider/domain/API contracts:** typed schemas, validation at trust boundaries, backward compatibility policy, unknown-field handling and consumer-driven contract tests. Provider and model swaps change only their adapters and legitimate contract-version migrations; unrelated engines require no edits. |
| **ENG-EVOL-02** | P0 | **Regression gates:** CI runs domain unit tests, provider mock/contract tests, cross-domain smoke tests, permission/isolation tests, critical end-to-end journeys (food log→totals→recommendation; workout→load→next-day guidance; labs→interpreted trend), and static boundary/cycle checks. Fast tests run per PR, slower suites before enabling sensitive capabilities. |
| **ENG-EVOL-03** | P0 | **Safe schema evolution:** additive/expand→migrate/backfill→contract pattern, explicit compatibility window, idempotent and tested migrations, restore/rollback plan, backup verification, protected source provenance and immutable historical decision/version data. Destructive steps require separate review and restore rehearsal. |
| **ENG-EVOL-04** | P0 | **Feature isolation:** provider, AI model and high-impact rule changes behind scoped flags/kill switches with testable off/default state; staged rollout for material user-impact changes; revert/disable without taking unrelated features offline. Sensitive features stay off until relevant science/privacy gates pass. |
| **ENG-EVOL-05** | P0 | **Operational observability:** structured privacy-minimized correlation IDs, per-module latency/error/import-quality measures, connector health and freshness, AI abstention/fallback counts, evidence/model versions and actionable alerts. No raw personal genomic, lab or health values in logs. Test detection/recovery of a disabled or failing data provider. |
| **ENG-EVOL-06** | P0 | **Failure isolation and recovery:** deadlines/retry budgets/circuit breaks where needed, idempotent asynchronous ingestion, dead-letter/manual retry capability when justified, backpressure and graceful no-provider fallbacks. Verify backup restoration and release rollback rather than assuming an undo commit reverses data changes. |
| **ENG-EVOL-07** | P1 | **Decision documentation and ownership:** concise architecture decision records for boundary-changing choices, domain ownership/approved dependencies, code-change impact checklist and API/schema deprecation schedule. Codex maintains code-derived diagrams and coupling violations at meaningful checkpoints. |
| **ENG-EVOL-08** | P1 | **Performance/cost envelopes:** benchmark common interactions and provider outage degradation, resource and data-storage ceilings, bounded AI context/inference costs, cache invalidation and load tests proportional to scale. Alerts before runaway usage, not an unbounded infrastructure build. |
| **ENG-EVOL-09** | P1 | **Dependency/supply-chain hygiene:** pinned/reproducible packages, vulnerability and licence checks, secret-scanning, dependency update tests, review of provider API terms/versions and reliable build/artifact provenance. |
| **ENG-EVOL-10** | P0 change gate | **Evidence of controlled change:** every materially risky slice records affected modules, relevant tests, security/science approvals if applicable, flag/rollback procedure, real SHA, preview behavior and outstanding violations. Do not claim zero regressions or complete isolation without exercising representative fault and swap fixtures. |

**Independent acceptance demonstration:** (a) replace USDA food adapter with fixture without modifying workout/lab/evidence code; (b) publish a backward-compatible new observation field while replaying historical recommendations; (c) corrupt/disable a provider and show clear fallback plus alert; (d) roll back a newly introduced recommendation rule without losing current user observations; (e) revoke data permission and verify derived-feature use stops; (f) rehearse restore/rollback of an additive migration. Run architecture, science and UX regression checks on meaningful release candidates.

**Implementation sequence:** First v0.6 audit identifies existing capabilities and high-risk gaps; add only missing P0 gates before their first consuming features. Integrate them with existing testing/deployment tooling. Security reviews secret/logging/permission controls; Integrations reviews adapter resilience; Biology reviews clinical rule rollback; Codex owns all implementation. Not implemented by this document.


## 24. Photo-assisted meal logging — consolidated specialist handoffs (2026-10-23)

**Sources reviewed:** `Bloom_ML_Photo_Meal_Logging_Handoff_2026-10-23.md` (ML-PHOTO-01–08); `Bloom_Integration_Food_Photo_Review_Handoff_2026-10-23.md` (INT-PHOTO-2026-01–02); `Bloom_User_Testing_Photo_Meal_Logging_Review_2026-10-23.md` and `Bloom_User_Testing_Photo_Logging_Consolidated_Review_2026-10-23.md` (UT-PHOTO-601–606); `Bloom_Photo_Logging_Branding_UX_Signoff_2026-10-23.md` (MKT-PHOTO-701–706). All are **conditionally approved for architecture**, not verified as implemented, benchmarked, licensed or released.

**Scope and precedence:** v0.6 **P1 optional food-capture enhancement** after reliable v0.5 food search, manual logging and deterministic totals; this is **not** an interruption to active v0.5 development or prerequisite to the first functional Eat–Move–Recover plan. Security, privacy, source truth and nutrient correctness are **P0 gates before photo feature activation**. Reuse existing canonical meal editor, saved-meal flows, ProductPicker/brand matching, journal persistence, nutrition evaluator, source-version contracts and mobile accessibility. No separate photo meal database, independent AI-derived nutrition calculator or duplicate save path.

| ID | Priority / disposition | Acceptance |
| --- | --- | --- |
| **PHOTO-ARCH-01** | P0 boundary, approve (ML-PHOTO-03/04, INT-PHOTO-01, UT-PHOTO-601, MKT-PHOTO-702) | Photo → structured candidate food/component list → single editable shared meal draft → user confirms food ID, preparation, served/consumed amount and quantity → existing deterministic nutrient computation and idempotent journal save. Switch modality to text, barcode or saved meals mid-draft without duplicates; same confirmed source IDs and portions yield same totals. |
| **PHOTO-ARCH-02** | P1 function, approve with measurement (ML-PHOTO-01/02, UT-PHOTO-603, MKT-PHOTO-703) | Multiple candidate components, rename/add/remove/group, mixed dishes/portion of shared plates, visible-vs-hypothesized status and unknowns. No exact grams from an uncalibrated single RGB image; cooking fats, ingredients, allergens, consumed quantity, micronutrients or metabolomic effects cannot be claimed observed from pixels. No fake confidence percentages. |
| **PHOTO-ARCH-03** | P0 safety gate (ML-PHOTO-04/07, UT-PHOTO-602/605, MKT-PHOTO-701/704/705) | Permission to use camera is separate from external photo-transfer consent; accurate on-device/self-hosted/vendor disclosure and deletion/retention. EXIF/location removal, authenticated size/type limits, safe storage, account isolation, revocation, other-people-in-background, in-image prompt-injection and abuse tests. On refusal/outage/unknown/ambiguous package, preserve permitted draft and offer manual/barcode/label, never invent nutrients or silently substitute a generic food. |
| **PHOTO-ARCH-04** | P0 provider/data contract, P1 portable-adapter implementation (INT-PHOTO-2026-01, ML-PHOTO-06) | Stable versioned `VisionMealCandidate` schema carrying candidates, observed/uncertain evidence and processor/version. Inference provider is replaceable; confirmed canonical record stores food/source IDs, source dataset/version, recipe/preparation, servings, consumed grams or honest unknown, corrections and provenance **independently** of fleeting image suggestions. Provider swaps preserve historical computed records and unrelated modules. |
| **PHOTO-ARCH-05** | P1 capability (ML-PHOTO-05, UT-PHOTO-604/606, MKT-PHOTO-706) | Account-scoped optional recent/repeat-meal suggestions, edit and explicit opt-in where needed; no learning from other users' images or automatic cross-account training. Accessible single-screen correction, 320px/200% zoom, keyboard/VoiceOver and recovery states. |
| **PHOTO-ARCH-06** | P1 measured evaluation; P0 factual claims gate (ML-PHOTO-08, INT-PHOTO-2026-02, UT-PHOTO-604/606) | Compare on-device, private self-hosted and optional consented external models on model/data commercial terms, hardware/operating expense, p50/p95 latency, withheld independently weighed portions and cuisine/light/meal diversity. Evaluate **complete confirmed-and-saved meal** accuracy, median/P90 user effort, macro/energy errors and abandonment against typed, barcode and recent meal baseline; report null/worse subgroups. Pilot targets from Testing (e.g. ≥90% task completion, ≥80% comprehension) are **proposed, not validated release evidence**. |
| **PHOTO-ARCH-07** | P2 research (ML-PHOTO-02/06) | Depth/plate reference, segmentation, volumetric portion or leftover comparison only after separate calibration, benchmark and rights evaluation; never block ordinary photo-assisted review on speculative precision. |

**Packaged-food case:** Photograph of KitKat or Michelina's wrapper must preferentially route to barcode, exact Canadian SKU or package-label reading, with explicit variety/serving confirmation; use typed-search alias normalization where appropriate. Actual external catalogue records may be absent, especially for variants; label/manual/generic flows remain honest and usable. No assumption that a photo of branding conveys numerical nutrients.

**Reusable UX source:** Branding published editable `PHOTO_REVIEW_WIREFRAME.svg`, `PHOTO_FALLBACK_WIREFRAME.svg`, `photo-status-icon.svg` with `Bloom_Photo_Logging_Branding_UX_Signoff_2026-10-23.md`, source-level conditional only. Proposed components: `PhotoCaptureChoice`, `PhotoMealDraft`, `FoodCandidateRow`, `UnseenIngredientsPrompt`, `BrandedPackageFallback`, `PhotoAnalysisState`, `PhotoProvenanceDetails`. Adapt to existing Bloom UI/design tokens rather than duplicate implementation.

**Mandatory acceptance fixtures:** ordinary chicken/rice/vegetables; soup/curry unknown recipe; salad with hidden dressing; shared pizza/leftovers portion; package/barcode KitKat and Michelina's variants; blurry/low-light and provider outage; no camera permission or external photo consent; malicious visible text and sensitive bystander photo; repeated saved meal; source/version change and image-adapter swap. Manual-photo parity and account safety must be tested, and inaccessible or false-confident routes rejected.

**Responsibility/status:** Codex only implements, builds and tests. Biology approves identity/portion/nutrition/allergen language; Security & Legal privacy, provider rights and consent; Integrations adapter/source licensing, throughput/cost; Branding responsive editor, User Testing independent comprehension/task comparison. **Architect intake accepted; all implementation and independent signoffs outstanding.**
