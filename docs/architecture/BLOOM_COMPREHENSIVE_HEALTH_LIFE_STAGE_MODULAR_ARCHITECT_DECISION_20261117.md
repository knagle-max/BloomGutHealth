# Bloom — Comprehensive Personal Health & Life-Stage Intelligence: Modular Architecture Decision

**Owner and scientific source:** November 17, 2026; [full 19-section owner directive + separate Biology review](../agent-handoffs/Bloom_Comprehensive_Personal_Health_Life_Stage_Intelligence_Complete_Science_Handoff_2026-11-17.md), **BIO-CPHLS-20261117-R1**. The 79k-character original is preserved verbatim. This document reconciles implementation; it does not replace original WH/MH/MED/PREV/SLEEP/MSK/CARD/XH test IDs or scientific refinements.
**Disposition:** APPROVED modular-monolith architecture, staged scope, **not** a clinical release or indication that all modules are implemented.  
**Branch/owner:** Codex, `enhance/bloom-experience`; follow `AGENTS.md` and `NEXT_ACTIONS.md`; no second work queue.  
**Decision in one sentence:** **One Bloom user experience and canonical account data; domain-focused, independently maintainable feature modules; a single purpose-scoped context/science/action backbone; no app-wide rewrite, separate databases, microservices or independent health AI stacks.**

## 1. Exact source and architecture reconciliation

The source covers seven **domain areas**, not seven separate apps:

| Owner domain IDs | Approved purpose / intended home | Existing work to reuse | Missing implementation and science to verify |
|---|---|---|---|
| `WH-01–09` — Women's reproductive/life-stage | Optional private Biology + Profile + Progress; relevant Athlete context | [Hormonal & Reproductive Architect Decision](BLOOM_HORMONAL_REPRODUCTIVE_HEALTH_ARCHITECT_DECISION_20261117.md); existing Profile sex, canonical labs and optional symptoms | Current Profile **sex=female** availability gate (owner Nov17) + separate consent, context-aware prominence, dated independent reproductive states, user-correctable history. General clinical anatomy applicability is a separate gate (see §3) |
| `MH-01–09` — Men's hormonal/reproductive | Optional Biology + Profile + Bloodwork + Progress; adult sexual wellbeing separately opted in | Existing dated hormone labs, Profile, medication/source chronology; hormone handoff's general labs and sexual wellbeing guarantees | TRT actual vs scheduled administration; concentration/formulation/route, lab draw timing, fertility/PSA/sexual data context and appropriate eligibility without automated dose recommendations |
| `MED-01–10` — Medication and supplements | Profile regimen, Food consumption, source-aware Biology/Bloodwork | Current **active V06-M3-CONFIRMED-SUPPLEMENT** task, label-source and consumed source architecture, Food #12; actual schedule vs taken separation | As-needed/paused/stopped and actual administrations, formulations, elemental vs compound, unknowns, duplicated intake reconciliation, legal interaction source and corrected exposure timeline |
| `PREV-01–07` — Preventive and screening | Optional Profile/care record, selected Progress and Today reminders | Profile, dated sources, consent and existing reviewed guidance/evidence registry | Narrow completed/scheduled/recommended/declined/unknown history, province- and time-versioned guidelines, optional reminders/summary, no false “overdue” |
| `SLEEP-01–07` — Sleep/stress/wellbeing | Lightweight Activity/Today/Progress, Athlete recovery where relevant | Existing check-ins and future Apple Health contracts, longitudinal observations | Manual versus device estimates, time-in-bed/stages, no duplicates, sensitive discretionary mood logs, no passive psychiatric inference |
| `MSK-01–08` — Musculoskeletal/bone | Activity/Symptoms, Biology, Progress and Athlete injury restrictions | Existing activity, symptom/checkin and [Visual Progress](BLOOM_VISUAL_PROGRESS_BODY_MEASUREMENT_INTELLIGENCE_ARCHITECT_DECISION_20261117.md) source concepts | Region/stiffness duration/function and clinician restrictions; DXA Z-/T-score with site/method distinct from smart-scale bone estimates; safe activity veto, no diagnosis |
| `CARD-01–08` — Cardiometabolic/chronic context | Bloodwork, Biology, Progress and Response/Today | Existing lab history/comparability, `shared/wellness-actions.ts`, `shared/goal-guidance.ts`, whole-panel Response #15 | BP measurement protocol, dated treatment/lifestyle overlays, protected competing goals; no invented causal improvement, validated risk score only after jurisdiction/population/rights/review |

