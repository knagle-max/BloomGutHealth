# Bloom — Persistent Scientific Learning & LLM Interpretation: Integrated Architect Decision

**Date:** November 18, 2026  
**Disposition:** APPROVE targeted implementation in the **existing** source/evidence/claim architecture, with a durable nonpersonal scientific release and a strictly candidate-only LLM interpreter. **Not implemented, deployed or clinically authorized by this document.**  
**Source-of-truth specialist documents:** [Original owner directive + AI/ML amendments ML-PSL-2601–2610](../agent-handoffs/Bloom_ML_Persistent_Scientific_Learning_Full_Directive_And_Cross_Agent_Handoff_2026-11-18.md) (`ML-PSL-20261118-R1`); [Integration review INT-PSL-01–10](../agent-handoffs/Bloom_Integration_Persistent_Scientific_Learning_LLM_Review_2026-11-18.md) (`INT-PSL-20261118-R1`). All original 8 owner tests and `PSL-T01–T12` remain binding.  
**Execution:** `AGENTS.md` is operating authority, `NEXT_ACTIONS.md` is **the one task queue**, Codex sole implementer on `enhance/bloom-experience`. As inspected 2026-11-18, the active queue is **v0.6 M2 reference eligibility following completed M3 source/receipt work**, with verified B6-overlap and glycemic work. Do not assume older M3 work is still active or create a new science release execution lane.

## 1. Product outcome

Bloom should accumulate **reviewed, transferable, rights-cleared nonpersonal scientific knowledge** that survives development database resets and supports changing scientific evidence; it should also generate **meaningful personalized interpretations** from actual user measurements when separately authorized and backed by eligible evidence. A generated interpretation is not a reviewed scientific claim; a new claim is not model training; account-personal learning does not update shared knowledge.

Three intentionally separate meanings of “learning”:
1. **Scientific evidence learning:** Candidate literature → source verification → scoped claim/evidence review → versioned nonpersonal shared release → updated retrieval/interpretation.
2. **Within-account learning:** Actual consented observations and corrections → authorized dated personal projections/feasibility/preferences and safe Response candidates → account-specific source-epoch invalidation.
3. **Model training:** Independently rights-cleared training records → locked benchmark → model-weight change and validation → separately gated research/deployment. No automatic transfer between (1), (2) and (3).

**Consumer principle:** Silent science maintenance when safe. Users should receive better, concise “what it means/what to do” insights without navigating a research admin interface, repeatedly reentering records, or reading a generic caution feed. Do not turn this into a prominent new Explore dashboard or a new standalone AI chatbot.

## 2. Verified current code and actual gap

Read-only GitHub branch checks (Nov 18; Codex recheck HEAD before writing):

| Existing file | Verified role | Necessary bounded delta |
|---|---|---|
| `shared/scientific-contracts.ts` | Typed evidence and current `ConsumerValueCandidate` admission, scientific claim vocabulary; current relationships largely require review | Reuse claim/source/consumer admission; add **reviewed nonpersonal release reference/version** and evidence-eligibility checks, not a second claim authority |
| `shared/evidence-network.ts`, `shared/biological-model.ts` | In-process versions and linked graph identifiers/evidence sources | Deterministic source-qualified export/read projection for reviewed eligible subset; avoid exporting unreviewed graph content as approved |
| `server/metered-ai.ts` | Consent/authorization/spend/provider circuit and optional `science-ranking` feature | A **separate structured candidate result contract inside existing executor** with numeric/source/claim/action verification and safe deterministic fallback; metering alone does not prove correct medical explanation |
| `scripts/seed-knowledge.mjs` | DB migration seed/install; does not independently rebuild from a reviewed immutable science release | Add narrow reviewed scientific release import/staging validation and clean recovery proof; keep existing operational DB as materialized projection |
| Existing source/revision/rights and policy architecture | Nov 14 `AI_SCIENTIFIC_GOVERNANCE_MODEL_REGISTRY_ARCHITECT_DECISION_20261114.md` and source governance decisions | Incremental reviewed claim promotion, contradiction/retraction tracking, replay/invalidation; don't write new research approval queue |
| Existing Response/Today actions, Food and Bloodwork | Current `BIO-VALUE` candidate-admission rules and current v0.6 M2/M3 work | Only eligible, meaningful personal conclusions; no LLM-derived medical action authority or private training by default |

**Unverified:** no immutable scientific-release object/manifest backed by a tested clean restore, no two independent clean-reset receipts, no rollback with post-release retraction exclusion, no separately validated structured full-panel personal LLM interpretation deployment, no hosted qualified reference payload, no model training. Never mark those completed based on specs.

