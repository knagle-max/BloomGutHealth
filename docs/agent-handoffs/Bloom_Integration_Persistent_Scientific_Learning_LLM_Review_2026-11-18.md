# Bloom — Persistent Scientific Learning & LLM Interpretation: Integrations and Data Specialist Review

**ID:** INT-PSL-20261118-R1  
**Date:** 2026-11-18  
**To:** Chief Architect & Integration Lead; cc Codex, AI/ML, Biology, Security, Legal, UX/User Testing  
**Disposition:** **APPROVE WITH TARGETED INTEGRATION AMENDMENTS**; no production/clinical/model-training activation.  
**Source:** `Bloom_ML_Persistent_Scientific_Learning_Full_Directive_And_Cross_Agent_Handoff_2026-11-18.md` (ML-PSL-20261118-R1), preserving the owner's unaltered Directive A and amendments ML-PSL-2601–2610.  
**Repository inspection:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, `fd70aa87b7ab9ebb015adbc9053ee047e4eb0af8` (2026-11-18). Read-only targeted inspection, not full audit or hosted test.

## 1. Integration verdict

The owner directive and AI/ML handoff are correctly scoped. Reuse existing source/evidence/claim/model registry and metered AI path. Build a small **reviewed scientific release artifact** as a portable nonpersonal authority, with deterministic staged restore into the operational database; separately hold unreviewed research hypotheses, private account observations/interpretations and training datasets/weights. Never let LLM prose, model output or a scientific database seed self-authorize personal medical actions. Keep Food #12 and report-wide Response #15 on critical path; no universal data-work hold.

A durable science release is **not** a snapshot of a user's observations, a copy of application SQL, or a cached answer. It is a frozen approved, rights-scoped, provenance-linked claim set with its source identities, eligible purpose, versioned withdrawal policy and independently testable restore.

## 2. Current code and precise gaps

| Verified file | Existing behavior | Not established by inspection |
|---|---|---|
| `shared/scientific-contracts.ts` | Typed claims, source-aware consumer candidates, evidence audit; currently emits `awaiting-specialist-review` and pending review dates for its relationships | Durable released-and-reviewed claim graph, rights-scoped rehydration or automatic promotion |
| `shared/evidence-network.ts` | In-process versioned biological source/edge projection `network-2026-10-17.1` | Immutable release artifact, canonical claim-semantic hashing, source-rights manifest, staged rollback |
| `server/metered-ai.ts` | Bounded optional metered executor, consent/authorization, spend and provider-circuit checks; defined feature keys include `science-ranking` | An independently working structured biological interpretation endpoint; evidence locator verification or clinical eligibility supplied merely by metering |
| `scripts/seed-knowledge.mjs` | Installs `migrations/0005_biological_registry.sql` within a DB transaction using direct DB connection | Clean reset reconstruction from approved portable immutable source releases; integrity/rights checks, retraction overlay and restore drill |
| Architect scientific-governance decision (Nov 14) | Explicit active evidence progression, contradictions, risk-tier approval and reassessment specification | Evidence that the proposed scheduler, candidate corpus or full decision ledger is implemented and deployed |

No object-store release, two independent reset receipts, backup restore or deployed LLM interpretive result was verified in this review. Do not label specified interfaces as running services.

## 3. Targeted integration requirements (one canonical roadmap, no duplicate authority)

| ID | Priority | Codex/Architect delta | Test / acceptance |
|---|---|---|---|
| **INT-PSL-01** | P0 | Define **shared nonpersonal release allowlist** from canonical reviewed sources and claims; never generic `SELECT *` of existing app DB. Each record carries original source/version, evidence locator, scoped claim/policy/reviewer and rights receipt. | Inject distinctive synthetic user genotype, lab values, prompts and account IDs; none occurs in staged/shared artifact bytes, manifests, repository or restore. Negative test using derived paraphrases as well as raw identifiers. |
| **INT-PSL-02** | P0 | Canonical export and manifest with stable IDs, deterministic ordering, schema/mapping/tool versions, semantic and byte digests, explicit licence dimensions, source locators, approved eligibility and scientific-review receipt. | Re-export same approved set in two isolated builds yields matching semantic hashes; change source release/claim status changes appropriate digest; unrelated timestamps do not. |
| **INT-PSL-03** | P0 | **Fail-closed import** into clean isolated staging: validate hashes, schema, signature or protected authenticity, reference completeness, exact source rights and active revocation/tombstones; atomically switch active version. Treat old DB as optional operational projection, not sole source of global science. | Fresh DB from source package; corrupt/truncated/missing asset fails closed, no partial activation; previous valid release continues where rights allow. |
| **INT-PSL-04** | P0 | Prevent unsafe **rollback resurrection**: a withdrawn/retracted/right-revoked claim remains ineligible after activating any older release, via independent current signed safety/rights overlay or equivalent monotonic withdrawal policy. | Release B withdraws claim X; switch back to A leaves X blocked while unrelated historical eligible claims still function; reboot/restore preserves result. |
| **INT-PSL-05** | P0 | Build minimal **source-dependent invalidation** linking active release/claim revision, approved action IDs, explanation/insight receipts, research/personal caches and job versions. Revalidate actor and source versions at publication and read. | Withdraw one evidence claim: affected UI/API and future queued outputs retracted; unrelated outputs preserved; no late worker republishes old text. |
| **INT-PSL-06** | P0/P1 | Structured LLM **input and output firewall** using current metered executor: server-controlled deidentified/minimized context when authorized; claim refs/units/values/evidence IDs verified against canonical inputs and reviewed source locators; stop prompt injection in retrieved literature. | Fabricated DOI, wrong assay/unit or invented 25% causal effect rejected; no leaked raw private PDF/genotype; deterministic interpretation available on provider failure. |
| **INT-PSL-07** | P1 | Artifact operations and recovery: choose existing Git for small rights-cleared definitions; private versioned object storage for large licensed artifacts and weights only if needed. Pin object version/hash, encrypt where appropriate, scope access, audit copies, keep backups in separate failure domain, rehearse restore, budget cost. | Immutable artifact deleted/corrupted, staged restore and backup recovery tested; no provider token or signed URL in durable manifests or public logging. No assumption an object store is already configured. |
| **INT-PSL-08** | P1 | Research-source acquisition and claim dedupe: canonical DOI/PMID/version and claim identity (entity, direction, outcome, population, evidence scope); capture negative findings and contradictions; licence/retraction checks; no private input to public literature API. | Rephrased duplicated source does not increase evidence count; competing study remains linked rather than overwritten; retracted source removes dependent eligibility. |
| **INT-PSL-09** | P1 | Versioned independent question/decision benchmark and source-coverage report. Freeze holdout questions, baseline source release, valid answer/abstention and measured source rights before challenger evaluation. | Report citation correctness, false-approval, harm/contradiction handling, incremental useful action coverage and latency/cost; reject unhelpful update. |
| **INT-PSL-10** | Advanced | Separate model training source rights and lineage from educational/retrieval rights and personal processing permission, including base model, original dataset, derivative weight publication and benchmark splits. | Source permitted to cite but not train remains queryable only in eligible retrieval, absent from training dataset; shared personal information never enters trainer by ordinary insight consent. |

