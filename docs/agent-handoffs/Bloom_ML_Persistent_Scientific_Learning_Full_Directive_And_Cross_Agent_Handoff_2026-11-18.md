# BLOOM — Persistent Scientific Learning and LLM Interpretation
## Original owner directive in full + AI/ML specialist amendments and cross-agent implementation handoff

**Document ID:** ML-PSL-20261118-R1  
**Date:** November 18, 2026  
**To:** Chief Architect & Integration Lead; Developer/Codex; Nutrition & Biology; Integrations & Data; Security & Privacy; Legal & Regulatory; UX/Brand; User Testing  
**From:** AI Intelligence & Personalization / ML & Biological Intelligence Specialist  
**Disposition:** **APPROVE WITH TARGETED AMENDMENTS** for reconciliation into existing architecture. **Not** an implementation, independently validated scientific release, deployed storage system, grant of third-party training rights, or clinical activation.  
**Controlling scope:** Preserve current v0.6 Core Food and report-wide Bloodwork Response work, use existing scientific claim/evidence/model registry and approved Python molecular research tracks, and do not create a second graph, recommendation engine, or application database. Codex alone changes application code.  
**Source preservation:** Section A below reproduces the complete November 18 owner directive without alterations. Section B and following sections are specialist additions; they clarify, extend and operationalize but do not silently replace its text.

---

# A. ORIGINAL OWNER DIRECTIVE — FULL, UNALTERED TEXT

Bloom — Persistent Scientific Learning and LLM Interpretation

Chief Architect / Codex directive — November 18, 2026

Objective

Ensure Bloom’s external AI investigations can produce reusable, scientifically verified knowledge that survives application development database resets and remains available across future model and application versions.

This capability must support Bloom’s existing scientific intelligence architecture, not establish a second research graph or unrestricted model-training pipeline.

Part A — Dynamic interpretation

Extend the existing metered AI integration and Response Intelligence architecture to support consent-authorized, evidence-grounded, structured interpretation of complex biological patterns.

LLM outputs are candidate interpretations, not authoritative laboratory results, established causal findings or automatically permitted medical recommendations.

Use canonical measured inputs, validated calculations and retrieved scientific evidence. Verify outputs against source IDs, numerical facts, scientific applicability and action eligibility before release.

Part B — Permanent scientific memory

Introduce a durable scientific knowledge release mechanism using existing scientific graph, source/evidence and claim-governance contracts.

Separate:

* Public, nonpersonal source-backed scientific evidence.
* Unverified LLM-derived candidate hypotheses.
* Reviewed biological knowledge.
* Private user-specific observations and derived learning.
* Model training datasets and versioned weights.

Only appropriately verified and rights-cleared nonpersonal knowledge may be promoted into the shared scientific release.

Part C — Survival across resets

Scientific knowledge and model artifacts must not rely on the current development application database as their only authoritative copy.

Implement:

* Versioned nonpersonal scientific source and claim manifests.
* Immutable or reproducible approved knowledge releases.
* Artifact hashes, provenance and withdrawal/retraction records.
* Protected storage and tested backups.
* Deterministic restore/rebuild into a fresh application database.
* Rollback to earlier reviewed scientific releases.
* Tests confirming that no private user data is accidentally retained or imported.

Use GitHub for appropriately licensed compact scientific definitions and code; use controlled durable object storage for larger rights-cleared datasets and model artifacts.

Do not copy the full user database or sensitive personal AI prompts into the permanent scientific asset store.

Part D — Learning quality

For each eligible new research claim:

1. Record the scientific question and nonpersonal source context.
2. Preserve original publication identifiers and precise evidence locators.
3. Record candidate findings and contradictions.
4. Independently verify meaningful assertions.
5. Apply existing claim eligibility and safety rules.
6. Deduplicate against existing knowledge.
7. Promote, restrict, reject or withdraw with versioned receipts.
8. Benchmark whether the new knowledge improves relevant scientific questions.

A generated answer does not by itself change Bloom’s scientific authority or neural model weights.

Part E — Model training

Preserve a future pathway for rights-cleared, reviewed scientific knowledge to support BioLM fine-tuning and BioPredict experiments.

Do not automatically train on OpenAI, Anthropic or Google responses without confirming applicable contractual permissions.

