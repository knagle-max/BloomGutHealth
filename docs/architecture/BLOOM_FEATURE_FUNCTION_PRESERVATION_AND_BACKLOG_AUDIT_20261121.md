# Bloom — Feature, Function & Backlog Preservation Audit
**Architect source-level audit — 2026-11-21 | branch `enhance/bloom-experience` | Not an additional execution queue**

## Audit scope, evidence, limitations

Compared current `AGENTS.md`, `NEXT_ACTIONS.md`, preserved unabridged snapshots `docs/operations/AGENTS_FULL_DIRECTIVE_SNAPSHOT_20261121.md` and `docs/operations/NEXT_ACTIONS_FULL_QUEUE_SNAPSHOT_20261121.md`, `BACKLOG.md`, `docs/architecture/PERSISTENT_TASK_INDEX.md`, `docs/architecture/ACTIVE_EXECUTION_QUEUE.md`, `docs/architecture/V06_HANDOFF.md`, `docs/architecture/V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`, `docs/operations/V06_DEPENDENCY_BACKLOG.md`, `docs/operations/V06_DELIVERY_STATUS_LEDGER_20261115.md`, actual selected current UI/server/shared source files and exact available verification JSONs, plus the owner-approved 2026-11-18–21 investigator, consumer, lab, condition-selector, physiological, VOI, onboarding and private-data handoffs. This is **feature-family-level traceability**, not certification that every individual acceptance ID or every branch/worktree/hosted deployment has been exhaustively tested. Each item below needs current-HEAD source and scoped test verification before engineering or release status can be promoted.

**Statuses:** `FOUND` means source implementation or reliable dated receipt exists, not comprehensive end-to-end acceptance; `PARTIAL` means working pieces and an unproven remainder; `SPECIFIED` means requirements only; `GATED` means feature-specific approval/consent/rights/model/hosted prerequisite; `DEFERRED` means intentionally not current P0/P1/P2/P3; `HISTORICAL_DONE` means archived verification for a narrower prior scope. **Preserved ≠ built.** `AGENTS.md` is now startup policy, `NEXT_ACTIONS.md` is the only live selector, archive/feature handoffs are evidence and scoped requirements.

## A. Confirmed instruction/queue defects and remediation disposition

