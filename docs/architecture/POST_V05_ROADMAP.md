# Bloom — Post-v0.5 Architecture Roadmap (Draft v0.6 Direction)
**Date:** 2026-10-23 (America/Regina)  
**Owner:** Chief Architect & Integration Lead  
**Status:** Architect-reviewed proposed next-phase roadmap; **not an amendment to active v0.5**, not an implementation instruction to interrupt v0.5, no developer work claimed.  
**Repository:** `knagle-max/BloomGutHealth`, enhancement PR #1 `enhance/bloom-experience`; head verified 2026-10-23: `5b607cfe8316567ff77f66b1ebefed01d8671e7c`.  
**Source handoffs:** `Bloom_Biology_Comprehensive_Research_Handoff_2026-10-23.md` (v1.1, BIO-26-301–318); `Bloom_Integration_Living_Evidence_Free_First_Handoff_2026-10-23.md` (INT-EVID-2026-01–08). Original v0.5 Revision 6 Amendment F remains authoritative for **current** implementation and routine GitHub autonomy.

## 1. Executive architectural decision
Bloom's next phase should evolve from a rich, evidence-linked health/nutrition workspace into a **measured-outcome-first, versioned, explainable personal health optimization system with a living, curated evidence service**. This is a multi-release program, not a rewrite or automatic biomedical simulation. The public-facing recommendation engine must read only approved, version-pinned clinical/nutrition claims and interventions. Literature discovery is a **separate untrusted ingestion and draft-production boundary**, incapable of directly publishing advice.

**Non-negotiable science boundaries:** genotype is not enzyme activity; microbial relative abundance is not functional expression or flux; model flux is not host metabolite concentration; personal temporal associations are not causation; no universal gut-health score, synthetic biological age or predicted life-years gained. Distinguish measured, self-reported, imported, inferred, simulated and unknown. Preserve missingness and original measurement units. Regulated clinical claims/features remain behind Legal/Biology authorization.

**Developer cadence:** Finish active v0.5 independently, continue routine commits/pushes and safely isolated Render preview deployments without per-commit Product Owner approval. Prepare this roadmap as the *next* milestone; no extra pre-completion stop gate. Specialists review in parallel; production release gates remain separate. Large *visibly different UI transformations* require annotated before/after screenshots; backend/low-visibility transformations require reproducible behavior, contract/test evidence and accessible Render preview for Product Owner review.

## 2. Handoff disposition and deduplication matrix
| Canonical post-v0.5 work package | Biology source | Integration source | Existing v0.5 baseline / overlap | Decision |
|---|---|---|---|---|
| ARC-NEXT-01 Outcome / intervention prioritization | BIO-26-301, 304, 305, 308, 312 | — | Today, Progress, Athlete, evidence rules, structured experiments | **P1** extend existing services; deliver actions grounded in baseline measured outcomes, goal constraints, tolerability, adherence |
| ARC-NEXT-02 Reliable clinical and lab measurements | BIO-26-303, 311 | — | BIO-LAB-201–209 (per new source; earlier v0.5 indexed 201–207), ARC-UNIT-001, SEC/LEGAL | **P0 safety continuity**; no competing unit engine; audit full current BIO-LAB ledger before implementation |
| ARC-NEXT-03 Evidence ingestion & source integrity | BIO-26-313, 310 | INT-EVID-01, 02, 03, 06 | existing source registry, claim provenance, LEG-009 licensing | **P0 foundation of v0.6 service**, but not a blocker to v0.5 release; staged read-only ingestion and integrity |
| ARC-NEXT-04 Study review & evidence synthesis | BIO-26-314, 310 | INT-EVID-04, 05 | existing evidence taxonomy and contradiction metadata | **P1 foundation**; structured PICO appraisal, reviewer workflow, negatives and retractions |
| ARC-NEXT-05 Immutable claim publication & rollback | BIO-26-315, 316 | INT-EVID-05, 07 | source registry fingerprints, existing safety gates, LEG-002/015 | **P0 for activation of living evidence**, developer-controlled signed/versioned approved-only releases |
| ARC-NEXT-06 Personalized impact and changed-advice UX | BIO-26-316, 318 | INT-EVID-07 | Today/Progress, provenance cards, experiments, consent | **P1** after approved-claims publishing; safety withdrawal expedited with audited path |
| ARC-NEXT-07 Evaluation & monitoring | BIO-26-309, 317 | INT-EVID-08 | lab comparisons, UT acceptance, biology guard tests | **P0 for new efficacy claims / P1 operational metrics**; calibrated abstention/benefit vs baseline |
| ARC-NEXT-08 Biochemical host–microbe graph | BIO-26-302, 306, 307 | — | existing typed registry, genotype explanations, experimental simulation boundary | **P1 ontology / P2 user-impacting inferences**; curated evidence, no unvalidated flux predictions |
| ARC-NEXT-09 Platform/provider compatibility | BIO-26-305, 312 | evidence source provider roster | INT-2026-101–112 and MKT-INT/UT-INT from v0.5 | **No expansion of device provider scope automatically**; device integration remains platform/access dependent |