Do not use private account data in shared model training without a separately approved purpose, consent, privacy and legal framework.

Acceptance tests

* A qualifying scientific finding can be reviewed and versioned.
* An unverified hallucinated finding is rejected.
* Conflicting or retracted evidence can downgrade an approved claim.
* Duplicate investigations do not create duplicate scientific assertions.
* A fresh development database reconstructs the same approved nonpersonal knowledge.
* Private account records are absent from restored shared scientific assets.
* LLM unavailable: approved deterministic insights remain functional.
* An updated scientific release measurably improves or honestly fails an independent question benchmark.

Execution constraints

Codex remains sole implementing engineer.

Reuse existing model registry, knowledge graph, source provenance, privacy and scientific evidence infrastructure. Do not create a second application database merely for convenience.

Preserve current v0.6 Core Food and Bloodwork Response priorities; introduce this as a bounded foundational enhancement and complete its durable integration through existing Advanced scientific work.

The owner should not be required to manually approve routine scientific findings, select individual training examples or arbitrate everyday model outputs. Existing independent scientific and risk-based review remains mandatory where applicable.

---

# B. AI/ML SPECIALIST REVIEW AND AMENDMENTS

## B1. Decision and current architecture reconciliation

**Disposition:** Adopt the owner's directive in full. Its central technical distinction is correct: an external AI investigation can contribute a *candidate research artifact*, while only an independently corroborated, source-linked, rights-cleared and eligible claim can become a durable approved nonpersonal scientific release. Neither step silently updates neural weights, private patient facts or permissions to recommend treatment.

This is a **bounded extension** of the existing November 14 Chief Architect decision `docs/architecture/AI_SCIENTIFIC_GOVERNANCE_MODEL_REGISTRY_ARCHITECT_DECISION_20261114.md`, which already specifies nonpersonal discovery, versioned evidence/claim lifecycle, scheduled/event-driven reassessment, contradiction checks, scoped controlled claim promotion, demotion, and selective research visibility. Do not create another curation subsystem. Reuse `shared/scientific-contracts.ts`, `shared/biological-model.ts`, evidence action rules, existing source manifest/rights and consent contracts, and `server/metered-ai.ts` after confirming their current exact revision.

Preserve the November 6 `PYTHON_ML_RESTORATION_AND_MOLECULAR_EXPANSION_DECISION_2026-11-06.md`: **Track A** real constrained Python practical optimization and **Track B** active reference/synthetic microbial molecular prediction/simulation remain first-class development, without premature application of unvalidated flux. Durable scientific releases should support both tracks, not delay their development until public medical authorization or longitudinal model availability.

Preserve November 14 `V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`: C0 source/safety and C1 Food / C2 whole-panel Response remain immediate product priority; persistent releases are a bounded shared foundation and Advanced research output—not an emergency requirement to reimplement completed functionality or a precondition for all Food/Today use. `NEXT_ACTIONS.md` selects active Codex tasks; this handoff is not a new competing queue. Respect later owner directives.

**Provenance of this assessment:** based on the complete owner text above and repository documents inspected earlier November 18 on `enhance/bloom-experience`. The moving branch means the Architect/Codex must record an actual commit SHA and diff before implementation. No private prompt corpus, live object store, deployed restore, model training, or independent hosted benchmark has been verified by this handoff.

## B2. Requirements amendments (ML-PSL-2601–2610)