**Observed repository evidence (read-only latest branch Nov17):** `shared/wellness-context.ts` and `server/wellness-context.ts` implement a narrow read-only, owner-scoped wellness context with age band, pregnancy/safety context, medications/conditions/goals and conflicts/missingness; `shared/wellness-actions.ts` and `shared/goal-guidance.ts` provide action/goal primitives, `shared/scientific-contracts.ts` provides claim vocabulary, `shared/schema.ts` has saved optional `sex: male|female|null`. The active `NEXT_ACTIONS.md` is presently **V06-M3-CONFIRMED-SUPPLEMENT**. No complete clinically approved all-domain system has been verified. Do not overclaim implementation, tests, hosted deployment or independent clinical release.

## 2. Owner's modularity question — architecture choice

**Choose a modular monolith with feature-oriented modules and enforced contracts.** Current React/TypeScript/Express/Neon/PostgreSQL/Render + specialized Python/FastAPI remains. Modular code is not the same as microservices. A modular monolith avoids independent deployments, duplicated data, per-domain permission systems and hard distributed transactions, while still permitting feature-level changes.

**Two layers:**
- **Canonical shared platform:** authenticated user/account/source ledger, revisions, consent/purpose, units and terminology, dated facts and original observations, evidence and model registry, dependency invalidation, one action/contraindication/priority engine, design tokens/asset registry, audit and approved Python analysis isolation.
- **Feature domains:** each owns *its own typed observation UX, schema mapping, applicable education, domain-specific calculations/interpreter, eligibility requirements and tests*, and registers these against the shared backbone. A module cannot use another module's private tables directly or create its own safety engine.

**Dependency direction:** page/route composition → feature API and authorized projections → canonical account/data/evidence/eligibility. Cross-feature insights request **approved, typed, purpose-limited projections** from the shared context resolver, not unrestricted data joins from siblings. Avoid cyclic imports and one giant mutable 'personal-health-anything' dictionary. Feature toggles affect presentation/eligible data processing, not historical source deletion.

**Contract organization (illustrative only; adapt to actual HEAD, existing files and conventions):**
```text
shared/health-context/           # stable account-, purpose-, as-of-date facts; may extend current wellness-context.ts
shared/health-domains/{regimens,prevention,sleep,msk,hormones,cardiometabolic}/
                                # typed per-domain fact/eligibility/description contracts
server/health-domains/<domain>/  # API composition/source adapters, not new DB per module
client/src/features/<domain>/    # feature-specific presentation/hooks where needed
shared/wellness-actions.ts       # ONE permitted choice/action release authority (existing)
shared/scientific-contracts.ts   # ONE scientific claim vocabulary/evidence authority (existing)
shared/... existing data ledgers # ONE original observation/source correction pipeline
```
These are **design roles**, not an order to move or rename existing code in bulk. Codex should keep already well-structured modules and extract boundaries only where modification would otherwise create duplication.

### Common feature registration — minimal metadata, not a runtime plugin platform

Register feature `id`, owning domain, applicable route(s), user-visible role, required authorized input classes, release gate, applicable context selector, privacy defaults, source dependencies, evidence/eligibility adapter and whether current deployment enables it. This can be a **small typed static manifest** and direct composition, not a generic dynamically loaded marketplace or new AI orchestrator. Each feature may be replaced/refined behind its stable contract; migrations remain canonical/versioned and reversible. Avoid giant global registries that include unused speculative modules.

```ts
type HealthDomainId = "hormonal" | "regimens" | "prevention" |
  "sleep-wellbeing" | "musculoskeletal" | "cardiometabolic";
type HealthFeatureDefinition = {
  id: string;
  domain: HealthDomainId;
  releaseTier: "implemented" | "research-only" | "not-released";
  requestedInputClasses: readonly string[];
  purpose: string;                  // authenticated and consent-checked
  userFacingRoutes: readonly string[];
  requiresScientificEligibility: boolean;
  // Config is advisory: server-side canonical permission checks remain binding.
};
```
Do not misinterpret metadata as permission: access enforcement must occur on server at source read, processing, publication and export.