1. **STALE INV-05 TOP ITEM — CONFIRMED & CORRECTED:** The short queue still said “Finish/publish INV-05 structured numeric fact subset”; current branch already includes `shared/investigation-numeric-facts.ts`, associated tests and a detailed `docs/verification/V06_INVESTIGATION_NUMERIC_FACTS_20261120.json`. Delivery ledger reports 43 focused PASS, type/build PASS, `LOCAL_ENGINEERING_TESTED_NOT_SCIENTIFIC_ACCEPTANCE`. Changed the root queue to **DO NOT redo**; first verify the active/unpublished worktree and target genuine INV-04 bounded two-pass gap. Full free-prose/semantic accuracy, independent science and consumer authority are NOT qualified. Source code `server/private-investigation-runner.ts` still describes first bounded one-pass runner.
2. **OLD LEDGER SELECTOR — CONFIRMED:** Historical `V06_DELIVERY_STATUS_LEDGER_20261115.md` says T0→T1 visual→T2 Core in “Current next actions”, even though newer science-first queue supersedes it; add/retain an explicit archival-precedence banner rather than rewriting old receipts. Old `PERSISTENT_TASK_INDEX.md` and `ACTIVE_EXECUTION_QUEUE.md` likewise have historical “read first” and P0 language, explicitly overridden in their current tops.
3. **NO VERIFIED REQUIREMENT-DELETION from instruction compression:** The unabridged original `AGENTS.md` and `NEXT_ACTIONS.md` were preserved in new repository snapshot files and exact original Git history. The condensed startup contract still routes to relevant detailed specifications. This is a **preservation-of-text finding, not proof** that every acceptance is implemented, discoverable or tested.
4. **P1 CROSS-DOMAIN ACTIVITY GAP — REAL:** `server/biological-investigation-snapshot.ts` explicitly marks `activity:'not-collected'`, though the owner’s INV-HELDOUT / AI-DEDUCE tasks require unfamiliar dated labs + actual food/nutrition + actual activity. Existing activity records in `shared/experience.ts` can be reused, but there is **no proof yet** that the private investigation actually receives timely, authorized source-revisioned activity. This is a priority candidate for a narrow P1 source/integration slice, not a new activity engine.
5. **APPROVED FORM vs CONSUMER ACTIVATION:** The new TIME-01, RCV-01, ACTION-01, INPUT-01, physiological-context VOI-A–M and UX-A–J are documented as acceptance design, not automatically implemented. Legacy Insights experimental `healthScores`/recommendations must not be promoted as reviewed biological findings. Existing consumer surfaces must be checked before changes.
6. **AMBIGUOUS SEX/REPRODUCTIVE ELIGIBILITY — DOCUMENTED POLICY BOUNDARY, NOT SILENTLY RESOLVED:** Existing `AGENTS` archive and hormonal/reproductive decision restrict the **dedicated female reproductive feature family** to saved Profile `sex === 'female'`. New §0B permits optional general reproductive, menopause and exogenous-hormone **scientific context** without demographic inference. These can coexist if distinct: do **not** silently use optional history to unlock restricted tracker features, and do not withhold general hormonal lab interpretation. If owner intends broader tracker eligibility, obtain an explicit narrow policy revision. Preserve existing consent, privacy and source gates.
7. **ASSET DELIVERY GAP — CONFIRMED as unverified, not deleted:** Six original onboarding goal WebPs and four approved Health Context SVGs are in owner design source ZIPs, A12 identical hashes; files are **not verified in Codex GitHub checkout**. Preserve handoff+exact SHA and await source-verified transfer; don't redraw. Other BVA/scientific chart sources also have delivery-vs-integration statuses; see registry before claiming missing.
8. **COMPETING V0.6 CORE STATUS LANGUAGE:** Short queue groups “deferred full historical Core/Advanced” under P4; this is **sequencing deferral, not functional cancellation**. v0.6 frozen Core C0–C6, especially working Today/Food #12, full-panel Response #15, reference nutrition, data coverage and accessibility, remain approved capability and release requirements. Do not treat P1 priority as permission to delete or silently abandon them.
9. **STALE LEDGER ROWS** for PSA correction, microbiome artwork, experimental workspace and other features can say `ROADMAP` while newer dated entries in the same ledger show engineering progress. Read latest dated receipts/code, not the oldest status table row.

## B. Comprehensive feature-family crosswalk

**Evidence shorthand:** `V06` = `docs/architecture/V06_HANDOFF.md`; `CORE` = `docs/architecture/V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`; `LEDGER` = `docs/operations/V06_DELIVERY_STATUS_LEDGER_20261115.md`; `CU` = current consumer four-contract handoff; `INV` = evidence-grounded investigator decision; `CTX` = proactive science/condition selection handoff. Exact owner/specialist IDs are retained in source files; one row may encompass multiple tests and requirements.