| ID | Priority | Amendment | Concrete exit criterion |
|---|---|---|---|
| **ML-PSL-2601** | P0 foundation | **One release authority, not a second graph.** Use canonical evidence/source/claim/model-policy records and existing reviewed claim IDs; create only a compact immutable *release manifest + payload export/import adapter* where needed. | An approved claim round-trips through canonical contracts with identical identity, review scope, evidence pointers, applicability, and authorization after restore; no duplicate competing authority. |
| **ML-PSL-2602** | P0 foundation | **Deterministic, pure restore and reversible activation.** Release artifacts content-addressed, schema-versioned and importable into empty ephemeral DB using staged validation and atomic activation; support rollback to specific approved release. | Two independent clean rebuilds generate same canonical semantic hashes; rollback restores eligible claim set and invalidates superseded derived caches. |
| **ML-PSL-2603** | P0 privacy | **Nonpersonal shared assets only.** Separate shared corpus, candidate research dossiers, private observations/derived learning, and separately permissioned model training datasets/weights. | Synthetic accounts, private prompts, genomic/lab/stool data and identifiers do not appear in release payload, Git history, logs, backups or large-object manifests; account data remain in existing restricted store. |
| **ML-PSL-2604** | P0 safety | **Structured LLM interpretation challenger.** Use existing metered executor, user-purpose consent and canonical source snapshots; require typed proposed claim/observations/assumptions/contradictions/evidence IDs and deterministic verification before any user-facing claim. | Provider outage or contradictory/unsupported output falls back to valid source-led deterministic explanation; fabricated units/effect sizes/source citations are rejected. |
| **ML-PSL-2605** | P0 scientific | **Independent scientific corroboration, not model agreement.** Publication identifiers and evidence locators resolve; study claims, population, intervention/exposure, endpoint, uncertainty and conflicts reviewed under existing claim-tier policy. | A fabricated or mismatched study claim never becomes approved due to plausible language or multiple agreeing LLM responses. Routine low-risk eligible claims can follow existing automated policy; high-risk require assigned independent review, not owner adjudication. |
| **ML-PSL-2606** | P0 integrity | **Lifecycle and dependency invalidation.** New, superseded, restricted, withdrawn, corrected, rights-revoked and retracted claims produce versioned release receipts and invalidation for every dependent action, explanation and research cache. | Retract a previously approved source/claim: its dependent interpretation disappears or becomes explicitly qualified across API/UI and after restore; unaffected actions remain. |
| **ML-PSL-2607** | P1 quality | **Independent knowledge and decision-value benchmark.** Freeze benchmark questions, evidence gold references, difficulty strata and baseline before assessing challenger release; include negatives and contradictory evidence. | New release reports question coverage, citation fidelity, false approval, abstention, applicable actions and costs vs prior release; model promotion can be rejected when no measurable benefit. |
| **ML-PSL-2608** | P1 research | **Nonpersonal hypothesis memory with a different permission tier.** Retain source-linked research questions, discarded hypotheses, competing explanations and failure notes separately from approved production knowledge. | Research user can inspect approved/limited/rejected history and why; no research-only node grants action eligibility or overwrites a personal measurement. |
| **ML-PSL-2609** | P1 operations | **Artifact rights, integrity, storage, restore drills.** Explicit commercial reuse/redistribution and model-training rights per payload, checksums, object version, restore key ownership, encryption, retention, availability, cost, access logging and secret exclusion. | Object loss/corruption/revoked licence or mismatched checksum fails safe, old authorized snapshot can recover when still valid, no silent unreviewed activation or leak. |
| **ML-PSL-2610** | Advanced research | **BioLM/BioPredict training is a separately promoted asset.** Create data/model lineage and evaluation contracts; preserve ability to fine-tune on verified rights-cleared nonpersonal primary content; treat provider-generated text separately under contractual restrictions. | Offline synthetic/licensed training rehearsal yields dataset manifest, subject/content split, model hash, comparison, rights receipt and rollback; no third-party text scraping or private population training enabled. |

**Clarification of "nothing around blocking data":** Lack of an optional corpus, user lab, genome, research licence or metered LLM must not freeze independent development or ordinary source-backed outputs. Narrow absence/restriction to the *specific dependent computation, distribution or model-training use*. Science integrity, account privacy and intellectual-property use rights are feature-specific authorization requirements, not whole-project blockers.

## B3. Design of the persistent scientific release

**Do not rely on a database dump.** Approved scientific state is rebuilt from reviewed, immutable source/evidence/claim *release payloads*. The application database remains an operational materialized projection; it is not the unique authority for global scientific facts.

A minimal *illustrative* release envelope, mapped to existing canonical types by Architect and Integrations:

```ts
type ScientificKnowledgeRelease = {
  releaseId: string;                 // stable canonical release identifier
  schemaVersion: string;
  createdAt: string;                 // informational, excluded from canonical semantic hash
  supersedes?: string;
  payloadDigestSha256: string;       // digest over canonical normalized payload bytes
  sourceManifestRefs: string[];     // exact source versions, rights and evidence locations
  claimSetDigestSha256: string;
  modelArtifactRefs?: string[];     // optional, separate rights/model version identity
  scope: 'nonpersonal_shared_science';
  eligibilityPolicyVersion: string;
  buildToolVersion: string;
  reviewedReceiptIds: string[];
  withdrawnOrSupersededClaimIds: string[];
  validationReceipt: string;
};
```