All source IDs retained as acceptance traceability: **BIO-26-301–318** and **INT-EVID-2026-01–08**. The source's P0 is a *feature-gated or safety* priority, not an instruction to destabilize v0.5. Avoid duplicating the v0.5 biology registry, evidence cards, lab unit engine, food catalog or account/consent infrastructure.

## 3. Target architecture (logical components)
```
Trusted public literature/provider feeds (PubMed, Europe PMC, Crossref, later ClinicalTrials.gov / licensed PMC)
    → isolated rate-limited ingest workers [NO user personal data]
    → provider snapshots, canonical IDs, version and rights ledger
    → integrity/retraction/deduplication jobs
    → draft-only study extraction and appraisal queue (PICO, design, uncertainty, harms, contradictory results)
    → Biology reviewers + relevant Legal/Security review for material impact
    → Architect scope/requirement reconciliation
    → signed versioned claims/edges/rules release (Developer controls CI and publication)
    → production recommendation service reads APPROVED release only
    → context eligibility, observation quality and contraindication gates
    → Today/Explore/Progress/Athlete evidence displays; changes explained
    → longitudinal outcomes, corrections, adverse event and drift monitoring
    → rollbacks/retractions preserve immutable user history and prior rationale
```
**Isolation invariant:** source feed, external researcher text, paper metadata or draft AI extraction cannot execute prompts/instructions as privileged logic, call mutation tools, reach private per-user storage, update approved recommendation tables, or bypass human review. No live query from literature API is required for a user-requested recommendation; last-good approved release works during outages.

### Minimal canonical data contracts (Developer to select migrations after v0.5)
- `external_sources`: provider, provider_document_id, DOI/PMID/PMCID/NCT links, source type, source publication/update/ingest times, licence and rights URL, raw metadata digest, retraction/correction/version status, source failure state.
- `studies`: normalized identity, study type, preprint/final links, registry/protocol, study family/duplicate fingerprint, population, intervention, comparator, endpoints, harms, declared conflicts and applicability limitations.
- `study_appraisals`: draft versus reviewer-verified, source spans/rights, RoB method, uncertainty, review dates, reviewer identity, contradictory/null findings, version.
- `claims_and_edges`: stable ID, typed biological relationship or intervention claim, claim class (measured/general/inferred/modelled), population/dose/outcome/applicability, supporting and opposing source versions, state (`draft`, `under_review`, `approved`, `restricted`, `deprecated`, `withdrawn`).
- `evidence_releases`: immutable release fingerprint, approved claim/rule versions, reviewer approvals, tests, deployed SHA, rollback target, activation time and affected cohort map.
- `recommendation_snapshots`: existing user entry reference, approved evidence release, rule/model version, eligibility inputs, rationale, source provenance and exact time, preserving earlier explanations after a retraction.
- `change_impacts`: approved-claim diff, impacted rules/cohorts/plans, whether re-evaluation is allowed, user-facing change text, urgency/acknowledgment, audit result.
Use current schema/encryption/account isolation patterns; this is a **logical contract**, not prescriptive table names or permission to retain unlicensed content.

## 4. Delivery phases and acceptance gates
### Phase 0 — Start immediately after v0.5 implementation milestone: Baseline audit and existing architecture reuse
- Verify actual v0.5 completed PR SHA, Render preview, branding/units/lab/evidence/privacy status and existing schema/registry. Update overlap matrix to **implemented / tested / partially complete / not present**.
- Establish current claims/evidence IDs, health input schemas and capabilities; avoid legacy references being misinterpreted as missing bugs.
- Create a **zero-impact design branch/feature flag**, no clinical recommendation mutation yet. No Product Owner per-commit approval for ordinary enhancement-branch work.
- Deliver an evidence capture baseline: before screenshots of Today/Explore/Progress, test set outputs, current registry/plan provenance, graph and data flow baseline.

