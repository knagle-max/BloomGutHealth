# Bloom — Biological Optimization Intelligence: Integrations & Data Specialist Review

**Document ID:** INT-BOI-20261109-R1  
**Date:** 2026-11-09  
**Recipient:** Chief Architect & Integration Lead  
**Disposition:** **APPROVE WITH TARGETED REVISIONS** for v0.6; no v0.5 expansion or provider activation.  
**Source basis:** `Bloom_Biological_Optimization_Intelligence_Architecture_v06_2026-11-09.md` (BOI-001–018); `Bloom_ML_Biological_Optimization_Intelligence_Review_2026-11-09.md` (ML-BOI-2001–2006); `Bloom_User_Testing_Biological_Optimization_Intelligence_Review_2026-11-09.md` (UT-BOI-5401–5416). Source architecture inspected development snapshot `633f6835...`; supplemental read-only GitHub spot check on `enhance/bloom-experience` @ `e5fa15d595ea2e0702e4a44494ee4621b37c461e` (moving branch).

## A. Scope and verdict

BOI should be a **cross-cutting use of Bloom's current canonical observations, consent, source provenance, evidence graph, eligible actions, and personal outcome history**, not a second database or ML claims pipeline. Maintain three distinct release tiers: (1) reviewed ordinary wellness choices, (2) prospective observational/experimental response learning only when validated, and (3) synthetic/reference molecular simulation as separately gated R&D. A real model output is not necessarily a measured physiological result. The proposed wide intake matrix is an **optional source-capability inventory**, not a mandatory onboarding checklist.

**Approvals:** Reuse ordinary manual sources and existing data contracts; allow synthetic/local, rights-compliant molecular engineering in parallel after v0.5; build shared readiness and source reliability. **Do not activate** paid APIs, direct wearable links in browser/PWA, real sensitive source transfer to research models, unlicensed derived biochemical databases, medical treatment, or personal hormone/metabolite/pathway-efficiency claims.

## B. Evidence actually inspected and limitations

- `docs/architecture/V06_HANDOFF.md` is the sole existing Architect planning authority; no second BOI lifecycle required.
- `ml_service/research/stoichiometry.py` describes itself as a bounded exact-rational tiny-network solver, engine `synthetic-vertex-lp-v1`; flux units are synthetic. No curated model, biological calibration or claim of personal tissue flux.
- `server/ml-service.ts` has allowlisted `/api/ml/research/synthetic`, service-token URL safety and a 30-second client timeout. `size` in `node-fetch` bounds response, **not** the JSON request body: explicit upstream request-size, concurrency, result-size and CPU/memory caps remain necessary. Actual hosted service availability was not tested.
- `RESEARCH_MODEL.md` states the research product is a scenario builder/adapter, **not MICOM, a curated reconstructions database or a validated biochemical predictor**.
- Neither this review nor ML/UT source handoffs establish validated empirical SCFA production, individual hormone secretion, personal intervention response, full 2026 DRI coverage, HealthKit connectivity or current provider commercial agreements.
- Distinct handoffs by Biology, Security, Legal, UX and Developer must verify their own claims and controls; this document is not their signoff.

## C. Requirements disposition and implementation-ready integration additions