- **Canonical serialization:** stable sort by canonical IDs and stable field order, normalize Unicode/unit encoding and excluded volatile metadata, pin build-tool/container versions; hash exact payload bytes and semantic claim content separately. Do not assume byte-for-byte equality across unpinned ZIP/timestamp archives.
- **Reproducible pipeline:** `licensed upstream scientific sources + reviewed claim records -> deterministic canonical export -> hash/sign or protected manifest -> durable artifact -> staged import into empty DB -> schema/rights/identity checks -> atomic activation -> cache invalidation`. It must reject source links with unresolved identity or invalid release-scoped rights.
- **Release invariants:** no account IDs, emails, addresses, phone numbers, birth dates, prompt text, user-sourced genetic/medical observations, individualized derived outputs, secret keys, signed access URLs or object-store credentials. A public scientific article about a human cohort may be nonpersonal metadata; actual row-level participants still require data governance, not assumed public.
- **Separation of candidate dossiers:** Draft AI extraction records can exist in protected scoped research jobs without appearing in the production release; store safe nonpersonal question and citation metadata where allowed. Their retention is explicit, limited and independent of approved release rollback.
- **Tombstones and withdrawal:** A revoked claim stays historically auditable as a withdrawn *identifier and reason*, not active content; a rollback cannot re-enable a claim subject to a **later active safety/rights withdrawal**. Apply the current valid policy/tombstone set on every activation/restore.
- **Backup is not restore proof:** restore from a fresh empty development database with no access to original DB, validate content, reproduce ordinary science explanation, and demonstrate rollback; separately test backup/object recovery. A normal SQL backup is still useful for operations but does not replace independent approved scientific artifacts.
- **Storage:** properly licensed compact curated definitions/metadata may live in repository with attributable licences; large corpora/model files use protected versioned object storage with independent backup/restore, retention and cost caps. Do not commit raw provider dumps or private prompts simply to make them persistent. Do not assume any particular storage product is already provisioned.

## B4. Structured AI interpretation policy and example contract

The LLM is a **candidate generator/reformulator**, not the source of measurements, a numerical calculator or an independent clinical reviewer. Existing canonical TS calculations remain authoritative. Existing action IDs, consent, source availability, safety veto and reviewed claim policy determine if an interpretation may appear; model-generated hypotheses alone cannot enter user-facing action ranking.

Illustrative output schema (extend current sources rather than creating competing tables):

```ts
type InterpretationCandidate = {
  questionId: string;
  purpose: 'personal_general_wellness' | 'nonpersonal_research';
  inputSnapshotDigest: string;       // digest over allowed canonical inputs, not raw private file
  observationRefs: string[];        // same-account, server-validated when personal
  proposedStatementClass: 'recorded_observation'|'population_relationship'|'exploratory_hypothesis'|'mechanistic_hypothesis';
  claimRefs: string[];              // existing reviewed claim IDs only for eligible use
  evidenceLocatorRefs: string[];    // DOI/PMID + section/figure/table/location where available
  structuredNumericAssertions: Array<{
    value: number; unit: string; operation: string; sourceRefs: string[];
  }>;
  relevantPopulationAndAssay: string[];
  contradictoryOrNullEvidenceRefs: string[];
  limitations: string[];
  proposedActionIds: string[];      // candidates only; never executive authority
  inferenceStatus: 'candidate_only';
};
```

**Validation pipeline:** server grants purpose/consent and builds minimized source summary → metered provider returns schema-limited candidate → validate existing source IDs, dates, unit/measurement comparability, numeric consistency with deterministic values, evidence locators (including citation existence and claim relevance), contradiction/applicability, disallowed medical advice and proposed actions against eligible reviewed catalogue → emit *safe explanation over verified fields* or abstain/revert to deterministic explanation. Do not authorize LLM to create new patient biomarker values, new clinical ranges, inferred causal percentages, arbitrary personal microbial flux, or personalized treatment doses. Validate prompt-injection resistance in retrieved papers and user text.