### Phase 1 — Living evidence discovery (first new functional milestone)
**P0 v0.6 foundation:** central incremental PubMed/Europe PMC discovery, Crossref DOI/metadata integrity and retractions; canonical DOI/PMID/NCT identities, preprint-publication links, deterministic deduplication, per-source rate-limits and fixed daily quotas, retry/backfill/outage handling and diagnostics. **No user data leaves Bloom; no automatic recommendation publishing.**
- Start narrow topical queries: MASLD, lipids, dietary fiber, protein/resistance training, exercise, metabolic health, microbiome. Document query versions and false-negative limitations.
- Default to metadata/abstract rights-aware handling; no restricted full-text or LLM vendor export. No paid source subscriptions or auto-spend.
- Tests: late indexing; duplicate DOI; preprint vs final; correction/retraction; malformed and adversarial metadata; API 429; missing feed; source licence denied; rights-policy assertions.
- Preview: protected **Evidence Review** administrative screen showing discovered papers, ingestion provenance, duplicate clusters, alerts; **not** a consumer health recommendation.

### Phase 2 — Scientific curation, approvals and immutable releases
**P0 before letting living evidence affect advice:** Biology-controlled structured extraction/appraisal of PICO, effects, harms, null results and applicability; draft vs reviewer-confirmed separation; versioned claim/edge diffs; impact analysis; immutable approved-only registry snapshot and rollback. Legal/Security review copyright and high-impact clinical domains.
- No publishing on scheduled ingest, single model opinion, press release, non-actionable preprint or individual microbiome association.
- Regression: known-good claim snapshots do not change on feed refresh; approved version reproducible by release ID; retraction can restrict/withdraw affected claims with audit; rollback restores last good while preserving history.
- UI: clear `research finding`, `under review`, `approved recommendation`, and `withdrawn` terminology; source dates and limitations; controls accessible to reviewers.

### Phase 3 — Practical personalized outcome engine
**P1:** goals → constraints → measured baseline → short ranked actions → adherence/observations → measurable follow-up; include dietary patterns/fiber/lipids, protein/resistance, aerobic/strength/mobility, GI tolerability, metabolic-risk indicators and sleep/recovery.
- Default useful without genetic/microbiome tests. Never automatically reclassify missing or guessed-unit labs as confirmed. Contraindication/abstention matrix takes precedence over recommender ranking.
- Reuse Today actions, Progress dated trends and Athlete fueling rather than second UI. Distinguish planned vs logged meals and workout records; source dedupe from v0.5 foundation.
- Track tradeoffs (e.g., performance vs energy deficit, GI tolerance vs abrupt fiber increases), user corrections, adherence, stopped/negative response, and uncertain outcomes without causality claims.
- After **approved** evidence release, reevaluate only affected and eligible recommendations; show plain-language change rationale and preserve prior snapshots.

### Phase 4 — Advanced host–microbe / genetics graph (research-first)
**P1 ontology / P2 inference:** curate variant → gene product → enzyme/EC/Rhea → reaction → metabolite, microbial strain/gene, compartment, transporter, available substrate, source, negative studies and review date. Ensure edges distinguish experimentally measured from hypothetical/computational.
- Personal microbiome report only states actual assay resolution and limitations; no taxon abundance-as-flux shortcut. Any constraint-based flux model is quarantined as simulated research output until external validation.
- Genomic claims state variant quality, genome build, strand, ancestry transferability and penetrance; no genotype-only supplement dosing or precise intervention response claims.

### Phase 5 — Prospective validation and product/market decisions
**P0 before novel efficacy or personalized clinical claims:** evaluate basic guideline-based actions vs labs/phenotype models vs incremental gene/microbiome inputs, independent holdouts, prospective studies where claims demand, harms, subgroups, calibration, burdens and adverse event handling. Qualified clinical/legal assessment for material marketed medical claims. Public product scope continues to be determined by actual functionality and target jurisdictions.

## 5. Free-first provider implementation decisions (from Integration handoff)
| Provider | Initial role | Constraint / decision |
|---|---|---|
| PubMed E-utilities | Phase 1 P0 | Respect public unauthenticated rate limit (handoff reports ≤3 req/sec/IP); optional key after registered ownership. No private user data. |
| Europe PMC | Phase 1 P0 | Metadata/abstracts; full text only with permission for intended commercial uses. |
| Crossref REST | Phase 1 P0 | DOI, correction/retraction and linked metadata; polite user agent/contact; dynamic rate-limit headers. |
| ClinicalTrials.gov API v2 | Phase 2 P1 | Trials/status/results, not proof of efficacy from registrations. |
| PMC Open Access | Phase 2 P1 | Per-item licence; prioritize commercially permitted subset. |
| OpenAlex | Optional P2 | Not unlimited free; handoff reports a limited free allowance. Never auto-upgrade/spend. |
| Clinical guideline sites | Curated P1 | Use documented open feeds or human watchlist; do not scrape restricted material. |