### B1. Account, permissions, privacy, product modes (16 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B1-01 | Account registration, login, session/auth, recovery and account separation | `FOUND` auth/routes; real hosted/isolated end-to-end status per receipt; preserve cookie/CSRF/session controls |
| B1-02 | Secure Profile, demographic source age/year/sex/units, edit and revision | `FOUND/PARTIAL`; old profile corrections/source identity remain; no inferred clinical demographics |
| B1-03 | Saved goals, exclusions, dislikes, diet patterns, independent allergy/safety context | `FOUND/PARTIAL`; no second preferences database |
| B1-04 | Everyday/Athlete modes and context-specific navigation/theme | `FOUND/PARTIAL`; Athlete not contingent on Coach |
| B1-05 | Optional consented Coach professional mode and athlete sharing | `SPECIFIED/GATED`; permissions/roles/denials/credential/records distinct |
| B1-06 | Independent medical/genetic/microbiome/AI/research/coach consent by purpose | `PARTIAL/GATED`; no implied cross-purpose rights |
| B1-07 | Record/source revision, user ownership, corrections, withdrawal and audit | `FOUND/PARTIAL`; high-risk shared boundary |
| B1-08 | User health export/delete/retention and consent revocation dependency cleanup | `PARTIAL/GATED`; distinguish already downloaded data from future access |
| B1-09 | Server-held encrypted private fields/Neon security | `FOUND` existing AES-GCM; not end-to-end encryption |
| B1-10 | Local-private encrypted vault/user controlled gateway/BYODB | `SPECIFIED/GATED` synthetic-only; no active routing or live customer deployment |
| B1-11 | Native iOS SwiftUI/HealthKit, optional companion and secure local storage | `DEFERRED/GATED` late approved native path, **no Capacitor** |
| B1-12 | User-controlled optional future research-contact preference, default OFF | `SPECIFIED/PARTIAL`; *contact interest ≠ research consent* |
| B1-13 | Participant-controlled nonprofit/commercial research, future cohort sharing | `DEFERRED/GATED`, Canada/US first, optional EU/EEA future |
| B1-14 | Internal experimental access/feature flags, tester rights and expiry/standing grants | `FOUND/PARTIAL`; V06-EXP-01 tested metadata; do not infer release entitlement |
| B1-15 | Scientific/clinical feature release classifications; 52-feature provisional Legal registry | `SPECIFIED/GATED`; source registry not permission to turn features on |
| B1-16 | Provider authorization, model-specific routing, budgets, protected egress and spend ledger | `FOUND/PARTIAL`; no external personal-health transfer and current deployment pause |

### B2. Onboarding, navigation, consumer presentation and access (14 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B2-01 | Optional first-run quick start with skip and working log-food path | `FOUND` existing `EverydayStart.tsx`; not equal to final guided 3-step |
| B2-02 | Designed 3-step Goals→About you→Health context (A07/A08/A09/A10/A12) | `SPECIFIED` with finished art; import owner originals once, preserve actual Save/Exit/resume |
| B2-03 | Six image-backed primary goals, legacy goal mapping, no per-goal program engines | `SPECIFIED`; source design assets not proven in repo |
| B2-04 | Optional grouped medical-condition searchable checkbox selector/custom/legacy | `SPECIFIED/PARTIAL`; reuse `contextSchema.conditions` |
| B2-05 | Honest sparse-data landing, no upload wall, optional useful first action | `PARTIAL/SPECIFIED`; UX-A/UX-J; no fabricated personalization |
| B2-06 | Today one scientifically admitted non-safety action/question or intentional silence | `PARTIAL/SPECIFIED`; meal planner has multiple alternatives that are NOT competing wellness nudges |
| B2-07 | One canonical recommendation/action ownership across Today/Nutrition/Progress/Insights | `SPECIFIED/PARTIAL`; do not build orchestration before scientifically admitted producers |
| B2-08 | ACTION feedback Why, More, Not relevant, Already doing, Maybe later, safe revision | `PARTIAL/SPECIFIED`; existing feedback types differ, don't coerce |
| B2-09 | Optional VOI Yes/No/Not sure/Skip, relevant Yes→canonical detailed correction | `SPECIFIED` VOI-A–M; do not invent medical causation or shadow question service |
| B2-10 | Gentle/low-number display, quiet mode, no shameful motivation, calibrated cues | `SPECIFIED/PARTIAL`; optional, avoid new mode engine |
| B2-11 | Three main mental destinations Today/My Biology/Progress, task→detail→return | `SPECIFIED/PARTIAL`; preserve existing deeper routes and actual controls |
| B2-12 | Clear empty/error/loading/offline/revoked/no-permission states, accessible navigation | `FOUND/PARTIAL`; do not show “nothing new” when checks failed |
| B2-13 | Cohesive botanical Everyday, blue Athlete, future purple Coach; responsive desktop/tablet/mobile | `PARTIAL`; asset registry and visual DNA; preserve approved imagery/charts |
| B2-14 | Image-backed page headers, Ferritin/LDL editorial, 25 chart families, BVA 28+ artworks and biological portrait styles | `PARTIAL` per source/asset; do not regenerate approved owner files or install static fake user data |