**Private versus shared:** Inferred insights about a user remain account-scoped, purpose-limited, source-revision dependent, withdrawable and not part of shared scientific releases. Only independently supported nonpersonal underlying scientific relationships can enter durable global science. Sending allowed user data to any external AI vendor requires explicit provider-processing permission and applicable contractual/legal scope; avoid transfer where a local deterministic explanation suffices.

## B5. Knowledge acquisition and learning quality — exact lifecycle

1. **Question:** pre-register a nonpersonal scientific question/unknown, source purpose and priority (e.g., *Which microbial pathways can synthesize and consume butyrate under specified reference-media assumptions?*).
2. **Discover:** bounded source query and explicit data provider version/licence; no per-user raw labs, genotype or microbiome PDF in public research queries.
3. **Extract:** capture PMID/DOI/study version, precise quoted-or-located sections/figures/tables/assay/population, endpoint and comparator, effect estimates as reported, sample constraints, null/contradictory/harm results, and source type.
4. **Challenge:** independently verify citations and substantive assertions against original publication/legitimate full-text access and other independent evidence, not just a second language model repeating the first.
5. **Classify:** typed `observed` / `association` / `mechanism` / `simulation` / `human_intervention` / `reviewed_action` distinction; verify relevance to strain, tissue, food form, population and experimental conditions. Mechanism ≠ measured patient effect.
6. **Deduplicate:** canonical *claim identity* is more specific than DOI or similar prose: subject/entity + relation/direction + outcome + exposure/intervention + population/model + evidence/claim scope/version. Merge genuine equivalences while retaining conflicting evidence and source lineage.
7. **Decide:** use existing policy to `approved-defined-scope / qualified / research-only / rejected / withdrawn` with reviewer/method/policy/version receipt; low-risk routine classes may qualify for policy-automated disposition as authorized by November 14 Architect decision; clinical, data-rights or higher-risk classes require the relevant independent authorization. Product owner is not routine fallback reviewer.
8. **Promote:** versioned reviewed release only for allowed nonpersonal content; atomically update canonical source-backed projection, invalidating dependents and preserving rollback/tombstones.
9. **Evaluate:** pre-frozen independent question set; compare baseline vs candidate science graph using attribution precision, supported answer quality, correct abstention, contradiction recall, false actionable inference, applicability, retrieval/cost/latency and impact on approved user-value decisions where measurable.
10. **Reassess:** authoritative new evidence, corrections, adverse/null findings, model drift and licence withdrawals trigger bounded re-evaluation and conditional demotion. An old rejected hypothesis can remain searchable as research history if permitted, but never silently resurface as approved.

## B6. BioLM and BioPredict: prepare for real training without inventing training rights

Keep three distinct meanings of "learning": **(1) updating reviewed scientific claims/evidence, (2) adapting within-account recommendations from permissioned individual observations, (3) changing neural model weights.** None follows automatically from the other. A new evidence release can improve retrieval and explanation without any fine-tuning. Prefer RAG over frozen, reviewed releases as the first demonstrable way to use persistent knowledge.

For future BioLM/BioPredict:
- Curate *original permitted primary scientific data* (public-source factual structured facts, original appropriately licensed reports, reference genome/reaction/chemistry objects as allowed), not third-party LLM responses as default training text.
- Record dataset-level and per-source rights for **training**, **derivative models**, **weights distribution** and **commercial deployment** separately; permission to download or cite is not training permission.
- Exclude duplicate source leakage, near-duplicate benchmark answers, data source revisions and individuals/related samples between train/validation/test; use source-level and where relevant subject/cohort/time holdouts.
- Register model architecture/base-weight origin/licence, training configuration, seed/hardware, code commit, training corpus hash, evaluation snapshot, model artifact digest, intended domain, calibration and limitations, version rollback.
- No automatic use of personal account data, even if user consented to ordinary AI interpretation; future shared model training needs distinct owner/privacy/legal review and truly separate purpose consent.
- Python host–microbe solver output is a *simulated label*; it cannot be silently repurposed as experimental flux truth. For model evaluation always compare with measured/independent benchmark data and a deterministic baseline.
- Use controlled cost/compute ceilings. A research-only limited training experiment may be performed on synthetic/licensed nonpersonal material under authorized research scope; general personal deployment has separate promotion criteria.

## B7. Implementation stages and cross-agent responsibilities