**Map** INT-PSL-01–10 into ML-PSL-2601–2610 and the November 14 governance decision; do not create a second Epic, graph or approval queue.

## 4. Release contract and the key correction

Model the durable artifact as **approved claim payload + provenance and rights + immutable revision + current withdrawal state**, not a DB table export. Suggested pipeline:

`reviewed rights-scoped source/claim snapshot → deterministic canonical serializer → digest/authenticity → protected versioned package → clean staging database → schema/rights/foreign-key validation → atomically activate → invalidate claim-dependent outputs`.

**Safety warning:** rollback must not restore a past interpretation now known to be unsafe. A later signed withdrawal/rights-decision overlay applies to *any* historical release. Avoid broad cache wipes when dependency graph can identify the affected claim IDs.

**Data boundary:** nonpersonal published evidence metadata is different from individual measurements, private analyses, prompt/response traces, study participant records and shared training corpora. Even a deidentified case study may pose risk; do not let simple field stripping substitute for Security review. Original source/article rights and training rights are separate. Negative sample scanning and account-bound permission tests are necessary but not sufficient to prove no personal data, so review export design, source origins, transformations, logs and backups.

## 5. Recommended minimal vertical proof

Produce one source-linked reviewed nonpersonal claim **A**, one contradicted/withdrawn claim **B**, one duplicate/rephrased candidate **C** and one synthetic private account finding **D**. Demonstrate:

1. Export canonical allowed A plus non-active B/tombstone and deduped C, excluding D; record licences/claim identity and hashes.
2. Import into two brand-new, isolated ephemeral DBs, with no connection to original app DB; compare semantic digests, reviews, actual public source IDs and eligible API explanations.
3. Change source evidence: withdraw B (or A for negative test) and show targeted invalidation; roll back release and prove later tombstone still blocks claim.
4. Simulate corrupt blob and absent object credentials; old valid approved action stays in bounded available state, no claim silently changes.
5. Exercise one structured LLM full-panel candidate with authentic baseline measurements and false numeric/DOI injected negative; verify deterministic values and no personal clinical causal claim; inject outage and observe deterministic alternative.
6. Run frozen question benchmark; include at least one negative/null and competing evidence; record result even if new release fails to improve coverage.

No real personal or production health data is required for this proof. Capture exact SHA, artifact digest, schema/policy version, CI, temporary DB identities, hosted state, reviewer and failure evidence.

## 6. Specialist boundaries and developer guidance

**Integrations:** authoritative source edition, canonical IDs, source manifest, rights metadata, immutable export/restore integrity, data separation, retraction inputs, backup/operator path and targeted cache invalidation.

**AI/ML:** prompt/structured candidate and benchmark, false-approval controls, model training provenance and evaluation.

**Biology:** exact scientific claim, population, assay, effect, contradiction, safety and appropriate action scope.

**Security:** user/private source boundary, keys, logs, consent, backup, data-transfer controls and job-race isolation.

**Legal:** all relevant redistribution/commercial use/training/derived-weight rights, provider conditions and clinical/territorial claim classification.

**Architect:** reuse existing registry/backlog/canonical authority; map IDs and final release policy. **Codex:** sole implementer; no unapproved production activation.

Keep ordinary v0.6 Food #12 and full-panel Response #15 moving, and allow safe reference-dataset acquisition/Python research independently of public clinical prediction.

## 7. Final decision

**APPROVE WITH TARGETED REVISIONS** to the November 18 owner/AI handoff. The new value is durable, reviewable scientific authority independent of the disposable development application database, plus structured LLM assistance that cannot mutate that authority by itself. Independent scientific, source-rights, privacy and scope approvals remain feature-specific. A clean deterministic rebuild, retraction-surviving rollback and safe fallback are the acceptance milestones. No code, database, providers, or storage configuration changed by this review.