**When to split a service later:** only when measured independent scaling/availability/security isolation demands it—e.g. heavy imaging or research statistical compute, already handled by bounded Python/worker execution. No Kubernetes, Redis, additional databases or per-module deploys by default. An independently deployable domain is a future option, not a premature goal.

## 3. Source, time, permission and owner-rule conflicts

### 3.1 Preserve both provided conceptual contracts

The original owner contract `PersonalHealthContextEntry` and specialist extensions `ContextFact` / `ContextProjection` must be retained in the exact source handoff (linked above). The implementation should **extend the existing `WellnessContext` resolver** and canonical revisions rather than introducing a second ledger. Required: original reported versus source-confirmed facts; actual/planned/estimated; `occurredAt` distinct from `recordedAt`, effective interval, event-as-of context, source revision and evidence version, user correction, sensitive domain/purpose, missing/conflicts and abstention. A current profile value must not rewrite prior-era eligibility. Age at event may be uncertain if only birth year is known.

**Correct architecture:** domain-owned typed `ContextFact` records/projections where truly necessary; one server-authoritative purpose-scoped `ContextProjection` from actual canonical sources; a module can request only the minimal facts needed. No default global personal-health mega-export into the LLM, caches or Today dashboard.

### 3.2 Female reproductive eligibility vs anatomy-dependent healthcare

Existing **explicit owner rule** remains binding for *Bloom's female reproductive module:* it is **offered/available only when currently saved Profile `sex === "female"`**, then remains private/off until distinct voluntary topic opt-in. Context may reorder *eligible* topics using user-selected goals, reported stage and age soft priors, but must not bypass the female gate. A saved sex of male or unknown cannot silently activate the female module. General hormone lab history and separately opted-in adult sexual wellbeing remain cross-sex.

The Biology specialist correctly notes that **clinical screening applicability cannot safely infer anatomy from Profile sex alone**. These are **different product decisions**:
- The **female reproductive tracking module** obeys the owner-specified saved-sex female availability gate.
- A future **purpose-specific preventive screening education/eligibility** must consider voluntarily supplied actual relevant anatomy/surgeries/prior history, not guess organs from sex/gender. E.g. cervical screening may be relevant to a person with a cervix regardless of profile choice; *do not use the female reproductive module* to expose it or infer personal anatomy.
- If the desired UI for specific anatomy-based prevention conflicts with the female-only tracker gate, request a separate owner-scoped product decision for that screening feature—not a hidden bypass or automatic irreversible exclusion. General educational information remains available through approved Explore/Biology routes.
- Do not create new gender/sex fields simply to support a speculative module; only add minimal distinct clinical reference variables where actual validated rules and user consent require them. Do not conflate identity with clinical model formula input.

### 3.3 Clinical and privacy gating

Source-compatible context is necessary but **not sufficient** for clinical actions, diagnoses, prescribed medication changes or screening calls. Existing evidence/regulatory/permission gate remains authoritative. No source-blind AI medical recommendation. Sensitive reproduction, sexual, mood, family history, medications and conditions are not automatically visible to Today, Coach, notification previews, external models or cross-user learning. A user may store privately without consenting to action-selection reuse. Revocation/deletion updates derived projections and invalidates stale async jobs, with source-history/export/erasure semantics preserved.

## 4. Scientific integration — one prioritizer, many interpreters

- Each feature can produce versioned **descriptive** source-linked observations, **qualified** explanatory context, eligible candidate actions (or abstention), and specific reason/missingness.
- One central context/safety/evidence eligibility and CDPI/Response/Today selector decides what is safe and important. Safety, consent and protected-goal conflicts are **hard gates before ranking**; don't put seven health topic cards on Today.
- An event may be relevant to another domain only if purpose, time validity, source and science allow it: e.g. real TRT administration plus testosterone draw time, source-calibrated bone DXA plus recorded function, actual supplement intake plus nutrient label, or bleeding record plus verified ferritin and reviewed education.
- A chronological association alone is **not causal evidence**. Never use “improved by 35% because of X” without scientifically approved individual causal validation.
- General wellness guidance remains available with missing sensitive context when safe; otherwise one high-value clarifying question or abstain. Never fill a profile completeness meter with mandatory sexual/reproductive or mental-health prompts.