## 3. Minimal durable reviewed release contract

Use existing canonical source/claim/evidence references. A release is **a portable nonpersonal reviewed claim payload**, NOT a backup of account DB, private prompt cache, entire raw SQL tables or a trained model. An eligible record must include:
- Stable claim/relationship identity with **precise subject, object, direction, population/assay, intervention/comparator/outcome where applicable**; claim scope and evidence strength (including null/harm/contradictions).
- Exact DOI/PMID/accession, publisher version, original evidence locator, source rights for **reference/retrieval and redistribution**, review disposition/reviewer/decision and applicability bounds.
- Stable canonical source ID and relation/review/policy versions, effective restrictions or withdrawal state and dependent claim/action IDs.
- Versioned release ID, schema/build tool version, reviewed receipt IDs, source-manifest references, rights eligibility, sorted canonical payload, byte and semantic SHA256, immutable storage reference, current withdrawal/tombstone overlay version. Volatile timestamps excluded from semantic hash.
- No personal measurements, genomic variants linked to accounts, labs, stool observations, individualized inferences, prompts/responses, identifiers, secrets or access tokens.

**Release algorithm:** approved nonpersonal source/claims only → schema/identity/licence/active-review filter → deterministic serializer → content digest → immutable rights-permitted release artifact (small definitions in Git when licences allow; protected versioned storage for large assets only if provisioned) → isolated staging DB import → hash/reference completeness/rights/tombstone validation → atomic projection activation → targeted dependent cache/claim/action invalidation.

**Critical safety rule:** A current withdrawal, licence revocation or retraction **survives rollback to an earlier release**. Effective current signed/controlled deny policy is applied at import and every evaluation. No prior release may resurrect a withdrawn claim. Availability may fall back to an **older but still eligible** release; corrupt/missing artefacts always fail closed.

**Data and backup:** Two independent clean ephemeral DB restores from the same approved release must produce the same canonical semantic digest, with no access to original application DB. Test corrupt payload, partial import, missing storage credentials, object loss/backup recovery and source withdrawal, without turning these into blanket blockers for ordinary app flows. No new object store until required; preserve evidence/backup policies and actual cost/retention.

## 4. Structured LLM interpretation inside current metered path

**Separation of authority:**
1. Server resolves purpose and source permission; gathers minimized canonical dated observations, reference context, eligible published claims, goals and possible relevant conflicting sources (not raw reports by default). Original source versions/actor/account recorded.
2. Deterministic validated calculations and relevant biomarker/domain logic establish observed numeric facts and **permitted candidate interpretations**. No clinical threshold invented by model.
3. Metered existing AI provider may return structured candidate: `questionId, inputSnapshotDigest, observationRefs, proposedStatementClass, claimRefs, evidenceLocatorRefs, numericAssertions{value,unit,operation,sourceRefs}, populationAssay, contradictoryEvidence, limitations, proposedActionIds, candidate_only`. These are *suggested representations*, not independently authoritative facts.
4. Server verifies exact same-account observation and version references, units/dates/numeric operations, real referenced DOI/section and actual endpoint/population applicability, contradiction/null/harm, authorised purpose, existing reviewed claim state and existing action ID/contraindication. Retrieved literature/user free text is **untrusted** (prompt injection must not alter policy).
5. Render bounded helpful language about genuinely supported findings, with source links and material uncertainty on demand. Reject fabricated citation, causal percentage, drug instruction, unmeasured metabolite, wrong dosage or urgency; safe deterministic **useful** fallback when AI is unavailable—not a generic “more context needed.”
6. Cache only with permission, source-revision digest, release ID, rule/model version and policy/tombstone state; server rechecks actor and source epochs at read and publication. Revocation/withdrawal retracts personal dependent output without erasing unrelated science.

**User value gate:** `BIO-VALUE-01–16` and `BLOOD-DYN-01–08` remain authoritative. LLM prose can make the narrative more natural but may **not** make an arithmetic-only change or reference-value quotation into a major insight. No unsourced medical diagnosis/treatment or inference from mere microbiome taxa or SNP.

**Private data:** External AI transfer requires explicit relevant provider processing permission and policy review. Personal use consent does not mean pooled research/training consent; never store private clinical interpretations inside nonpersonal global release.

## 5. One small executable vertical proof before large-scale science corpus