**P0 — Reconcile + smallest working durable release (bounded, after/alongside current C0/C1/C2 tasks):** Architect/Codex inventory current source/claim/model registry, database seed/migrations, approved evidence export contracts and provider artefacts. Produce one **small nonpersonal reference-release** with a positive claim, contradictory/withdrawn claim, duplicate and protected private source exclusion; clean DB rebuild + rollback; actual API output uses restored source IDs. Do not create a new database or rerun completed unrelated tasks.

**P1 — Dynamic structured interpretation and reusable science:** Use existing metered provider and deterministic calculator to prove one full-panel lab interpretation with source-level groundedness, safe abstention and no causality. Separately evaluate an equivalent no-vendor fallback. Stage knowledge hypotheses with original evidence locators, independent verify, dedupe, promote and withdraw; run benchmark against prior science release. Preserve allowed offline source-backed Food/Today when providers fail.

**P2 — Active Advanced biology and durable models:** Feed the approved nonpersonal release into already active Python Track B for organism–enzyme–reaction–metabolite reference simulations, and Track A optimizer where relevant. Version reaction/object sources, experimental assumptions and model artifacts. A model may run on synthetic/reference cohorts even when no personal user metabolite claim is authorized. Failure to acquire optional datasets must not halt other validated research cases.

**P3 — Optional BioLM/BioPredict experiments:** Prepare rights/holdout/cost/model promotion receipts, compare retrieval vs fine-tuning against independent tasks, and only attempt weight training when it has a credible benefit and rights-cleared corpus. No cross-user personal training or clinical output authorization from this directive.

| Owner | Exact responsibility |
|---|---|
| **Chief Architect & Integration Lead** | Dedupe IDs into current V06/Advanced and current Codex task selector; decide canonical approved source-of-truth and immutable artifact design; scope stage acceptance and avoid new roadmap/gates. |
| **Developer/Codex** | Sole code implementer; source manifests/export/restore/rollback, metered structured interpretation, guards, targeted tests, exact SHA/CI/Render/DB evidence; never autopublish sensitive data or unreviewed claims. |
| **AI/ML Specialist** | Candidate schema and numeric/evidence checks, retrieval/challenger design, scientific benchmarks, BioLM/BioPredict data/model evaluation, fail-safe fallback. |
| **Biology / Science** | Claim/assay/organism/strain/pathway correctness, contradiction and applicability review, risk-tier scope; assess biochemical benchmarks and nonclinical versus clinical output. |
| **Integrations & Data** | Dataset acquisition, exact versions/IDs/licensing, source manifest and persistence/restore integrity, object-store backup/rights and canonical joins; staged validation. |
| **Security & Privacy** | Separate shared/private asset boundaries, server ownership/consent, encryption and key lifecycle, restoration leaks, caches/logs/jobs, vendor transfer policy, deletion and model-data security. |
| **Legal & Regulatory** | Commercial scientific reuse, training/derivative-weight rights, source redistribution, automated claim scope, intended-use/territory and data-transfer restrictions. |
| **UX/Brand** | Keep scientific explanations short and genuinely actionable, show evidence and limits without an extra dashboard; research-only and approved claims visibly distinct. |
| **User Testing** | Verify useful explanation vs baseline, user comprehension of source/inference distinction, audit withdrawal/retraction UI, and performance when AI unavailable. |

## B8. Acceptance fixtures: original 8 retained + 12 additions

The owner's **eight acceptance tests in Section A remain controlling**. Add the following non-duplicative, executable cases. Record fixed feature scope, actual SHA/deploy/artifact hash, fixture source, expected/actual, PASS/FAIL/NOT TESTED and named reviewer. Do not mark as passed merely because a document or schema exists.

