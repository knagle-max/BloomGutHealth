# Bloom — Chief Architect reconciliation: General Wellness Rollout Mode and preserved clinical/research gate

**Review date:** 2026-11-25  
**Source:** Owner's full in-conversation handoff “General Wellness Rollout Mode + Preserved Clinical/Research Gate.”  
**Disposition:** **ACCEPT_WITH_AMENDMENTS as product-mode direction and future rollout policy.** This is a requirements reconciliation, **not** a release decision, code implementation receipt, paid review waiver for regulated functionality, or replacement of current GI remediation.  
**Authority:** `AGENTS.md`, `NEXT_ACTIONS.md`, `docs/architecture/BLOOM_GI_DIRECT_REMEDIATION_AUTHORIZATION_20261125.md`, existing capability/source/evidence/privacy architecture and applicable regulatory requirements.

## 1. Primary product decision

Bloom can aim to deliver a **General Wellness & Personal Pattern Exploration** experience without making paid external scientific/clinical review a *universal prerequisite for low-risk descriptive features*. Preserve the distinct independently qualified future clinical/research track. This is neither a blanket wellness regulatory classification nor authority to assert scientific effectiveness, diagnose conditions, prescribe, triage, or release publicly. Actual function, intended use, marketing, population and jurisdiction determine applicable obligations; seek appropriate targeted legal/regulatory review before a public launch or a regulated claim, not a standing paid clinical board for every visual screen.

**General wellness presentation permitted when source and safety controls are ready:**
- Existing canonical food, symptom, medication/supplement self-reports, activity, sleep and relevant time-series **descriptive** logs, with true source ownership and appropriate scope.
- Explore → Understand → Verify displays, including BVA-0090 nutrition coverage with four separate reporting/source/quantity/reference dimensions; BVA-0087–0089 symptom geography **only after** canonical map and reviewed geometry; any future event timeline only when an existing approved feature/contract is ready. The handoff does **not** make these unimplemented assets or a new timeline automatically operational.
- Bounded descriptive co-occurrence, time-order, competing **logged** context and uncertainty. Never describe a co-occurrence as a causal food intolerance, medication side effect, organism effect, diagnosis, or personalized clinical mechanism. Qualify small numbers, missing coverage, recall/time ambiguity, edited/withdrawn events and source compatibility. A generated summary must use a validated account-scoped projection and safe claims admission, rather than bypassing existing verification just because it is phrased as wellness.
- **At most one useful, decision-relevant, optional clarifying logging question**, using the existing INPUT/VOI/consumer flow; silence is allowed. Do not pressure users to supply sensitive cycle, condition, genetics or medication information.

**Wellness mode should be safe without a model:** exact-source lists, rule-bounded arithmetic, descriptive time series and clearly attributed original observations work independently of any unqualified AI reasoning runtime. AI-generated free-text summaries need bounded, tested source provenance, account/permission isolation and withheld-claim handling. Unreviewed model output does not become acceptable solely through gentler wording.

## 2. Keep, do not duplicate, research/clinical capabilities

Treat `wellness-exploration` and `clinical-research-actions` as **product/capability descriptions**, not literal new config names mandated by this document. Reuse `server/capability-policy.ts`, `server/capability-access.ts`, existing development-feature grants/kill switches and existing effective policy/source/consent verification. At any eligible engineering task, inventory actual HEAD to choose the minimum compatible implementation seam.

- Clinical/research action permission remains **server-authoritative, default-deny** in ordinary wellness/public builds; UI state alone cannot authorize an endpoint, job, export, model route, scheduled task or persisted derived output.
- Preserve current private investigation source/snapshot, research evidence provenance, candidate admission, corrections/retraction, sealed independent evaluation hooks, capability readiness and safety/privacy architecture. Do **not** maintain a second runner, evidence graph, new schema, duplicate entitlements or synthetic clinical verdict store.
- Do not demand that unqualified clinical runtime code run or be packaged in a public build simply to “preserve” it. Preserve versioned architecture, test seams and rights/qualified source contracts; dormant server modules/routes may remain entirely inaccessible or absent from public deployments if necessary.
- Activation in the future requires reviewed evidence rights and applicability, domain-specific scientific validation, truly unseen independently custodian-held holdout evaluation, legal/regulatory classification, authorization/consent, security and deployment qualification. **No single boolean is sufficient to unlock these prerequisites.** Maintain independently inspectable review statuses.

## 3. Claim boundaries and safety behavior

**Wellness can say:** “You recorded discomfort on three of the four days with an evening supplement entry; sleep and meal timing also varied; the record is too incomplete to establish a cause.” It can ask “Was the supplement actually taken on those dates?” when genuinely material and permitted.

**Wellness must not say:** “You have SIBO/IBS/IMO,” “this microbe caused your symptoms,” “your medication caused your symptoms,” “you should take/stop a drug or supplement,” “this amount treats your condition,” “the recorded intake proves deficiency,” or assign a clinical risk/urgency from an arbitrary art ring or time correlation.