## 5. Seven bounded implementation domains and v0.6/v0.7 crosswalk

Preserve the specialist's **CP-01–CP-10** map; it's a requirements crosswalk, not a parallel backlog.

| Slice | Execution priority | Concrete exit |
|---|---|---|
| `CP-01` contextual chronology/source | Narrow integration with **v0.6 existing** source edits and actual intake | as-of chronology, own-account purpose, correction/revocation tests |
| `CP-02` relevant eligibility projection | v0.6 safety for touched paths, expanded v0.7 | missing/conflicting abstention, age at event, female reproductive UI gate distinct from anatomy-based prevention |
| `CP-03` unified safety/priority | existing v0.6 Food #12 / Response #15 / Today work | veto unsafe/incompatible actions, preserve protected goals, don't add competing recommendation engine |
| `CP-04` medication/supplement exposure | **current `NEXT_ACTIONS.md` V06-M3** plus Food actual-intake logic | prescribed/scheduled/taken/missed/stopped/unknown distinct, elemental/compound and dedupe |
| `CP-05` optional domain UIs and records | mostly v0.7, incremental when scoped | voluntary low-friction sex/hormonal, prevention, sleep/mood, MSK, cardiac modules, source correction and privacy |
| `CP-06` clinical preventive guideline registry | v0.7, external source and territory review | status/version/rights, past completed/vaccine, no invented overdue |
| `CP-07` appointment-ready export | v0.7 | owner-selected dates, data/source/units, private field omission, preview before actual share |
| `CP-08` relationship/Response integration | v0.6 only for approved current source and report facts; expand v0.7 | reviewed source-affiliated links, no clinical/causal inventions |
| `CP-09` UX and design | as each approved page is touched | shared Bloom LDL design DNA and canonical image-backed header; distinct mobile/tablet/desktop; existing original assets preserved |
| `CP-10` QA/rights/release | each release | actual implementation and exact SHA evidence; domain source truth, security/privacy, clinician claims reviewed |

Do not reimplement existing RH specialization, lipid marker charts, supplement calculations, consent, source correction or individual calibration. Preserve original 40 scenarios, `XH-01–20` owner plus `XH-21–40` Biology, and every domain ID. Add automated/real-user multi-year synthetic journeys crossing at least four domains, as called for in the source.

## 6. Developer module contracts and deterministic assembly (illustrative)

```ts
type ContextUse = {
  accountId: string;                // derived from authenticated server actor
  purpose: string;                  // explicit permission check
  asOf: string;                     // event time, not just now
  requestedDataClasses: readonly string[];
  evidenceVersion: string;
};
type ContextFactRef = {
  sourceId: string;
  sourceRevision: string;
  occurredAt: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  certainty: "source-confirmed" | "reported" | "estimated" | "unknown";
};
type DomainInterpretation = {
  moduleId: string;
  status: "descriptive" | "reviewed-education" | "abstain" | "research-only";
  supportingSources: readonly ContextFactRef[];
  relevantEvidenceIds: readonly string[];
  limitations: readonly string[];
  proposedActionId: string | null;   // NOT user action until gated centrally
};
```

**Life-cycle workflow:** `authenticated source event → canonical revision → dependent context invalidation → active purpose-scoped projection → eligible domain-specific explanation/abstention → central approved safety/action prioritization → user-facing purpose-relevant view → correction/review and deterministic refresh`. For expensive Python/statistical workloads, follow [scientific computing infrastructure](BLOOM_SCIENTIFIC_COMPUTING_INFRASTRUCTURE_ARCHITECT_DECISION_20261116.md), bounded durable work and atomic pre-publish recheck. Do not add another AI orchestration system.