| ID | Scenario / required result |
|---|---|
| PSL-T01 | **Two clean resets:** from the *same* immutable reviewed knowledge release, two freshly initialized isolated databases yield equivalent canonical claim/evidence payload hashes, active eligibility and explanations. |
| PSL-T02 | **Rollback + later tombstone:** roll back approved release after later safety retraction; withdrawn claim remains ineligible under current effective policy/tombstones. |
| PSL-T03 | **Corrupt/missing artifact:** checksum mismatch, truncated blob, unavailable storage or expired access fails closed with explicit status; previously reviewed valid knowledge where legally usable continues. |
| PSL-T04 | **Private-data exclusion:** inject synthetic lab/genotype/stool/AI prompt/owner identifiers into app DB; shared release/export/restore contains zero of those bytes/derivations; legitimate private account data are not transferred to scientific object store. |
| PSL-T05 | **Unsupported numeric interpretation:** LLM invents a 25% personal lipid reduction, switches mmol/L and mg/dL, or cites wrong source; verification rejects and deterministic output survives. |
| PSL-T06 | **False evidence:** invented DOI, wrong paper/endpoint/population, fabricated human trial and retrieved-paper prompt injection cannot activate claim. |
| PSL-T07 | **Contradiction & withdrawal:** new high-quality null/harm evidence affects scoped claim and linked action; release demotes and dependent cached explanations invalidate, while unrelated approved actions persist. |
| PSL-T08 | **Duplicate/rephrased source:** same study/claim rediscovered with alternate DOI spelling, multiple provider IDs, synonyms or LLM paraphrase; merges identity and retains all source locators without artificially increasing evidence counts. |
| PSL-T09 | **Offline provider:** metered AI 429/quota/unconfigured, scientific reference API outage and unavailable Python yield honest fallback; still source-backed everyday Food/Today/Progress. |
| PSL-T10 | **Benchmark discipline:** new release improves a preselected held-out scientific question family and does not inflate false scientific/clinical claims; or honestly fails and is not promoted for that purpose. |
| PSL-T11 | **Training-purpose rights:** an approved-for-citation but not approved-for-training source is available to allowed retrieval/education but excluded from fine-tuning corpus; provider-generated text excluded absent specific permissible terms. |
| PSL-T12 | **Cross-account and late jobs:** revoked user permission, account switch and delayed model/AI/rebuild job never leak private source into shared release, cache, logs, export, user output or training material; server identity controls scope. |

**Additional risk-dependent testing:** actual encrypted object version/backups/restore (not just mock), clean recovery drill when object store is lost, release signing/key compromise recovery, stale source/claim version invalidation, provenance drift after migration, licence-rights expiry, and independent public content review where necessary. These are **feature-specific** checks; they do not impose a blanket pause on unrelated v0.6 features.

## B9. Explicit non-goals and owner-preserving limits

1. No second global graph, evidence database, recommendation engine, personal health DB, claim approval platform or autonomous medical agent.
2. No perpetual paid literature crawl, new subscription or third-party model provider necessary for core operation.
3. No private user health/genetic/microbiome prompts or records in public scientific releases, repository, model training datasets or object-store backup intended for shared science.
4. No claim that a stored answer proves evidence or automatically updates BioLM/BioPredict weights.
5. No automatic clinical diagnosis, intervention efficacy, hormone/metabolite concentration, medication modification or personalized molecular flux from a research simulation.
6. No inference that sharing model-training data follows from consent to personal insight or that research viewer permission authorizes personal recommendation.
7. No owner manual approval for routine low-risk eligible scientific findings; existing risk-tier independent review and automatic policy-scoped claim decisions continue. Do not confuse routine automated promotion with a human-independent clinical efficacy adjudication.
8. No v0.6 Core Food/whole-panel Response stall: acquire and preserve reusable nonpersonal knowledge incrementally while current Codex priorities progress.

## B10. Required consolidated Architect outcome (not another planning cycle)

In the existing delivery ledger/backlog and source/model registry, publish a **single reconciliation entry** with (a) actual existing authority and code modules; (b) ML-PSL-2601–2610 deduped mapping; (c) smallest reviewed release contents and rights/owner; (d) one exact clean-reset-and-rollback executable receipt; (e) one dynamic LLM interpretation vs deterministic fallback receipt; (f) benchmark outcome incl. negative case; (g) optional advanced BioLM/BioPredict rights-checked research plan; (h) precise state `specified / implemented / locally tested / hosted verified / science-reviewed / rights-cleared / approved for purpose / deployed / independently accepted`.

**Final recommendation:** **APPROVE WITH TARGETED AMENDMENTS**, implement durable versioned knowledge as an extension of Bloom's already-approved scientific governance, allow scientific hypotheses and model research to advance without falsely promoting them to verified personal effects, and demonstrate both a clean rebuild and one independently benchmarked useful knowledge improvement. **No application code or production system changed by this specialist handoff.**