| Existing BOI IDs | Decision | Integration requirement / acceptance | Priority |
|---|---|---|---|
| BOI-001, 002, 016, 017 | **APPROVE / REUSE** | Continue established source table, immutable revisions, purpose consent, observed/estimated/provider/modelled semantics and evidence refs; one snapshot/version fingerprint per decision; no duplicate entity or evidence registry. | v0.6 P0 |
| BOI-003, 004, 005 | **REVISE** | Source catalogue is capability inventory; ask only context changing an eligible decision; use manual sources first. Imported data must retain source method, resolution, device, version, units, original date/time and missingness. | v0.6 P0/P1 |
| BOI-006, 008, 009 | **APPROVE** | Deterministic eligible action → user chooses → separately logs completion → compares **observed** dated outcomes; no auto-created meal/workout or fabricated adherence. | v0.6 P0 |
| BOI-010 | **DEFER ACTIVATION** | HealthKit and Health Connect require deployed authorized native bridges; PWA shows truthful unsupported/disconnected states and manual import. | Later native milestone |
| BOI-011, 015 | **STAGE** | Longitudinal source quality, method comparability, confounder/adherence and prospective model promotion; abstain when inadequate. | Later v0.6/P2 |
| BOI-012 | **APPROVE / REVISE** | Python gets minimized eligible option matrices and opaque candidate IDs only; Express revalidates source snapshot/consent/hard restrictions on response and before save. Benchmark against strong deterministic baseline; fallback on outage. | v0.6 P1 |
| BOI-013 | **REVISE** | Begin synthetic/rights-cleared reference model curation and biochemical benchmark **in parallel with ordinary optimization**; personal model activation remains later and separately reviewed. | v0.6 R&D active |
| BOI-007, 014 | **APPROVE EDUCATION ONLY** | Mechanism identification and source-based assayed hormone measurements remain distinct; no inferred personal GLP-1, DPP-4, pathway capacity, toxin, metabolite rates. | v0.6 P1/P2 |
| BOI-018 | **APPROVE** | Independent acceptance must distinguish everyday utility, biochemical model fidelity, user comprehension, accuracy, fairness, consent and hosting costs; same SHA/feature flags. | Crosscutting |

### INT-BOI-01 — Source and fitness-for-use gate
Use existing `observation`/`source`/`claim` contracts; per proposed action record: `sourceRef`, `sourceRevision`, `method`, `measurementKind`, `units`, `timeWindow`, `coverage`, `qualityStatus`, `consentPurpose`, `eligibilityDecision`, `reasonIfAbstain`. Disallow inferred equivalence between qualitative Viome organisms and quantified abundances, self-reported sleep and instrument stages, DRI estimate and clinical deficiency, glucose/CGM and GLP-1, measured analyte and computational flux. **Accept:** full and partial source examples produce distinct outputs; unknown never maps to zero; corrections invalidate dependent claims but not unrelated history.

### INT-BOI-02 — Provenance-safe binding to actions
Action recommendations reference current owned canonical source versions and separately reviewed scientific claim IDs, not a free-text model statement. Request-time and commit-time authorization, currentness, risk/contraindication and food/source permissions are checked **at Express**. **Accept:** correct a meal source, alter allergy, revoke genomic use, delete Viome source or change goal while Python runs: previous candidate becomes stale/invalid and cannot be committed without explicit fresh evaluation. Old completed observations retain their authentic history.

### INT-BOI-03 — Cross-source deduplication and comparability
Within existing reconciliation, use stable device/provider native IDs where allowed, event start/end including timezone offset, sample/method, overlap, activity type and explicit author/source. Preserve competing raw records and one chosen normalized activity only where justified. Never sum overlapping Apple Health/Strava/Peloton steps/workouts or join same-day laboratory specimens without source linkage. **Accept:** double-import and timezone/DST fixture; corrected vendor original; a planned session is never recorded as completed.

### INT-BOI-04 — Rights-cleared biological reference data
Source ledger must capture per imported reaction/model: provider, immutable accession/version, organism rank/strain reference, chemical form and compartment, exact stoichiometric coefficients and direction, objective and bounds, genome reconstruction/build, publication/assay, download timestamp, content SHA, **dataset and component licence separately**, attribution, redistribution/derivation grant, commercial scope, withdrawal/retraction. Do not promote species association to strain-level enzyme capacity; do not equate gene existence with activity. **Accept:** unresolved species/strain, missing coefficient, mixed acid/anion form, invalid mass balance, incompatible compartment, withdrawn dataset → abstain or remain synthetic research-only. No unlicensed aggregate model package distributed.