**Modular change example:** Updating a Canadian preventive-care guideline should change only the versioned prevention evidence adapter and its tests, invalidate guidance that actually depends on that guideline, and retain Food/Activity domain behavior. Changing an input medication source revision should invalidate correct linked lab/supplement/safety interpretations, not unrelated sleep data or all future user context. Module boundaries make these changes safer if service contracts are tested, not because every domain gets its own database.

## 7. End-to-end acceptance and measurable modularity

1. All existing `WH/MH/MED/PREV/SLEEP/MSK/CARD` and `XH-01–40` IDs remain authoritative in preserved original. No “source-file exists” substitute for executable coverage.
2. **Domain isolation:** Domain-specific module change does not change another domain's persisted data or user UI without an explicit typed contract; no cross-domain cyclic imports or unreviewed clinical data projection.
3. **Shared truth:** one recorded actual event can inform authorized multiple-domain read views without duplicate source records. Source correction or consent revoke retracts dependents and leaves unrelated views stable; old worker cannot republish.
4. **As-of historical test:** same user has differing age/life-stage/treatment status across prior and current lab dates; only effective-at-date context is used. Birth-year boundary uncertainty abstains where exact eligibility needs a birthdate.
5. **Separate available vs eligible:** saved female Profile gates female reproductive tracking, but general hormone labs continue across profiles and anatomy-specific preventive education is evaluated on relevant volunteered facts, not blind demographics.
6. **Fast workflows:** one or two-step symptom/sleep/treatment/measurement entry where safe; no compulsory 30-field intake; users can inspect/correct context and see reason for an abstention.
7. **No false receipt:** prescribed/scheduled supplements, injected drugs and preventive screenings never become actual completed events without confirmed source. Real confirmed intake contributes once to nutrition totals, preserving original label and form.
8. **Science gate:** no unsupported hypogonadism, menopause, psychiatric, musculoskeletal, liver recovery, osteoporosis or heart-risk diagnosis/percent; no autonomous medication changes or test ordering; clinical model only when population, jurisdiction, inputs and intended use reviewed.
9. **Sensitive privacy:** two accounts, revoked opt-in, deleted sources, private topic previews/search/cache, Coach and appointment export, third-party AI rights; no cross-user data reuse by default.
10. **Design:** actual 320/390/768/1024/1440 screenshots, desktop uses width, mobile is focused, existing original art preserved, mode palette (Everyday botanical; Athlete blue; future Coach purple), visual brand coherence and feature-quality separate.
11. **Three synthetic multi-year journeys** from source `B12`: changing life stage; nutrition/lipids/training/medication tradeoffs; older adult function/prevention/DXA/sleep. Each crosses >=4 domains, source/time/permission controls, report citation and one eligible action, **not seven dashboards**.
12. **Composability test:** deactivate a future optional feature via current release/consent gate and confirm ordinary Food, Today, Bloodwork and Activity remain fully useful; no missing route API cascade or accidental loss of historical records.

**Developer status reporting** for each scoped capability: `OWNER_APPROVED`, `SPECIFIED`, `SOURCE_CODE_PRESENT`, `ENGINEERING_TESTED`, `HOSTED_VERIFIED`, `INDEPENDENT_SCIENCE_REVIEWED`, `SECURITY_PRIVACY_ACCEPTED`, `LEGAL_CLAIMS_RIGHTS_CLEARED`, `PUBLIC_RELEASED`. Do not equate the presence of 7 feature folders or a card with implementation readiness.

## 8. Explicit non-goals and owner value

No new microservices, separate authentication, generic EHR rewrite, unconstrained LLM health agent, extra seven top-level tabs, self-diagnosis platform, autonomous screening/testing, commercial clinical guideline copying without rights, default sensitive-data re-use, unvalidated risk scores, paid infrastructure or premature native fork. No new ornamental image generation required by this science architecture; when an approved page design genuinely lacks art, create additive canonical registry requests and preserve approved original imagery.

**Final goal:** Bloom learns a whole person's relevant history while keeping optional domain experiences independently evolvable and easy to maintain. The user should not have to understand modules, configure everything or repeatedly enter the same context. The platform retains **one source of truth, one approved scientific authority and many focused, progressively useful experiences.**