**Safety exception:** Do not remove or suppress existing qualified high-urgency **safety disclosures** and appropriately worded help-seeking routes just because disease diagnosis/triage is disallowed. Separate approved safety notice handling from unqualified clinical inference and unsolicited recommendations. A generic non-diagnostic suggestion to seek qualified care must not become a false individualized emergency assessment; urgent risks require an independently reviewed safety policy and real signals.

**Time, quantity, identity:** missing ≠ zero, lack of logs ≠ asymptomatic, recorded ≠ consumed, calendar-adjacent ≠ causal, selected anatomical region ≠ localized disease, one bilateral observation ≠ two events, latest rated ≠ currently symptomatic; keep original timestamps, source revisions and correction/permission invalidation.

## 4. Multi-user readiness and graduated rollout

These are **separate gates**, not just mode labels:

| Stage | Scope and minimum permission | Evidence prerequisite |
| --- | --- | --- |
| Local/private owner development | Existing authorized synthetic or private data; no external transfer or unauthorized live private query | Confirm actual security/environment scope; clearly label internal/unvalidated features; retain owner operational pause |
| Invited friends/testers | Distinct real accounts with meaningful consent and account-isolated data | SEC-01..08 negative tests, access control across reads/jobs/caches/exports/account switching/revocation/deletion, basic legal/privacy/incident readiness, safe copy, no prohibited capability; explicit approved deployment/test environment |
| Public general wellness | General-audience wellness claims only in supported jurisdictions | Independent security/privacy and jurisdiction-specific intended-use/regulatory assessment, data handling/consent/retention/deletion/support/incident response, uptime/rollback and accessible realistic device/browser tests; documented owner launch authorization |
| Qualified research/clinical | Scoped, permitted population/use and legally valid product claims | Independently reviewed domain evidence and rights, locked private/clinical model/prompt/retrieval, fresh unseen heldouts, relevant qualified professional/regulatory/legal requirements and all privacy/safety/public security gates |

There is **no owner authorization** in this handoff to merge `main`, restart Render↔Mac/Tailscale, deploy, grant new providers, migrate production data, expose a provider to personal health data or enroll friends now. Protected deployment pause remains until explicitly changed.

## 5. Future commercialization/acquirer readiness checklist (preservation, not build now)

Retain versioned evidence/source-revision trail; immutable qualified public-source releases, permissions/withdrawal and cache invalidation; bounded clinician/research claim set and comparator/limits; independent full-blind frozen-holdout evaluation; accessible explanation and correction, medical-safety challenge and fail-closed behavior; account/consent/privacy audit receipts; rights/licence/territory provenance; distinct capability authorization by purpose/account/environment; deployment and release rollback; dated reviewer/scope/feature readiness ledger. An acquirer would assess maturity of **specific validated features**, not a claim that any dormant clinical capability can be unlocked merely by paying a reviewer.

## 6. Reconciliation with **current** Nov 25 GI execution

**Important:** The historical Nov 22 GI baseline-only STOP is **superseded**. `NEXT_ACTIONS.md` now explicitly authorizes the Nov 25 bounded direct remediation: TIME-01 source/snapshot/epoch wiring → minimum INPUT-01 canonical chronology/permitted fields → private INV-04/05 challenge → reviewed ACTION-01/SEC checks → local qualification and independently sealed custodian validation without intermediate owner-review stops. At the latest recorded engineering checkpoint, canonical source/correction handling and partial private wiring are engineering-tested but a qualified actual private model, GI original-source evidence and consumer A–C clinical action authority are still **not validated**. This new wellness handoff must **not** interrupt that task, revert permissions, reopen baseline-only STOP, treat synthetic tests as scientific validation, or silently activate P1 consumer clinical actions.

**When owner selects eligible wellness implementation after current bounded work:** inspect current app/HEAD and existing capability policy (do not invent literal flags if unnecessary); select one small source-safe screen/presentation slice; verify server capability default-deny and well-scoped descriptive output with missing/zero/corrections, and run targeted SEC and UX evidence. This is a roadmap refinement, not a second task queue.

## 7. Explicit closure

- **ACCEPT:** wellness-first general tracking and descriptive exploration; calibrated observational summaries/one clarification; retain dormant research architecture; avoid unnecessary paid clinical board for plain descriptive features.
- **AMEND:** no blanket legal/clinical exemption, no unsafe diagnosis or treatment recommendation; ensure server-side denial of clinical actions, evidence/source/permission correctness; preserve appropriate independent safety notices; public-facing use requires its own security/privacy/regulatory readiness.
- **DEFER:** new clinical enablement switch implementation until actual HEAD policy review; event timeline and new UI art only when scoped; public/friends deployment until operational clearance; paid external clinical validation until a specific regulated/research claim actually requires it.
- **NO NEW BVA, NO NEW ENGINE, NO MAIN MERGE OR DEPLOY, NO CHANGE TO ACTIVE GI REMEDIATION.**

**Architect status:** `WELLNESS_PRODUCT_DIRECTION_ACCEPTED_WITH_AMENDMENTS`; `CLINICAL_RESEARCH_DEFAULT_DENY_PRESERVED`; `IMPLEMENTATION_NOT_ORDERED`; `RELEASE_NOT_AUTHORIZED`.