**Free** means no paid API contract in the planned baseline, **not zero compute, reviewer or legal costs**. Recheck provider policies at implementation; use centralized service with strict quotas and legal/licence ledger.

## 6. Priorities and ownership
- **Chief Architect (this document):** owns phased architecture, canonical backlog dedupe, feature-gated P0 interpretation, trust boundaries and roadmap integration.
- **Developer:** owns *all* code, migrations, CI, GitHub commits, deployment and real integration tests; autonomy per v0.5 Amendment F; no repeated approvals for ordinary commits/pushes; safe Render preview after incremental changes.
- **Biology:** study appraisal, review criteria, science/clinical content acceptance and contraindications; review changes before publishing personalized clinical claims, not before routine engineering.
- **Integrations:** source contracts, feed availability, quotas, terms/rights assessment and acceptance review.
- **Security and Legal:** ingestion supply-chain threat model, personal data separation, third-party/licence rights, regulatory constraints and change-control validation.
- **Branding and Testing:** accessible curator/consumer UI, evidence-update comprehension, comparisons only for substantial visible UI changes, with numbered difference callouts, and independent user sessions.
- **Product Owner:** selects product priorities and public release scope; receives accessible Render preview and an annotated visual gallery only when substantial visible UI differences exist; does **not** authorize each GitHub push. No new paid contracts without separate authorization.

## 7. Quantifiable acceptance / demonstration package
Only **major, visibly different UI/branding/workflow transformations** require before/after media at matched screen, data, browser/device/theme and code SHA. Include concise numbered highlights pinpointing the actual changes and preserve originals; skip unchanged/near-identical screens. Backend/invisible changes use API traces, behavioral comparisons and tests (including explainability, integrity/retraction, dedupe and rollback) rather than forced screenshots. Phase deliverables must work in access-controlled Render preview for Product Owner testing without waiting for noncritical specialist sign-off.

Core metrics: dedupe correctness; source feed completeness/staleness; known retraction detection; rights violations **zero**; live-rule auto-publish events from ingestion **zero**; approved-release rollback/reproducibility; measured outcome coverage and unit safety; user comprehension of evidence state; reviewer false positives/missed important studies; user burden and recommendation abstentions. Set numeric success thresholds from measured pilot baselines and safety assessment, **not invented percentages**.

## 8. Open decisions (do not obstruct v0.5)
1. Product scope: initial general-wellness/research-first vs any clinical interpretation with material regulatory consequences. Legal classification at feature-and-jurisdiction level.
2. Reviewer staffing and permissible evidence turnaround, expedited serious-harm/retraction withdrawal owner.
3. Internal research admin vs externally visible research insight timing; default admin-only until scientific content audited.
4. Version-control linkage: database release immutable hash, Git commit association and rollback strategy; Developer to choose implementation after existing schema review.
5. ClinicalTrials/PMC expansion and full text licence policy; choose only after Phase 1 validated.
6. PR #1 at same verified head may change; reassess v0.5 completion before post-v0.5 coding. **The roadmap does not require the Developer to pause v0.5 or await approval before routine commits.**

## 9. Handoff status ledger
| Source | Received | Architect reviewed | Implemented | Tested | Specialist review of code |
|---|---|---|---|---|---|
| BIO-26-301–312 | Yes | Mapped to ARC-NEXT packages | Not claimed | Not claimed | Not claimed |
| BIO-26-313–318 | Yes | Mapped to ARC-NEXT-03–07 | Not claimed | Not claimed | Not claimed |
| INT-EVID-2026-01–08 | Yes | Mapped to ARC-NEXT-03–07 | Not claimed | Not claimed | Not claimed |

**Final status:** approved as a **post-v0.5 architecture planning direction**, not as a v0.5 scope change, not as a release approval or verification that the proposed evidence ingestion and adaptive recommendation capabilities exist. Developer should start the next phase only after completing and safely deploying the existing v0.5 milestone; ordinary commits remain preauthorized throughout.

> **Product Owner visual-evidence clarification (2026-10-23):** Before/after images are selective, not routine. Create them only for clearly visible, substantial UI/brand/workflow transformations. Mark the actual changes with small numbered callouts/highlights and supply unmarked originals. Never present near-identical screens as a meaningful comparison. For minor or invisible work, report code/tests and preview behavior instead. This rule supersedes broader comparison wording elsewhere in this document.