Use 4 synthetic research fixtures, **not live account data**:
- **A:** accepted source-located nonpersonal reviewed claim with eligible rights.
- **B:** previously reviewed claim later contradicted/withdrawn.
- **C:** same underlying study/claim rephrased or aliased; must dedupe and not count as independent evidence.
- **D:** private synthetic account observation, genotype and prompt seed; **must not appear** in any global export/restore/log.
- A structured AI case built from synthetic full-panel original facts and candidate generated **false DOI, swapped unit and unsupported percentage**.

Steps and receipts:
1. Export a minimal reviewed A/C set; retain B in auditable retired/tombstone state; exclude D. Validate canonical digest and rights.
2. Staged restore into **two brand-new isolated temporary DBs**, verify identical claim/eligibility semantics and stable semantic hashes. No link back to original DB.
3. Withdraw an eligible claim, revalidate dependent cache/action and rollback; current tombstone wins over past release every time.
4. Corrupt/missing artifact, source rights revocation, old job publication, no-model/429/outage: safe source-backed fallback or explicit unavailability, never silent old unsafe claim.
5. LLM output validator refuses nonexistent source/DOI, mismatched units and invented 25% treatment effect; current deterministic meaningful interpretation still works.
6. Freeze a small independent question benchmark (including relevant null/contradictory items), compare prior release and new scientific release for **citation accuracy, correct abstention, contradiction handling, false action promotion, useful decision coverage and cost/latency**. A null/negative improvement is legitimate: don't promote for that claim.

**No production data**, paid corpus, scraping, active healthcare recommendation or global crawl required to prove core engineering correctness.

## 6. Codex increment order and release gates

| Slice | Task | Test/receipt |
|---|---|---|
| `PSL-01` | Reconfirm exact current graph/claim/seed/metered code; audit existing rights and source eligibility. Identify safe minimal release payload, no parallel ledger. | Code SHA and source allowlist |
| `PSL-02` | Deterministic immutable canonical release serialization (reviewed claims only), identifiers and source licence/review manifest. | Two equivalent semantic hashes; D/private negative |
| `PSL-03` | Clean staged isolated DB import + atomic activation + current monotonic withdrawal overlay. | Two fresh builds; corrupt artifact; rollback+later tombstone |
| `PSL-04` | Targeted claim/source/user context dependent revalidation/invalidation; no stale async publication. | B revoked while unrelated A survives, cross-account and stale job |
| `PSL-05` | Structured candidate LLM adapter in `server/metered-ai.ts` path with zero trust validation and useful deterministic fallback. | False DOI/units/effect and real offline path |
| `PSL-06` | Review/rights-scoped research-candidate lifecycle, dedupe and contradictions using existing governance. | No LLM-created approved claim |
| `PSL-07` | Independent fixed science question benchmark and current/previous release comparison. | Quality, useful action coverage, latency/cost and null |
| `PSL-08` | Source backup/restore drill, larger artifact strategy if required. | Actual protected artifact and recovery receipt |
| `PSL-09` | BioLM/BioPredict training schema/rights compatibility only after other research pilots, no implicit training from other LLM outputs. | Rights and heldout data report, no premature fine-tuning |

**Priority:** v0.6 source and report-wide Response/M2/M3 features retain existing execution order. Implement only necessary shared-science source/LLM correctness as v0.6 touches them; standalone durable release engineering is bounded Advanced work afterwards. This is **not** a dependency for basic source-backed Food/Today and verified Bloodwork.

**Acceptance:** original 8 owner tests, `ML-PSL-2601–2610`, `INT-PSL-01–10` and `PSL-T01–T12`, plus no second graph, no private releases, effective later tombstones, two clean rebuilds, real independent question benchmark, LLM fallback, no source-only promotion, meaningful consumer value. Report statuses separately `SPECIFIED`, `SOURCE_CODE_PRESENT`, `ENGINEERING_TESTED`, `TWO_RESET_VERIFIED`, `LLM_CANDIDATE_VALIDATED`, `HOSTED_VERIFIED`, `INDEPENDENT_SCIENCE_REVIEWED`, `RIGHTS_ACCEPTED`, `APPROVED_FOR_PURPOSE` and `PUBLIC_RELEASED`. Never claim implemented because docs exist.

## 7. Important implementation limits

**Autonomy:** Codex can choose actual modules, storage shape, schema adapters, error handling and presentation within existing APIs; typed examples are semantic contracts not prescriptive refactors. No nine-agent build queue or broad redesign. Only source/clinical/privacy/legal risks need targeted review. No routine screenshot pairs.

**Most important correction:** Bloom's **knowledge** persists, while a user's **interpretation** recomputes from authorized current facts. Neither one directly edits neural model weights. A durable knowledge release is a policy-scoped reviewed scientific asset, **not** the entire database or a saved ChatGPT answer.