### B3. Food, nutrition, hydration and practical daily guidance (17 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B3-01 | Five-way Add Food entry, typed search and manufacturer/source disambiguation | `FOUND/PARTIAL`; one canonical draft/save; don't clone entry |
| B3-02 | Exact barcode/GTIN Canadian/US products, NIH DSLD for supplements | `FOUND/PARTIAL` verified narrow UPC source path; public live availability separate |
| B3-03 | Manual, generic, raw cooked/portion/brand/product label entry and reviews | `FOUND/PARTIAL`; unknown composition ≠ zero |
| B3-04 | Recipe, homemade mixed dish, ingredient add/change/remove, arbitrary row counts | `FOUND/PARTIAL`; no ingredient truncation or hidden portion replacement |
| B3-05 | Meal journal, revision, source-preserving correction/delete/retry/history | `FOUND` scoped tests; no auto-consumption |
| B3-06 | Favorites, recent meals, saved templates, repeat with edited portions | `FOUND/PARTIAL`; template ≠ consumed meal |
| B3-07 | Actual confirmed foods/labels and consumed supplement day/period totals | `PARTIAL`; check complete combined-source coverage, duplicates, source form |
| B3-08 | Food source ingestion USDA/FNDDS, CNF2026, source-native nutrient and household portions | `FOUND/PARTIAL`; 5,431 FNDDS foods/22,188 portions receipt, broader CNF rights/mappings open |
| B3-09 | LOINC, UCUM, Canadian DRI, EAR/RDA/AI/UL/CDRR source-qualified reference infrastructure | `PARTIAL`; no missing nutrient imputation or ideal-person score |
| B3-10 | Macronutrients, micronutrient completeness, nutrient form, actual source coverage | `PARTIAL`; preserve existing nutrient registry/snapshot versions |
| B3-11 | Evidence- and context-grounded micronutrient/gut/metabolic dietary guidance | `PARTIAL/SPECIFIED`; no vitamin adequacy diagnosis from an incomplete journal |
| B3-12 | Specific sourced Today dinner after breakfast/lunch, editable portions and substitutions (Food #12) | `PARTIAL` user-valued Core, still approved despite P1-first queue |
| B3-13 | Multiple protected goals, nutrition constraints, feasible Eat–Move–Recover tradeoffs | `PARTIAL`; one canonical action selection, no optimizer replacement |
| B3-14 | Photo-assisted meal logging → candidate list → common user-reviewed editor | `SPECIFIED/GATED` (V06 §24), separate permission/source benchmark, not general-release |
| B3-15 | Restaurant discovery, chain/market/menu sizes/modifiers, verified official vs generic labels | `SPECIFIED/GATED` (V06 §26), manual fallback required; **hidden in short startup map, not deleted** |
| B3-16 | Hydration/sweat/fluid log and Athlete fueling calculations | `FOUND/PARTIAL`; actual vs estimated sweat sodium and fluid context |
| B3-17 | Fast manual offline/outage, source trust and no-paid-provider fallback | `FOUND/PARTIAL`; cannot advertise provider integration without live rights |

### B4. Bloodwork, laboratory source, medical context (15 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B4-01 | Date-stamped individual lab analytes, original units, lab, method/reference and report grouping | `FOUND` canonical schemas/reader, method comparability partial |
| B4-02 | Original PDF/photo/text extraction, verbatim row, OCR/VLM candidate, reviewed deterministic mapping | `SPECIFIED/PARTIAL` LAB-X-01..14; never promote unconfirmed source |
| B4-03 | Unmapped/source-only analytes, lab family identity, native qualifiers and uncertainty | `FOUND/PARTIAL`; avoid silent deletion/reclassification |
| B4-04 | Lab date/time precision, specimen collection, draw/source corrections, revision history | `FOUND/PARTIAL`; preserve date-only vs timestamp |
| B4-05 | Lab unit/assay and reported-range provenance, manual correction overlays and approval | `FOUND/PARTIAL`; source reference ≠ validated personalized clinical target |
| B4-06 | Longitudinal comparable plots, multi-observation charts, actual difference and original-point deep links | `FOUND/PARTIAL`; no fabricated comparable trend |
| B4-07 | Full-panel (>30 marker) Response #15, meaningful marker selection and multi-domain interpretation | `PARTIAL` still Core scope; not a triglyceride-only ruleset |
| B4-08 | Evidence-backed marker biological meaning and dynamic individualized *qualified* explanation | `PARTIAL/SPECIFIED`; no static same paragraph or unsupported outcome |
| B4-09 | Absolute clinical/interval meaning + temporal trend + independently eligible RCV | `PARTIAL/SPECIFIED`; RCV analytic CV_A/CV_I not blanket available |
| B4-10 | Differentiate statistical RCV, physiological applicability and independently reviewed clinical limits | `SPECIFIED`; no universal confounder suppression |
| B4-11 | Four context lifecycles: long states, short events, specimen condition, display preference | `SPECIFIED/PARTIAL`; pregnancy/medications/fasting already exist |
| B4-12 | Optional menopause/postpartum/therapy, illness/exercise, drug changes, shift work, fasting/context timing | `SPECIFIED/PARTIAL`; only material user-asserted facts, date precision and scope |
| B4-13 | VOI targeted missing-context question and user-initiated canonical update | `SPECIFIED`; science eligibility *before* questioning |
| B4-14 | Appropriate professional follow-up boundary, abnormal range and medication-dose protection | `SPECIFIED/GATED`; no automated diagnosis or dose adjustment |
| B4-15 | Patient-readable reported panel chronology, batch/re-import match review and undo | `FOUND/PARTIAL`; prevent duplicate/over-merged reports |

### B5. Microbiome, genetics, molecular biology and Scientific Explorer (13 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B5-01 | Viome native/offline microbiome import and metadata/report/assay quality | `FOUND/PARTIAL`; no assumptions from qualitative vendor scores |
| B5-02 | Microorganism source-native taxonomy, abundance, report revisions and actual date | `FOUND/PARTIAL`; missing ≠ undetected/absent |
| B5-03 | Microbiome list, organism profiles, 94 original names, 11 morphology families and neutral unknown fallback | `FOUND/PARTIAL` source/render review; do not declare individual morphology real microscopy |
| B5-04 | Larger curated microorganism catalogue (~190 seed), taxonomy/synonyms and source-linked profiles | `SPECIFIED/PARTIAL`; seed is not measured user presence |
| B5-05 | Genetics/variant provenance and assay-compatible user source import/selection | `FOUND/PARTIAL`; genotype ≠ functional expression |
| B5-06 | Reviewed gene, enzyme, protein, substrate, reaction, metabolite and host-target explanations | `PARTIAL/SPECIFIED`; no unsupported gene-to-clinical causal leap |
| B5-07 | 16-study Biological Explorer original evidence integration and null/harms/source ledger | `SPECIFIED/PARTIAL`; inspect exact 16-study matrix before claim |
| B5-08 | Distinguish association/capability/measured expression/metabolite concentrations/simulation | `FOUND/PARTIAL` contracts; forbidden automatic upgrades |
| B5-09 | Graph/pathway explorer with progressive accessible scientific detail | `FOUND/PARTIAL`; optional for consumers, not mandatory for useful Today |
| B5-10 | Actual human vs microbial functional evidence, method/strain and sample comparability | `PARTIAL`; no hidden imputation |
| B5-11 | MICOM/COBRApy/AGORA/reference organism community metabolic modeling | `PARTIAL/GATED` synthetic research only; no personal flux claim |
| B5-12 | Real licensed Web of Microbes and other data rights/model readiness evaluation | `SPECIFIED/GATED`; open model-use/training rights |
| B5-13 | Structured biological digital twin/narrow prediction modules and independent reference comparison | `SPECIFIED/PARTIAL`; advanced tiers remain research until validated |

### B6. Biological investigator, reviewed knowledge and evaluation (14 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B6-01 | Account-scoped read-only private evidence snapshots and source epochs | `FOUND` canonical labs/food/confirmed supplements; activity currently **not-collected** in investigator snapshot |
| B6-02 | Private source user context incl actual activity/medications, genetic/biome only with permission | `PARTIAL`; **priority source gap** activity cannot be implied from unrelated Activity UI |
| B6-03 | Multiple unfamiliar, testable hypotheses, alternatives and discriminating observations | `PARTIAL` contracts, real-model reasoning not demonstrated |
| B6-04 | Bounded one-pass private investigation runner, cancellation, permissions, errors | `FOUND` engineering/synthetic only; not an installed independent science engine |
| B6-05 | Bounded two-pass hypothesis → nonpersonal reviewed research → contradiction → private reassessment | `SPECIFIED/PARTIAL`; genuine next INV-04 delta after checking worktrees |
| B6-06 | Public nonpersonal research-question adapter/Gemini controlled taskId and isolated external provider routing | `FOUND/PARTIAL`; provider tier, retention, rights, audit and live permissions remain gated |
| B6-07 | PubMed, Europe PMC, Crossref, ClinicalTrials and rights-eligible study provenance | `FOUND/PARTIAL`; existing retrieval and source lifecycle; no blanket full-text rights |
| B6-08 | Study extraction: endpoints, cohorts, effect direction, conflicting/null/harm and applicability | `PARTIAL`; independent source review mandatory to promote |
| B6-09 | Durable versioned nonpersonal science knowledge, signed policy/rollback/withdrawal, clean restore | `PARTIAL` technical SQL proof; candidate migration unapplied, independent source rights open |
| B6-10 | Exact canonical numeric source-value / recorded-difference validator (INV-05 subset) | **`FOUND / LOCAL_ENGINEERING_TESTED`** 43 PASS; completed bounded slice, do not redo |
| B6-11 | Scientific review/admission, provenance, safety and source freshness before private consumer presentation | `PARTIAL`; current adapter has no consumer activation |
| B6-12 | INV-HELDOUT-01 and INV-AI-DEDUCE-01 seven-case blind A/B/C evaluation | `SPECIFIED/GATED`; independent real scientific performance not established |
| B6-13 | Proactive newly reviewed relevant research observations with one useful qualified action/question | `SPECIFIED`; after P1/P2 and account authorization, not news-feed/second engine |
| B6-14 | Scientific model development, datasets, champion/challenger, calibration, leakage, negative/counterfactual tests | `PARTIAL/SPECIFIED`; independent source rights, original holdouts and reproducible results remain gates |

### B7. Move/Athlete/Coach, longitudinal behaviour, advanced features (15 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B7-01 | Manual Activity Log with actual steps (day/session), intervals, mixed components and sets | `FOUND`; distinguish manual date precision and unobserved activity |
| B7-02 | Recurring activity templates, weekday routine plans, pause/skip/reschedule/confirm performed | `FOUND/PARTIAL`; plan ≠ performed, own revision/history |
| B7-03 | Fast one-tap activity repeat and source-corrected historical activity | `PARTIAL`; no duplicate tracker |
| B7-04 | Athlete independent mode, profile, training planned/actual and session feedback | `FOUND/PARTIAL`; usable without coach or wearable |
| B7-05 | Training readiness three-state explainable daily guidance | `SPECIFIED/PARTIAL` V06-TRAIN-01; no numeric medical-clearance score |
| B7-06 | Post-workout sRPE, intensity/load, recovery explanation, weekly constraints | `SPECIFIED/PARTIAL` V06-TRAIN-02 |
| B7-07 | Athlete fueling, hydration, sweat rate, measured performance and recovery | `FOUND/PARTIAL`; source qualified |
| B7-08 | Progress goal tracking, dated body measurements and descriptive change | `FOUND/PARTIAL`; measured vs inferred/exposure uncertainty |
| B7-09 | Longitudinal N-of-1/experiments: baseline, intervention, outcomes, adherence/missingness | `PARTIAL`; not causal per-user experiment conclusions |
| B7-10 | Adaptive private action/plan revision from prior actual outcomes and feedback | `PARTIAL/SPECIFIED`; no inferred actual completion |
| B7-11 | Explainable one-action cross-domain Eat–Move–Recover priority/tradeoff | `PARTIAL`; no second action planner |
| B7-12 | Coach athlete-initiated relationships, verified roles, roster, template and assignment snapshots | `SPECIFIED/GATED`; not ordinary consumer-ready |
| B7-13 | Coach scheduling/multidisciplinary plans, scoped messages/reviews, grant/revoke | `SPECIFIED/GATED`; no default medical visibility |
| B7-14 | Optional human-approved AI coaching copilot with safety difference/permission gates | `SPECIFIED/GATED`; no automatic plan assignment |
| B7-15 | Device connections/Health Connect/HealthKit wearable actual records and sync coverage | `DEFERRED/GATED` native/client availability; avoid fake connected states |

### B8. Cross-cutting growth, editorial, support, research, accessibility (12 families)

| ID | Feature / function preserved | Source status / follow-up |
| --- | --- | --- |
| B8-01 | Source-aware semantic health explanations, What/Why/How evidence ladder | `PARTIAL`; actual interpretation without unsupported causal certainty |
| B8-02 | Explicit uncertainty and abstention, clinically material warning distinct from nice-to-know | `PARTIAL`; never suppress reviewed safety via ordinary dismissal |
| B8-03 | User-requested biological mechanisms/science Explorer with accessible text fallback | `PARTIAL`; do not build parallel mechanism dashboard |
| B8-04 | Connected Sources overview with status/last true sync/disconnect and manual fallback | `SPECIFIED/PARTIAL` V06 §27 UX-SIMPLE-08; not prominent in condensed contract |
| B8-05 | Gentle source-based visual indicators, activity status, progress, quiet/balanced preferences | `SPECIFIED/PARTIAL` V06 §32 ENG-VIS; no shameful streak/extra dashboard |
| B8-06 | Stable in-app correction, conflict/retry/idempotent writes, back/cancel and account change | `FOUND/PARTIAL`; cross-surface acceptance remains |
| B8-07 | Responsive 320/390/768/1024/1440px, keyboard, touch, screen reader, zoom and contrast | `PARTIAL`; synthetic browser ≠ independent physical accessibility acceptance |
| B8-08 | Original visual asset registry, immutable approved binaries, rights and conditional art fallbacks | `PARTIAL`; independent assets and design vs production split |
| B8-09 | External provider licensing/limits, service costs, audit, timeout/fail-closed | `PARTIAL`; paid/new providers default blocked |
| B8-10 | Honest internal synthetic experiment preview with role/feature grant and safe error | `FOUND` narrow experimental metadata work; not medical product release |
| B8-11 | Real user utility/retention/comprehension, clinical misunderstanding/safety and accessibility evaluation | `SPECIFIED/GATED`; test suites are not human studies |
| B8-12 | Full integrated v0.6 candidate, source/UX/science/legal gate per feature and one owner RC | `SPECIFIED/GATED`; not automatically completed by code merges |

**Coverage:** 116 feature families (16+14+17+15+13+14+15+12) crosswalked to present long-form sources. This is **not** 116 active engineering tickets: many rows are foundations, current components, subcapabilities, cross-cutting quality gates or deliberately deferred specializations.

## C. Items liable to disappear from view without a scoped feature index (NOT confirmed deleted)

| At-risk feature | Why easy to overlook | Required disposition, without changing queue |
| --- | --- | --- |
| Photo meal logging | V06 §24, absent from compact active task map | Keep as conditional source/private model feature; one editor, not duplicate Food stack |
| Restaurant-specific menu/data | V06 §26, not mentioned as dedicated map row | Preserve honest manual chooser; full menu sourcing/licensing P3/P4 when eligible |
| V06-TRAIN-01/02 | Only broadly described in compact Athlete/Coach row | Explicitly retain two distinct acceptance contracts; no speculative readiness scores |
| Connected Sources UX | Historical V06 §27, doesn't have its own current task | Keep as later scoped UX acceptance, source truth rather than fake sync |
| Quiet/motivation preferences | Historical V06 §32; low-number mode is *not* same preference | Preserve independent quiet/celebratory preference when meaningful, no new dashboard |
| Research-contact option vs actual research | Source in V06/AGENTS, easy to conflate with no research access | Retain default-OFF invitation interest, NEVER treat as health-data/recruitment consent |
| 25 scientific chart families | Design archive/registry, fewer families integrated | Track exact per-asset delivery and genuine data-driven integration; not image regeneration or mandatory charts |
| Organism visuals/morphology 190 seed | Source ledger/registry, some portraits still neutral | Preserve originals, identify missing asset separately from unknown taxonomy/assay |
| Provisional 52-feature Legal registry | Historical V06 §31, not daily execution | Keep server release-class/purpose gate and independent Legal review; no second registry |
| User-owned storage/local/gateway and iOS | Privacy decision specified but not consumer enabled | Preserve future requirements without prematurely implementing an insecure parallel backend |
| Sex eligibility of dedicated female reproductive tracker | New §0B context-neutral hormonal/life-stage input could be misread as superseding it | Preserve existing explicit tracker gate unless owner expressly changes it; general hormone lab remains universal |
| C1–C6 practical Core delivery | P1 scientific emphasis/short queue could be mistaken for deleting Food/Response | Preserve full v0.6 frozen scope and resumable eligibility after P1/P2 |
| Original external source rights / cost and independent tests | New compact policy can look like a shortcut around provider/release checks | No legal/science/phys-device claims without actual source and gating evidence |

## D. Duplicate implementation patterns explicitly forbidden

- Legacy Insights experimental scores or bacteria-gap estimates **must not** become a second endorsed biological intelligence authority or substitute for reviewed candidate admission.
- Food entry (text/barcode/label/photo/restaurant/repeat) is **one editable canonical meal draft and deterministic save**, not five journals or nutrition calculators.
- Original Today meal planner choices coexist with the **one unsolicited admitted wellness attention item**—not a new suggestion engine.
- Goal/sex/condition information is owned by existing Profile/precision context; no six-goal engines, parallel condition taxonomy stores, or life-stage databases simply from illustrative forms.
- Timed acute illness/exercise/medication changes, sample fasting/draw times and presentation low-number preference have separate lifecycles; not one universal confounder label and not an analyte × drug matrix.
- RCV statistical eligibility, physiological applicability and independent clinical limits are **separate**; no universal rule suppressing all serial comparisons.
- Two-step VOI Yes is only an unspecified user assertion; existing `focusFeedback` semantics cannot be overloaded as clinical/medication evidence. No shadow Q&A store without approved narrow source contract.
- A12 onboarding is one assembled visual reference; older A07/A09 assets, A08 behaviour and A10 semantics are **ingredients**, not separate screens to ship.
- Reviewed public knowledge, private investigation and externally consented provider research are separate **trust** boundaries but reuse one reviewed evidence/source revision system; no second graph, recommender, or AI orchestrator.
- Web/server crypto and local synthetic gateway work are **not** E2EE, clinical data confinement on a compromised OS, or permission to offer live BYODB.

## E. Recommended action without a new workstream

1. Keep the corrected **INV-05 bounded subset = engineering-tested**, with exact file/receipt and no duplicate work. Select the next actual unblocked INV-04 need after inspecting latest worktree, including the activity snapshot gap and two-pass contradiction/evidence loop.
2. Record this audit as **reference only**. No automatic new queue rows or feature build triggered by its 116 family inventory. Keep existing `NEXT_ACTIONS.md` P0→P4 and scoped test/anti-overbuild controls.
3. On each future current task, use one matrix row as the **preservation crosswalk**: verify current HEAD/source/test; label `REUSE / NARROW CHANGE / DEFER`, implement only the real difference and preserve all inherited UX/source/rights/consent acceptance.
4. Correct stale “Current next actions” in the 2026-11-15 ledger by marking it **historical** rather than replacing prior verification evidence.
5. Flag the female reproductive tracker eligibility vs opt-in general physiology context distinction to the owner **only if actual proposed code conflicts**; no stealth override.
6. Separate status inventory: source/engineering vs hosted/device, independent scientific/safety review vs consumer release. Do not mark 116 families built or lost because they are or are not summarized in a short startup map.

**Bottom line:** Exact earlier requirements were preserved; there is **one confirmed stale active task**, **one real investigator missing-source integration** (activity), and multiple at-risk *discoverability* gaps in the short instruction index. No full-repository code/commit/hosted audit has been performed and no deployment/activation is authorized by this report.