### INT-BOI-05 — Bounded Python service transport
Reuse existing Express → private Python service auth. Canonical source ownership and action ledger stay in TypeScript/PostgreSQL. Versioned optimizer payload: `{contractVersion, requestId, contextRevision, approvedCandidateIds, numericAttributes, hardConstraints, softObjectives, coverage}`; response returns only candidate IDs, feasibility, objective audit, solver/model version, warnings and `sourceSnapshotRevision`. No raw uploaded files, named genomic calls, patient PDFs, clinical notes or privileged writes. Separate research-only payload names model accession/hash and synthetic substrate assumptions; do not mix result types. **Accept:** payload over limit, malformed coefficient, timeout, token failure, service down, replay, old account, revoked context → no state mutation; deterministic TypeScript/manual option remains. Run real process with configured caps, no external runtime data calls and no browser-direct service endpoint.

### INT-BOI-06 — Connection transparency / portability
Truthful statuses `unsupported`, `not_connected`, `permission_denied`, `partial`, `stale`, `failed`, `connected` only when actually authorized and operating; show last real sync and data types, not just a saved consent row. Native connectivity remains later. Manual food, training, sleep, typed lab and report imports stay available; supported CSV/GPX/TCX/FIT only after tested adapters. **Accept:** disconnected provider does not erase canonical self-records; revoked data cannot influence new recommendations; export records include source dates/units and limitations.

### INT-BOI-07 — External activation ledger / cost
Each optional provider: official API/partner route, contract approval, territory, permissions, revocation, account deletion, rate and API cost, deployment flag, data rights, outage behavior, observation types, provenance and stale threshold. Default disabled until Legal, Security and operator authorize actual activation. No personal data sent to scientific reference services or LLM by default. Measure Python CPU/RAM concurrency and result size on representative synthetic fixtures before selecting any paid deployment.

## D. Source/licensing feasibility — independently researched facts versus unresolved rights

| Resource | Feasibility | Verified terms or caution | Recommendation |
|---|---|---|---|
| Rhea reaction data | **HIGH** for reference reaction curation | Rhea official docs state **CC BY 4.0**, commercial reuse permitted with attribution; releases archived, REST/TSV/SPARQL exports. This is reaction reference, not organism-specific enzyme expression. | Preferred reaction backbone; pin releases, credit source, validate stoichiometry and ChEBI forms. |
| MetaNetX/MNXref | **HIGH conditional** for ID reconciliation | SIB/MetaNetX states **CC BY 4.0** for integrated mappings/data; verify precise file and upstream linked components. Beta identifiers explicitly may change. | Mapping crosswalk, not an alternative independent entity database. Pin versions, avoid beta IDs as canonical without review. |
| AGORA2 reconstructions | **RESEARCH candidate** | Published model availability does not by itself establish unrestricted commercial model redistribution or derivative rights; linked dependencies/underlying datasets need inspection. | No import of bulk model into production until exact rights and organism-model-quality mapping reviewed. |
| MICOM/model solver ecosystems | **RESEARCH candidate** | Solver/library licence and optimization backend licence are distinct; a paper used IBM CPLEX under academic licence, not proof that Bloom may commercially operate it. | Choose a vetted CPU solver after explicit package/version/backend/licence review; synthetic in-house solver is not biological validation. |
| ChEBI, PubChem, UniProt, NCBI Taxonomy | **Identity sources** | Provenance, licence, source authority, update cadence and chemical-form specifics differ; do not interpret an identifier alone as evidence of measured biological reaction. | Reuse existing IDs, snapshot/version and science review. |
| HealthKit/Health Connect/FHIR/consumer wearables | **Deferred/conditional** | Native store APIs need user authorization and native implementation; FHIR access needs an actual authorized issuer/provider. | No v0.6 initial planning dependency on a live provider. |

**External authoritative references:** Rhea official [licence](https://www.rhea-db.org/help/license-disclaimer), [downloads](https://www.rhea-db.org/help/download) and [API](https://www.rhea-db.org/help/rest-api); SIB MetaNetX [resource](https://www.expasy.org/resources/metanetx), [mapping platform](https://www.metanetx.org/); AGORA2 [original paper](https://www.nature.com/articles/s41587-022-01628-0). AGORA2 access/rights must be checked per exact data and dependencies. External review is licence fact research, **not** a Legal authorization decision.

## E. Priority and exact developer acceptance cases

1. **v0.6 P0, synthetic/local:** Given only food allergies and a goal, Express produces one eligible source-grounded suggestion without any omics or wearables. Unknown nutrient values never become zero and no consumption is logged on suggestion.
2. **v0.6 P0, source boundary:** User fixes ingredient serving or lab unit, removes a source, changes a goal or revokes sensitive consent; any pending recommendation with old context revision is rejected as stale. Preserved historical observations still display with historical context where authorized.
3. **v0.6 P0, permissions:** Two accounts with overlapping dates and content cannot see or reuse each other's observations, model response, cached suggestions or export receipts. No direct Python database access to privileged user data.
4. **v0.6 P1, source identity:** Mixed-source overlapping workout doesn't double calories or load; DST/time-zone movement and device corrections preserve original offset and source.
5. **v0.6 P1, Python:** Same minimized candidate matrix runs through real private service and is benchmarked against deterministic TS baseline. Unavailable Python, stale response or infeasible constraints → abstain/fallback, not misleading completed action.
6. **v0.6 R&D, biochemical:** A source-free synthetic pathway demonstrates mass balance, producer and consumer/cross-feeding, substrate bounds, infeasible/withdrawn reactions and versioned exact replay; a real biological reconstruction must separately include licence manifest, strain/model identifiers and independent assay benchmark or be explicitly unvalidated research-only.
7. **v0.6, no model leakage:** Model output is never written into measured metabolite, food nutrient, hormone or provider-assay columns, and does not automatically change an approved action rule.
8. **Future connection:** HealthKit/PWA UI says unavailable/unsupported until native bridge exists, and source revocation visibly halts future use; manual alternatives work.

## F. Responsibilities, open blockers and owner decision

- **Chief Architect:** reconcile BOI to existing `V06-09/12/13/14/17`, `ML-REST`, `ML-BIOMODEL`, `ML-MOLEC`, `ML-STRAT` IDs; issue only exact delta tasks; sequence v0.6 after v0.5 RC gate; maintain one source/evidence/recommendation owner.
- **Nutrition/Biology:** decide first narrow microbial reference pathway (including reactions and consumption), limits of source strain, clinical interpretation and biochemical evidence; independently assess actual human interventions and source assay methods.
- **AI/ML:** scientific/mathematical benchmarks, optimizer baseline comparison, model card and safe abstention; no one score claims all three capabilities validated.
- **Legal:** commercial research dataset rights, licence attribution and derivative obligations, intended-use and external distribution approval.
- **Security:** service trust, payload/compute bounds, PHI minimization, account isolation, consent/deletion, logs/cache/retention and no unauthorized remote inference.
- **Developer/Codex:** only implementer after Architect consolidation; existing modules and tests first, no duplicate services. Report exact commit, environments, tested fixtures and source retention.
- **User Testing/UX:** confirm novice/expert comprehension of research vs personal observations, one useful action and progressive consent at independent candidate SHA.
- **No new Product Owner decision required** for this review, source-feasibility research or safe synthetic engineering. Paid/cloud/clinical/rights/production activation requires the applicable separate approval.

## G. Overall decision

**APPROVE WITH TARGETED REVISIONS.** Build the source-valid, consent-aware practical choice system first while **actively** developing reference molecular modelling in a separate synthetic/research-only track. Keep personal response prediction later. Extend current Bloom TypeScript/Express/PostgreSQL source and evidence systems; Python is bounded calculation only. Preserve versioned rights and chemical/strain/assay validity. Do not treat the existence of Rhea, AGORA2, a synthetic LP or a wearable API as proof that commercial activation, biological prediction or human benefit is established.

**Verification limits:** This report reviewed handoffs and selected source files, plus public authoritative licence/access documentation. It does not execute the Python service, original source ingestion, any scientific model, real-user cohort, live provider OAuth or deployed health app; nothing here certifies those.