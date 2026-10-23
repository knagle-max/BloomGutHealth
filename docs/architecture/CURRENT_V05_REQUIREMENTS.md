# Bloom — Chief Architect Integrated Developer Handoff v0.5
**Date:** 2026-10-18 (America/Regina)  
**Status:** Amended v0.5 (revision 6, Amendment C: User Testing integration sign-off, mandatory P0 branding implementation, and before/after visual evidence), architect-integrated and approved for Developer backlog intake; Branding and Biology cross-specialist recommendation approvals now verified; Security conditional intake approval; Legal specialist proposed guidance newly integrated (not legal clearance); no implementation or public-launch sign-off  
**Repository:** `knagle-max/BloomGutHealth` | **PR:** #1 | **Reviewed head metadata:** `01638ec1ebf1d397602dcf330865956286b64c4c`  
**Owner:** Chief Architect & Integration Lead. Developer exclusively owns implementation, tests, repository changes and deployment.

## 1. Source evidence and important limits
- **NEW:** User Testing & Quality Experience specialist handoff, 2026-10-18, UT-2026-101–108. This is a source-informed persona walkthrough, **not** a hands-on usability study or live authenticated verification.
- **Design:** Marketing & Design `bloom_brand_delivery_v1` package, `specs/HANDOFF.md` (MKT-001–010), `specs/SCREEN_BLUEPRINTS.md`, `CONTENT_AND_SCIENCE.md`, and v1 approved tokens/assets. Existing v1 brand identity is **unchanged**. Recent design direction emphasizes reusable evidence insight cards, improved visual hierarchy and lab/biomarker presentation (reported as MKT-011–020 in Design thread); the **Formal Branding & UX Approval** has now been reviewed: Design approves UT-2026-101–108 (8/8) as requirements. The **Clinical Insights & Evidence UX Review** supplies the exact MKT-011–020 requirements. Neither signifies implemented-code, usability, or release approval.
- **Science:** original BIO-2026-101–108 plus Bloodwork Intelligence BIO-LAB-201–207 handoff (last reviewed same PR head).
- **Security:** BLOOM-SEC-001–010 dated handoff.
- **Developer:** PR #1 and `SPECIALIST_IMPLEMENTATION_STATUS.md` at above head (26 earlier recommendations mapped to implemented/tested portions versus unresolved acceptance work). This ledger precedes the new UT and bloodwork handoffs.
- **Prior architect handoff:** v0.4 remains the scope baseline. This v0.5 **adds** testing/integration requirements, it does not cancel unresolved security/science/lab items.

## 2. Architect integration decisions
1. **Preserve approved brand v1.0**: no logo, palette, token or identity redesign. Improve layout, progressive disclosure, onboarding and component behavior within approved assets.
2. **Do not duplicate delivered features**: Today action, saved meals, exact USDA/barcode paths, progress, experiments, Athlete workflows, sourced evidence and account data controls already exist in some form. New work is UX enhancement or independent verification.
3. **P0 has contextual meaning**: UT-101 and UT-102 are P0 for first-run usability acceptance, not an automatic claim that current deployment is unsafe. Security and lab escalation remain separate launch gates.
4. **No fixed demo nutrition presented as dynamic**: UT-105 is accepted as a concrete source-observed defect risk; implement unmistakable sample labeling and/or true computed behavior. Do not invent nutrient values.
5. **Consistent Evidence Insight pattern**: observed result → meaning and uncertainty → relevant action (if validated) → optional mechanisms/citations. Same model for labs, food, microbiome, genetics, Athlete and experiments; component reuse should not flatten domain-specific biological safety boundaries.
6. **Sensitive-data principle**: usability experiments run with synthetic accounts and fixtures; no real genetic, clinical or microbiome history in screenshots or analytics. For optional external AI/photos, respect explicit consent and existing provider restrictions.
7. **Missing-unit safety**: BIO-LAB-207 is the cross-cutting prerequisite for any lab dashboards relying on inferred units. Preserve original number and provisional unit status; do not promote unconfirmed guesses into personal clinical interpretations or urgent classification.

## 3. Delta backlog — incremental work for Developer
Statuses are architecture triage based on reviewed docs, not a claim of current code execution. Require Developer to map each to the existing 67-item and specialist ledger before creating tickets.

| Next ID | Source | Priority | Developer scope (delta only) | Acceptance / review owner | Current state |
|---|---|---|---|---|---|
| ARC-UT-01 | UT-101; MKT-009, MKT-002 | P0 first-use | Short, skippable Everyday first-run goal/restrictions/first-log path; useful action without tests or genetic data | Four-persona fixture walkthrough; measure task success/time/errors; Design + Testing | New UX request; baseline features exist |
| ARC-UT-02 | UT-102; MKT-005/007 | P0 Athlete first-use | Progressive Athlete setup: minimal sport/goal/body mass/schedule/safety context, advanced fields collapsed; maintain current risk blocks and records | Recreation/advanced personas, resume/partial/high-risk tests; Design + Biology + Testing | Source-observed dense form; not implemented as revised flow |
| ARC-UT-03 | UT-103; MKT-006 | P0 test gate | **Test, do not rebuild**, typing, USDA exact match, saved meal, barcode/manual fallback, consented photo, correction, portions, unknown-vs-zero, save success | Real-device + denied-camera + keyboard + network recovery evidence; Testing | Core functionality reportedly implemented; independent acceptance open |
| ARC-UT-04 | UT-104; MKT-002 | P1 | Extend existing TodayFocus prioritization to goal, relevant gap and scheduled session only when available/validated; abstain gracefully on missing info | Scripted no-meal/logged/partial/athlete/missing-data states; Biology + Testing | Existing contextual CTA; enrichment only |
| ARC-UT-05 | UT-105; MKT-001/008 | P1, early quick fix | Separate static 350-kcal/10-g-protein/8-g-fiber demo example from arbitrary edited meal text, or route typed text through trusted food computation | Change text and verify numbers never misleading; demo remains isolated from personal account; Testing + Biology | Source-confirmed risk, runtime impact unverified |
| ARC-UT-06 | UT-106; MKT-003/008; BIO-101/102 | P1 | Consistent progressive evidence hierarchy and wording with provenance taxonomy (reported/measured, modeled, association, experimental, unknown) | Comprehension cases including no evidence, negative/contradictory findings; Design + Biology + Testing | Existing evidence UI; independent comprehension open |
| ARC-UT-07 | UT-107; MKT-008; BIO-LAB-201/205 | P1 | Progress visual presentation for goals; dates, units, gaps, null outcomes, confounders, no causal conclusion. Pair lab charts with confirmation provenance | Synthetic improving/unchanged/worse/missing data across both modes; Design + Biology + Testing | Trend/check-in foundation exists |
| ARC-UT-08 | UT-108; MKT-005/007/008 | P1 verification program | Independent multi-session usability study: four personas, phone, keyboard, completion/errors/time/value, seven-day return. Build synthetic fixtures and record commit | Publish protocol, participant evidence, severity/rerun matrix, no fabricated satisfaction scores; Testing | Not run |
| ARC-LAB-01 | BIO-LAB-207; Design lab UX; SEC-004/009 | P1 implementation, P0 safety boundary | Partial import with unit suggestions marked “System guess — confirm”; source-value reinterpretation on correction; review queue; audit and downstream exclusion while unconfirmed | Conversion and ambiguity fixtures; safety exclusions; Biology + Design + Security | Not in reviewed implementation ledger |
| ARC-LAB-02 | BIO-LAB-201–205; MKT-008 | P1 | Extend longitudinal comparison, context-aware interpretations, evidence-linked actions and integrated markers in stages | Comparison compatibility, negative/null effects, clinical applicability; Biology + Design | Existing basic labs are foundation |
| ARC-LAB-03 | BIO-LAB-206 | P0 clinical release gate | Define reviewed critical-value escalation policy with clinician input before switching it on; show appropriate care-seeking pathways, not autonomous diagnosis | Clinical false-positive/negative case audit; Biology/qualified clinical reviewer + Security | **Do not activate from heuristics alone** |

## 4. Design × Testing alignment and conflicts
- **First-run vs safety:** Keep required allergy/contraindication context when relevant but do not require genetics, microbiome upload, advanced athletic targets or lengthy health questionnaires to obtain basic value. Unanswered high-risk inputs must trigger an honest limitation, not a silent pass.
- **Evidence insight cards vs screen density:** A common semantic contract supports domain consistency; default layouts present a single plain-language takeaway, clear observation status, and an optional evidence drilldown. Charts/complex details should not crowd Today.
- **Demo discoverability vs authenticity:** If sample numbers remain fixed, all numbers belong to a visibly fixed named example. Edited free text must not visually imply recalculation.
- **Retention study vs privacy:** Test with consented volunteers and synthetic records; do not inject third-party behavioral trackers into authenticated clinical views without separate Privacy review.
- **Athlete simplicity vs correctness:** Collapse advanced fields without dropping training-specific eligibility/safety gates. Advanced settings are not a separate profile or source of contradictory target rules.
- **Evidence labels vs unit inference:** A result with a guessed unit is a provisional imported record, never automatically a confirmed measurement. Same status in Today, Progress, precision ranking and exports.

## 5. Work already in progress / not new tickets
The current Developer PR ledger reports tests/foundations for shared rate budgets, same-origin mutation protection, bounded structured uploads/raw-sequence disablement, encrypted envelope key IDs, biological claim taxonomy, evidence audit endpoint, host–microbe reaction contract, structured experiments, Today primary action and responsive core routes. These **still require outstanding specialist/operational acceptance**, but do not reopen their already implemented portions as net-new features. Likewise user testing requests do not imply meal logging, Athlete fueling or charts are absent.

## 6. Recommended execution sequence
**Sprint A (highest incremental value):** ARC-UT-05 demo truthfulness; ARC-UT-01 beginner journey; ARC-UT-02 layered Athlete setup; ARC-LAB-01 unit confirmation contract and UX. Preserve regression coverage.

**Sprint B:** ARC-UT-03 independent meal-capture acceptance; ARC-UT-04 Today context; ARC-UT-06 evidence comprehension; ARC-UT-07 transparent progress. Extend BIO-LAB-201–205 as evidence-approved, and keep SCI/SEC open items from v0.4.

**Release-quality gate:** ARC-UT-08 study, accessibility at 200% zoom, real phones, clinical review for ARC-LAB-03, and outstanding public-launch security/operational requirements. No claim that these are already complete.

## 7. Developer response format and ownership
For each ID, return `Existing backlog ID | Existing code/tests | Delta proposed | Priority | Dependency | Commit | Tested evidence | Specialist review needed`. Report statuses as Received → Reviewed → Implemented → Tested → Specialist review, with deployment separate. Architect reviews conflicts and evidence; Developer alone executes changes. Developer should request the dated Branding review document and reconcile its exact decisions on UT-2026-101–108 and any MKT-011–020 revisions before claiming joint Design/Testing sign-off. This does not block independently approved, non-conflicting work.

## 8. Outstanding specialist approvals
- **Design:** A new review was reported by the product owner, but its verbatim content could not be located in accessible Project/Library files on recheck; ingest that exact review, map each UT ID to accepted/modified/rejected and publish updated stable IDs/acceptance. Retain brand v1 assets unchanged.
- **Testing:** Conduct real tasks, not code-only walkthroughs; confirm/revise UT-105 after hands-on demo testing.
- **Biology:** Sign off evidence semantics, lab unit catalogue, intervention and escalation policies.
- **Security:** Approve privacy for test analytics, consent prompts, unit-correction audit and full sensitive-data lifecycle.
- **Developer:** Recheck PR SHA at intake, reconcile old backlog/ledger, and implement approved deltas only.


## 9. Revision 2 — Branding review reconciliation protocol (2026-10-18)
**Source status:** Product owner reports the Branding Agent has completed its review. The exact new review was not returned by targeted Project/Library searches. Prior Branding v1.0 handoff and known layout guidance remain the supported source. Consequently this revision does not misrepresent the missing review as read or approved.

**Architect-level decisions that remain valid pending the exact review:**
- Preserve established brand v1.0 assets, colours, tokens, names and Everyday/Athlete identities. This is a layout/interaction refinement, not a rebrand.
- Keep Today / Explore / Progress as the existing Everyday navigation architecture.
- Treat UX feedback as specific deltas on the existing app: simple beginner onboarding, layered Athlete setup, trustworthy demo values, context-sensitive Today, readable evidence hierarchy, goal-based Progress and usability verification.
- Shared UI elements may express consistent visual language, but measurements, associations, experiments, unknowns and unit-inferred laboratory values retain distinct scientific and safety semantics.
- For all UT-2026-101–108 requirements, retain current acceptance criteria as provisional until the Branding review can be mapped line-by-line.

**Reconciliation matrix for the Developer (status is NOT design sign-off):**

| Testing ID | Existing handoff | Branding integration requirement | Open evidence |
|---|---|---|---|
| UT-101 | ARC-UT-01 | Skippable, visually compact goal/restriction/first-meal flow with value before optional testing | Obtain reviewed flow/copy from Branding |
| UT-102 | ARC-UT-02 | Quick/advanced Athlete forms in current blue mode; preserve safety prompts | Obtain reviewed screen and state rules |
| UT-103 | ARC-UT-03 | Consistent confirmation/error/retry states across food entry methods, no rebuild of working capture | Verify actual device usability |
| UT-104 | ARC-UT-04 | One salient Today action with reason, action and optional evidence | Obtain priority/layout rules |
| UT-105 | ARC-UT-05 | Edited demo text must never appear linked to static macro values; sample label or real computation | Independently verify UI behavior |
| UT-106 | ARC-UT-06 | Action → applicability → uncertainty → optional science detail | Validate comprehension and scientific copy |
| UT-107 | ARC-UT-07 | Readable chart labels, dates/units, gaps and partial measurements | Obtain screen states including unit correction |
| UT-108 | ARC-UT-08 | Test responsive, accessible, seven-day tasks in both experiences using synthetic data | Independent testing still not run |

**Change control:** Once the dated Branding review becomes accessible, amend these rows with exact source IDs, dispositions, rationale, acceptance criteria, and cross-specialist conflicts; do not issue duplicate implementation tickets. Developer should confirm the current PR head and implementation ledger before taking any item.


## 10. Revision 3 — Security cross-specialist review incorporated (2026-10-18)

**Verified source:** `Bloom_Security_Cross_Specialist_Signoff_2026-10-18.md` (18 Oct 2026; reviewed PR #1 head `01638ec1ebf1d397602dcf330865956286b64c4c`). Security *conditionally approves* UT-2026-101–108 and MKT-001–010 **for Architect intake**, not production, code, or usability sign-off. The original MKT source was reviewed on earlier SHA `550d549`; revalidate implementation on the latest head. These new XSEC IDs are **testable extensions to existing tasks**, not eight independent new features.

| Cross-specialist ID | Priority / integrates | Developer-only incremental work and acceptance |
|---|---|---|
| **XSEC-UT-01** | P0 · UT-101/102; MKT-009 | Beginner and Athlete onboarding: don't preselect consent; optional genetics/microbiome/labs remain skippable; require relevant safety information only for features requiring it; missing allergy/contraindication fields cannot mean negative. Include new/skipped/incomplete/high-risk fixtures. |
| **XSEC-UT-02** | P0 · UT-103; MKT-004/006 | Image and camera flows: per-request affirmative permission for external AI transfer, accurate purpose/recipient/retention wording, manual fallback, payload validation, no image logs or unintended persistence. Exercise denial, cancellation, errors, retries and provider failure. |
| **XSEC-UT-03** | P0 · UT-105/107; MKT-010 | Demo and session isolation: fully synthetic marked fixtures, demo editing cannot write personal history, no cached previous-account data via browser Back, UI, exports or errors; two-account negative tests. This *extends* existing source-reported cache protections; do not rebuild them blindly. |
| **XSEC-UT-04** | P1 · UT-108 | Research protocol: synthetic records by default, affirmative recording consent, pseudonyms, restricted storage, deletion timetable and verified redaction/deletion. Avoid production credentials/real health screenshots. |
| **XSEC-MKT-01** | P0 · MKT-004/009; SEC-009 | Privacy microcopy must match actual purposes, recipients, refusal outcomes, account deletion scope, backup retention and vendor practices. Security approval of *exact published text* required; no promises based on aspiration. |
| **XSEC-MKT-02** | P1 · MKT-005/007/008; SEC-005 | No personal measurements in query URLs, tracking, error tools, OG previews or unsolicited notifications; sensitive page/card/chart states cannot persist across account changes; visible text labels must carry risk/uncertainty meaning without dependence on color. |
| **XSEC-MKT-03** | P0 for publication · MKT-010 | Maintain evidence inventory for every privacy/security/compliance claim (owner, scope, vendor contract, technical evidence, review date). Avoid unsupported blanket claims including 'never stored', 'anonymous', 'HIPAA compliant', 'securely deleted', 'no AI retention'. Security approves before publication. |

### 10.1 Architect conflict resolutions

1. **Low-friction onboarding vs safety gates:** quick Everyday onboarding asks for only essential information; optional sensitive data never blocks ordinary food journaling. High-risk personalized recommendations/fueling require relevant safety context or safely abstain. No implicit 'no allergies' status.
2. **Convenient photo capture vs privacy:** local camera handling can proceed with device permission; *sending* an image to an external processor is a separate affirmative opt-in with an equally viable manual alternative. Don't confuse browser device permission with external processing consent.
3. **Helpful demo vs isolation/truthfulness:** edited sample meal text must never appear to recalculate fixed macro figures; either use live supported nutrition computation with explicit scope or detach clearly labeled illustrative numbers. Tests also prove zero writes to real user records.
4. **Privacy-focused brand promises vs system behavior:** user-facing deletion and retention explanations must follow the implemented data lifecycle, not the visual design's aspirational copy. Claims requiring unimplemented erasure or vendor assurances are blocked.
5. **Visual consistency vs clinical semantics:** common UI tokens and layouts are allowed, but measured lab value, unit-inferred lab value, hypothetical mechanism, microbiome association and experimental trend have distinctly labeled evidence states. Never use color alone.
6. **Research quality vs participant privacy:** Testing Agent should receive synthetic personas and non-sensitive fixtures from Developer. Consent, access and lifecycle of study recordings are required before real-user testing.

### 10.2 Updated developer execution sequence and ownership

**First / implementation verification:** check the latest PR head and `SPECIALIST_IMPLEMENTATION_STATUS.md`; map XSEC-UT-01–04 and XSEC-MKT-01–03 to UT and MKT tasks and pre-existing BLOOM-SEC-001–010. Do not reopen implemented session secret, rate-limit, safe structured-import or legacy score fixes without evidence of a regression.

**Next product and interaction batch:** implement the outstanding portions of UT-101/102/105 (simple/skippable onboarding, progressive Athlete setup, credible demo); include XSEC-UT-01/03 and exact MKT screen rules. Integrate UT-103 photo consent, handling and fallbacks with XSEC-UT-02. Integrate BIO-LAB-207 unit confirmation before bloodwork interpretation and charts. Existing nutrition/barcode workflows remain intact.

**Subsequent comprehension/progress batch:** UT-104/106/107 plus BIO-LAB-201–205, conditional BIO-LAB-206 policy; evidence-first copy, honest missing data and analytics privacy; apply XSEC-MKT-02. Biology must approve personal clinical interpretation and urgency rules before activation.

**Specialist acceptance:** Designer reviews task flows, identity and accessible layouts; Testing Agent conducts independent task studies; Security tests the XSEC and existing SEC controls and approves live copy; Biology reviews claim taxonomy, units, evidence/actionability and escalation. Developer supplies exact commit SHA, test artifacts, test accounts and findings. Architect signs off integration readiness, never substitutes for domain approvals.

### 10.3 Evidence and unresolved documentation

- **Verified:** Testing Agent eight-ID handoff; Security follow-on conditional handoff with seven XSEC requirements; original Security and Biology handoffs; BIO-LAB-201–207 bloodwork handoff; original MKT v1 package; Developer implementation ledger on PR head `01638ec1`.
- **Now verified:** “Bloom — Formal Branding & UX Approval” (Design approved 8/8 UT requirements for integration); “Bloom — Biology Cross-Specialist Review and Sign-off” (Biology approved MKT-001–010 and UT-2026-101–108 within scientific scope). The **Clinical Insights & Evidence UX Review** contains the exact MKT-011–020 recommendations. These requirements can now be reconciled for Developer intake, but MKT-011–020 have not received separate Biology implementation sign-off.
- **Security disposition:** conditional approval *for architect intake only*. **Public production release NOT approved.** This revision adds no new GitHub changes, runtime tests, deployments or clinical claims.

### 10.4 Evidence requested from Developer

For each mapped task return status (**Received → Reviewed → Implemented → Tested → Specialist review**), affected routes/screens, new/changed tests, SHA, responsive and keyboard coverage, consent-to-vendor traces, two-account isolation, demo no-write evidence, provenance of laboratory units, and specific unfulfilled acceptance points. Reserve separate columns for domain specialist pass/needs changes/not tested and public launch decision.


## 11. Revision 4: confirmed Design and Biology cross-specialist integration (2026-10-18)

### 11.1 Verified source and approval ledger
- **Formal Branding & UX Approval:** `Bloom_Branding_Approval_User_Testing_2026-10-18.md`, Design decision **APPROVE** for **UT-2026-101–108 (8/8)**, with specific design acceptance criteria. The review covers recommendations, not real usability results, implementations, or release.
- **Biology Cross-Specialist Review and Sign-off:** `Bloom_Biology_Cross_Specialist_Signoff_2026-10-18.md`, Biology **APPROVES FOR ARCHITECT INTEGRATION, SCIENCE SCOPE ONLY** MKT-001–010 (10/10) and UT-2026-101–108 (8/8). Scientific-language and clinical-interpretation acceptance remains pending on implemented UI.
- **Clinical Insights & Evidence UX Review:** `Bloom_Clinical_Insight_UX_Review_2026-10-18.md`, proposed MKT-011–020, reviewed against PR head `01638ec1`; this is Design guidance, not tested implementation or further Biology approval.
- **Security Cross-Specialist Handoff:** conditional intake approval plus XSEC-UT-01–04 and XSEC-MKT-01–03. Production not approved.
- **Baseline PR head for all these handoffs:** `01638ec1ebf1d397602dcf330865956286b64c4c`. Developer must refresh before implementation.

### 11.2 Accepted design dispositions for Testing IDs (replace prior pending-Design language)
| ID | Design approval and incremental UI acceptance | Additional gates |
| --- | --- | --- |
| UT-101 | **APPROVE P0** — beginner goal, restrictions, first meal, practical action; optional biology distinguished clearly; mobile and keyboard | Security XSEC-UT-01; Biology avoids unsupported personal relevance |
| UT-102 | **APPROVE P0** — short Athlete fields (sport, goal, body mass, schedule, necessary safety), optional advanced editable fields, shared record | Do not bypass clinical guards; XSEC-UT-01; Biology sport target review |
| UT-103 | **APPROVE P0** — source/serving/missing-nutrient confirmation, save/error states and recovery across existing entry methods | XSEC-UT-02 explicit photo consent; real-phone verification; unknown ≠ zero |
| UT-104 | **APPROVE P1** — enhance existing single Today focus with supported goal/session/journal context and useful missing-data fallback | No new duplicate CTA system; Biology validation |
| UT-105 | **APPROVE P1** — edited demo text must never appear to produce unchanged static macros; actual computation or explicitly separate fixed sample | XSEC-UT-03 demo isolation; Biology validates no invented data |
| UT-106 | **APPROVE P1** — action → relevance → limitations → optional mechanisms/citations; distinguish measured/reported/estimated/associated/unknown | BIO-101/102, independently measured comprehension; MKT-011/014/016 |
| UT-107 | **APPROVE P1** — dates, method, units, missingness; only compatible observed points; no fabricated smoothing or causal efficacy | BIO-LAB-201/205/207; MKT-013/018; XSEC-MKT-02 |
| UT-108 | **APPROVE P1** — four participant types, mobile+keyboard, predefined success/errors/time and seven-day follow-up | Testing Agent must execute; XSEC-UT-04 research privacy; Design reviews results |

### 11.3 MKT-011–020: one shared presentation system, not ten isolated implementations
| ID / priority | Developer delta, coordinated with earlier backlog | Scientific or security acceptance condition |
| --- | --- | --- |
| MKT-011 / P0 | Reusable Evidence Insight Card: observed value, units/date/source, comparable trend if valid, meaning, optional action and expandable provenance; field omission where inapplicable; responsive themes | Do not manufacture status, observed effects or comparable readings |
| MKT-012 / P0 | Prominent **“Unit assumed — confirm”** and original-value correction flow | Combine with BIO-LAB-207, not a second unit engine; preserve raw input and confirmation history |
| MKT-013 / P0 | Actual-date plots, dots, straight line segments, accessible data table, sparse/single-point states | BIO-LAB-201 compatibility checks; no unreviewed clinical direction labels |
| MKT-014 / P0 | Clear visual statuses for user-recorded, general research, modelled, unverified and unknown findings | BIO-2026-102 claim taxonomy; color never sole signal |
| MKT-015 / P1 | Microbiome provider-defined score and organism cards, searchable/keyboard accessible | Reported score ≠ personal health grade, activity or measured concentration |
| MKT-016 / P1 | Food composition → practical relevance → reviewed mechanism → limitations hierarchy | BIO-2026-101/105, source participation and portions; not imagined flux |
| MKT-017 / P1 | Athlete training/fueling/recovery cards in existing blue theme | Recorded vs target vs estimated kept distinct; no unsupported optimum claims |
| MKT-018 / P1 | Experiment results with baseline/follow-up, period, adherence, N, confounders and null states | BIO-2026-108; associations not causal proof |
| MKT-019 / P0 | WCAG 2.2 AA audit, screen readers, keyboard, contrast, accessible chart table, documented touch exceptions, reduced motion, 320px/200% zoom | Do not rely on color to imply biological certainty; independent Design/Testing acceptance |
| MKT-020 / P1 | Batch lab review rows with parsed source/value/unit/date/status, partial success and correction/confirmation | BIO-LAB-207 parser + privacy provenance; no silent assumptions saved as verified |

**Deduplication decision:** ARC-UT-06, ARC-UT-07, ARC-LAB-01/02 and MKT-011–020 represent **the same underlying feature family** where their scope overlaps. Create shared components/contracts and linked acceptance tickets, not independent competing chart, unit or scientific-card engines.

### 11.4 Science-specific acceptance additions from Biology sign-off
1. Test whether users can correctly identify measured, reported, estimated, associated, experimental and unknown information, including negative/null results.
2. A guessed unit—even plausibly guessed—stays visibly provisional. Unit correction must **reinterpret the original entered numeric value** in the newly confirmed source unit rather than transform an earlier inferred normalization. Incompatible methods/units must stop trend comparisons.
3. Validate safety-dependent onboarding and clinical advice; do not infer absence of allergies/contraindications or predict biochemical effects from genotype or taxa abundance.
4. Personal recommendation relevance requires real eligible inputs and reviewed evidence; visual emphasis must not increase scientific certainty.
5. Biology must sign off actual user-facing claim wording, lab interpretation and risk escalation before release. Design and Security approvals of requirement direction are not substitutes.

### 11.5 Explicit outstanding gates
- **No longer missing:** Formal Branding/UX approval for UT-101–108; Biology science-scope approval for original MKT-001–010 and UT-101–108.
- **Still outstanding:** Developer item-by-item reconciliation to latest head and 67-item backlog; implementation/testing of new scope; independent hands-on usability study; Security/privacy acceptance and operational checks; detailed Biology review of specific clinical insight outputs and critical values; specialized review of MKT-011–020 where relevant; final accessibility and release sign-offs.
- **Preserve:** original brand v1.0 asset package; Today/Explore/Progress navigation; existing working barcode/USDA/meal logging, auth hardening, and evidence registry.

**Architect authorization:** Rev 4 is approved for **Developer planning and incremental implementation** of the above non-conflicting gaps. It does **not** authorize unsupported clinical classifications, prognoses or claims, and is **not** a software release approval.


---
## 12. Revision 5 — Law Agent integration (October 18, 2026)

### 12.1 Source status and limits
**NEW VERIFIED SOURCE:** `Bloom_Legal_Regulatory_Specialist_Handoff_2026-10-18.md`, from `/Bloom/Agent Handoffs/`, dated 2026-10-18, Legal, Regulatory & Liability Agent. Sixteen stable IDs, LEG-2026-001–016. **Source status:** proposed guidance, not legal opinion, production clearance, independent source audit or commit review. The Law Agent independently reviewed no repository commit; it cites older scientific head `550d549` only as context. Developer must reassess at actual implementation SHA, not assume any P0 item is failed or already satisfied.

This annex supplements, does not supersede, prior Biology, Security, Testing, and Branding requirements. Scope is initially proposed **adult general-wellness and evidence-based nutrition education**, excluding autonomous diagnosis, prescribing, medical management, and unvalidated clinical triage. Geography, feature eligibility, monetization and distribution are **decisions to document**, not silently presumed.

### 12.2 Developer intake matrix — 16 legal requirements
Statuses for all rows: **Received / Architect reviewed for inclusion; implementation evidence not verified by Legal**. 'P0' indicates release-scope gate, not automatic emergency or instruction to implement a competing subsystem.

| Legal ID | Priority / launch applicability | Incremental developer deliverable and proof | Deduplicate / owner |
|---|---|---|---|
| **LEG-2026-001** | P0 public launch | Export feature-to-intended-use / population / territory / claim matrix, versioned feature flags and excluded-use tests; prepare a Canada SaMD and US FDA (if applicable) classification evidence pack for qualified counsel | BIO-102, LAB-202/206, claims registry; **Legal + qualified counsel decide classification**, not Developer |
| **LEG-2026-002** | P0 public claims / AI | One versioned, approved claims taxonomy/registry for displayed and AI claims, source, user context, uncertainty and approval; negative assertions tests (diagnosis, medication changes, reversal, unsupported microbiome levels, lifespan) and refusal paths | BIO-101/102, MKT-014/016/019, UT-106, XSEC-MKT-03; reuse evidence-audit and coach policy, no second claim engine |
| **LEG-2026-003** | P0 for high-risk advice | Unified contraindication/abstention/escalation matrix; relevant allergy, pregnancy, medication, hepatic/renal, eating-disorder and acute-symptom scenarios; do not promise emergency triage absent validation | BIO-LAB-206, BIO-105/106, XSEC-UT-01; clinical domain owner Biology plus qualified review |
| **LEG-2026-004** | P0 public launch | PIA/DPIA as applicable; end-to-end sensitive-data map of schemas, AI prompts, uploads, analytics, processors, hosting/residency, transfer and retention; explicitly state unknown facts | BLOOM-SEC-004/007/009, XSEC-MKT-01; Security technical evidence, Legal basis/jurisdiction |
| **LEG-2026-005** | P0 public sensitive-data workflows | Versioned, purpose-specific, opt-in consent for optional genetics/medical imports, third-party processing, research/model training, integration and marketing; withdrawal outcomes and transmitted-data tests | BLOOM-SEC-007/009, XSEC-UT-01/02, MKT-012/020; no duplicate consent records |
| **LEG-2026-006** | P0 public launch | Per-data-class retention/backup/processor lifecycle; tested access, correction, export, erasure, consent withdrawal and lawful exceptions; accurate descriptions of limitations | BLOOM-SEC-004/005/009, XSEC-MKT-01; reuse account lifecycle and key-management plan |
| **LEG-2026-007** | P0 public launch | Breach/incident response decision tree, on-call roles, incident log, preservation, notification assessment, vendor contracts and tabletop restoration exercise | BLOOM-SEC-010, XSEC-MKT-03; Security runs drills, Legal determines applicable notification obligations |
| **LEG-2026-008** | P0 public launch | Truthful versioned Terms, Privacy Notice, medical/AI limitations, contact, future billing/refund rules as applicable; acceptance timestamps and copy-to-code audit; counsel approval | MKT-008/010, XSEC-MKT-01/03; do **not** invent subscription policy before billing exists |
| **LEG-2026-009** | P0 commercial/public deployment | Dataset/API/licence attribution and commercial-rights ledger for USDA, journal imports, literature, genetics content, image/brand assets, dependencies, model vendors and contractors; evidence for contractual rights | BIO-101 sources registry, developer dependency inventory, brand asset package |
| **LEG-2026-010** | P0 public launch | Signed launch-market, age/eligibility, claims and channel matrix; adult-only option until minors review; market-gated functionality and accurate marketing/renewal/communications controls | UT-101/102, precision child restrictions, MKT-008, XSEC-MKT-03; Legal approves territories |
| **LEG-2026-011** | P1 now; P0 before new territory | Repeat classification, data, consumer and marketing checklist for each jurisdiction opened | LEG-001/004/010; no parallel country-logic engine |
| **LEG-2026-012** | P1 now; P0 if targeted supplements/doses/sponsorship | Reviewed dose, contraindication, interaction, pregnancy, age, regulated claims and commercial incentive gates; abstain for missing evidence | BIO-105, existing null-dose assessments, BIO-LAB-203; no dose activation by UX change |
| **LEG-2026-013** | P1; P0 high-consequence inference | Explain provenance, corrections and challenge process; inspect fairness/subgroups when relevant; human referral for consequential decisions | BIO-LAB-207, BIO-102, MKT-012/014, XSEC-MKT-02 |
| **LEG-2026-014** | P1; before monetized exposure review | Legal entity/IP chain-of-title, supplier terms, cyber/E&O/professional/CGL/D&O insurance consideration and broker/legal review | Product owner/legal operations; no unjustified engineering ticket |
| **LEG-2026-015** | P1, with P0 release change control | Versioned claim/prompt/rule approval, stop-ship/rollback process and scheduled law/regulator re-review | Evidence registry governance, BIO-101, developer release gates; one change log |
| **LEG-2026-016** | P1, with P0 complaint channel at launch | Accessible complaint/safety-report route, severity categories, owner, acknowledgement/escalation, evidence preservation and remediation workflow | XSEC security incident, BIO-LAB-206; distinguish complaints from emergencies |

### 12.3 Conflict decisions and blockers
1. **Wellness-first vs clinical UX:** Evidence Insight Cards (MKT-011–020) can display observed labs and reviewed lifestyle education, but status labels, recommended care pathways and critical alerts cannot turn Bloom into unassessed diagnosis or emergency triage. LEG-001, -002, -003 and BIO-LAB-206 gate such functionality. Where classification remains ambiguous, restrict or feature-flag the behaviour and obtain qualified legal/clinical evaluation.
2. **Frictionless onboarding vs lawful consent:** Preserve UT-101/102 short setup, but optional genetic or third-party processing must not be automatically selected, and risk-dependent exclusions cannot be skipped when necessary to the *selected* feature. LEG-005 and XSEC-UT-01 govern.
3. **Brand trust vs verified claims:** No absolute 'never stores', 'fully anonymized', 'clinically proven' or compliance certification without documented evidence and applicable professional approval. Brand voice cannot override facts about backups, providers or processing. LEG-002/004/006/008 and XSEC-MKT-03 govern.
4. **Biology accuracy vs legal classification:** Biology signs off scientific validity and safety terminology, but Legal/counsel must still classify marketed intended use. Scientific plausibility or disclaimer alone does not exempt device obligations.
5. **Health data vs analytics/AI:** Product capture success (UT-103), demo (UT-105) and external optional transcription must retain purpose-specific permission, data minimization, two-account isolation, vendor terms and retention. Existing technical gates may be partially implemented, require test evidence.
6. **No unnecessary implementation:** LEG-014 is mainly a product-owner/legal procurement deliverable; territorial legal opinion, insurer coverage and contracts cannot be completed by writing application code. Do not count these as code tasks or falsely certify them in CI.

### 12.4 Release acceptance matrix and responsibility
- **Developer:** Reconcile these 16 IDs with 67-item backlog, `SPECIALIST_IMPLEMENTATION_STATUS.md`, latest PR and existing controls; produce implemented/tested/partial/not-tested rows with code SHA, screenshots, representative API traces, migrations, claims copy, and automated tests. Sole engineering owner.
- **Legal Agent:** Review the actual release branch and functionality, approve counsel-facing classification, consent/policy wording, marketing and PIA/legal-risk dossier **conditionally**, recording residual uncertainties. Qualified external counsel provides jurisdiction-specific professional advice when appropriate.
- **Security Agent:** Test account isolation, secrets, processors, encryption/erasure, third-party transmissions, security controls and incident exercise. External pentest/security certification as needed; specialist review is not independent certification.
- **Biology Agent:** Approve actual outputs, scientific evidence, clinical safety exclusions, lab interpretation and negative tests. Qualified clinicians review high-consequence content as needed.
- **Branding Agent:** Implementable layouts and accurate user-facing copy, preserving brand v1.0 and evidence/consent clarity.
- **Testing Agent:** Real device, keyboard/screen-reader, synthetic personas and multi-session user comprehension; report observed evidence, not source-walkthrough inference.
- **Chief Architect:** Maintain one backlog and conflict record, integrate results and recommend go/no-go by scoped market/features.
- **Product Owner:** Decide launch markets, population, products and risk posture and grant final organizational release authorization, *only within legally permissible scope*.

**Legal verdict at intake:** NOT ASSESSED / NOT CLEARED; all new legal requirements are proposals pending evidence, not identified existing code failures. Public-release **NO GO** while any applicable P0 is absent/unverified; a conditional release assessment requires documented market/feature scope, evidence of P0 completion, qualified counsel input on material ambiguity and explicitly accepted residual risk. Existing Developer work on PR #1 is not retroactively classified as defective.

### 12.5 Immediate developer implementation order
1. **Scope / mapping (no code until design):** Inventory existing UI/API and launch regions/ages/claims; map each LEG ID to current status and exact test evidence. Define deferred/disabled clinical, raw-input, supplement, subscription and minors pathways.
2. **Shared safety and claims contract:** Join approved evidence/claims vocabulary to lab, food, microbiome, genetic, Athlete, Today, Explore, demo and AI outputs. Test abstentions and source-unit confirmation before high-stakes claims.
3. **Privacy/consent/data lifecycle:** Implement only missing purpose-specific processing controls, retention/export/delete and policy-to-data-flow proof; maintain synthetic testing and secure demo isolation.
4. **UI and verification:** Reuse existing v1 brand tokens, MKT-011 Evidence Insight Card components, MKT-012/013 lab unit/trend models and UT acceptance; ensure all legal notices reflect actual behaviour.
5. **Release evidence:** Compile data/asset licences, PIA, classification and territory dossier, approved wording, security testing, scientific acceptance, complaint routes and operation drills. Require independent sign-offs before public release.

### 12.6 Provenance of legal citations
The Law Agent lists Health Canada SaMD, FDA general wellness and clinical decision support, Canadian Privacy Commissioner PIPEDA, FTC Health Breach Notification Rule, Canadian Competition Bureau performance claims and CRTC CASL sources in its handoff. Those links are **source-reported**, not independently revalidated in this architect revision. Applicability depends on the *actual selected markets and functions*; no universal blanket legal conclusion is inferred.


---

## 13. Revision 6 — Integration Specialist + Branding conditional review (2026-10-18)

**Sources verified:** `Bloom_Integration_Specialist_Handoff_2026-10-18_SHARED.md` (INT-2026-101–112 and FREE-INT-01–06); `Bloom_Branding_Integrations_Signoff_2026-10-18.md` (MKT-INT-001–006). Integration reviewed no current commit; Branding reviewed integration requirements against PR #1 metadata head `01638ec1ebf1d397602dcf330865956286b64c4c`. **The separately reported User Testing review of integration handoff was not located in the accessible shared source search at revision time; its sign-off is pending, not presumed.** Branding conditionally approved all 12 INT requirements *for design/architecture planning*, not shipping or legal/scientific/security feasibility.

### 13.1 Architecture resolution and scope
1. **Platform gate:** Do not treat direct Apple HealthKit or Android Health Connect sync as an unconditional launch P0 until the Developer/Product Owner establish a native iOS/Android surface. Web/PWA-only cannot show native permissions or claim native sync. Native client decision is an explicit architectural dependency, not a UI task. INT-101 and FREE-INT-03/04 are conditional P0 by platform.
2. **Free-first constraint:** Avoid paid provider/aggregator commitments. Free API ≠ zero operating costs or commercial licence clearance. Do not claim existing accounts, API keys, contracts or connections. Withings, broad Oura/Garmin and aggregator work is deferred. Strava free pilot is P2, subject to access-policy diligence.
3. **No parallel ingestion or logging products:** Extend current USDA exact-food and barcode handling rather than rebuild. Canonical ingestion/storage and evidence/provenance standards should serve bloodwork, lab imports, workouts, biometric measurements, meals and hydration when corresponding features exist. This is a contract proposal pending Developer mapping.
4. **Legal/licensing gate:** Open Food Facts (OFF) read-only product lookup proposed, but mixing/persisting its ODbL data with USDA demands specific Legal review of attribution/share-alike/derivative database obligations before activation. Use a feature flag and do not call it 'shipped'. Verify third-party terms contemporaneously before implementation. LEG-009/010 and XSEC-MKT-03 apply.
5. **Data governance:** Per-metric source preferences, idempotent upserts, timezone/DST, modification/deletion propagation, no double counting, original measurement and normalized unit, import/collection times, inferred vs measured status, version and consent lineage. A revoked connection stops future sync; delete imported records is a distinct operation. INT-102/104/112, BIO-LAB-207, LEG-004/005/006 and BLOOM-SEC-005/009 share this work.
6. **User truthfulness:** Scans, photo, voice and receipt interpretations are editable drafts until explicit user confirmation. 'Purchased', 'planned', 'suggested' and 'consumed/logged' are distinct data states. Unknown nutrients remain unknown; a permission refusal/outage is not zero. INT-103/111, UT-103, BIO-102, MKT-004/016/020 apply.

### 13.2 Canonical integration IDs and disposition
| ID | Architect disposition | Developer intake and acceptance delta | Gate / mapping |
|---|---|---|---|
| INT-2026-101 | Conditional P0 for native clients only | Native HealthKit / Health Connect read permissions, incremental changes and deletes, dedupe and real-device checks; browser honest unsupported state | Platform decision; MKT-INT-001; LEG-005 |
| INT-2026-102 | P0 foundational contract when importing | Canonical type, raw/normalized values and units, timezone, source ID, revision/deletion, measured/estimated, idempotent upsert and conflict resolution; DST/duplicate tests | MKT-INT-002/004, BIO-LAB, SEC-005 |
| INT-2026-103 | P0 improve existing capture, OFF conditional | Audit existing USDA/barcode/recent meals; explicit editable serving/unknown nutrition, source ID; OFF behind licence gate; consented photo/voice where available | UT-103, MKT-INT-003, LEG-009 |
| INT-2026-104 | P0 when connections available | Connection centre with provider permissions, last sync, source preference and honest stop/revoke/delete/export states; no fictitious connected tiles | MKT-INT-001/002/005; SEC/LEGAL privacy |
| INT-2026-105 | Deferred | Withings feasibility/policy/cost and real source tests before marketing/implementation | Provider access proof |
| INT-2026-106 | Deferred broad; P2 Strava research/pilot | Provider matrix: fees, scopes, commercial terms, fields beyond hubs, rate limits, retention, dedupe | No availability claim |
| INT-2026-107 | P0 negative requirement | No new integration with retired Fitbit legacy API and no unsupported Fitbit marketing | Source policy verification |
| INT-2026-108 | P1 research | Assess Cronometer/MyFitnessPal/etc permitted export and actual food/nutrient coverage; avoid implied full micronutrient access | Licence/provider review |
| INT-2026-109 | P1 future | FHIR/institution/structured imports only with explicit analyte/unit/date/method/source review and unknown-safe interpretation | BIO-LAB-201/207; LEG-001/005 |
| INT-2026-110 | Deferred | Aggregator comparisons only when business case/coverage/cost/rights justify | Product Owner procurement |
| INT-2026-111 | P1 | Pantry/receipt and suggested meal entries must not automatically become eaten meals; clear editable capture state | UT-103, MKT-INT-003 |
| INT-2026-112 | P0 dependency gate for any new sync | OAuth/token scopes, consent, encrypted secret handling, webhooks, deletion propagation, audit logs, clinical interpretation boundaries; specialist sign-offs | SEC-004/005/009, BIO-102, LEG-004–009 |

**FREE-INT-01–06 mapping (not six extra standalone features):** 01 USDA→INT-103; 02 OFF→INT-103 behind licensing; 03 HealthKit→INT-101 conditional; 04 Health Connect→INT-101 conditional; 05 free native capture/favorites→INT-103; 06 conditional Strava pilot→INT-106. Key/credential facts in specialist handoff are proposals, not proof of provisioned accounts. Developer must not solicit production API secrets in chat or commit them.

### 13.3 Branding-approved UX subrequirements (all proposed, not shipped)
| Brand ID | Priority | Contract/acceptance | Deduplication |
|---|---|---|---|
| MKT-INT-001 | P0 on eligible connection feature | Just-in-time consent shows provider, categories, purpose, historical range, storage, Continue/Not now; native OS permission only following intent; no browser-native illusion | INT-101/104/112; UT-101; LEG-005 |
| MKT-INT-002 | P0 | Connected/Available/Needs attention/Disconnected, last successful sync, source detail, preferred-source conflicts and missing data ≠ zero | INT-102/104; UT-107 |
| MKT-INT-003 | P0 | Capture → inspect match/source → adjust portion/nutrients/unknowns → confirm → saved feedback; camera/voice manual recovery; groceries ≠ meals | INT-103/111; UT-103 |
| MKT-INT-004 | P1 | Consistent visual provenance: observed/entered/imported/estimated, provider, time collected vs synced, incomplete/unknown labels; accessible beyond colour | INT-102/109; MKT-011/014 |
| MKT-INT-005 | P0 | Separate stop future sync, revoke at provider, remove imported history, retain manual entries and export; realistic failure/retry/reconnect states | INT-104/112; SEC-009; LEG-006 |
| MKT-INT-006 | P1 | Product copy only claims tested, shipping capabilities by browser/PWA/native iOS/Android; no unsupported Fitbit/Withings/Garmin/Oura/clinical claims | LEG-002/009/010; XSEC-MKT-03 |

### 13.4 Next approved sequence for Developer
**Phase A — inventory and architecture decision (no new provider claim):** Recheck PR head and specialist ledger; document supported platform targets; audit exact existing USDA/barcode/capture; identify gaps and proprietary/vendor constraints. Resolve OFF legal data mixing decision before activation. Define canonical ingestion and deletion contracts with Security/Biology/Legal.

**Phase B — current-app UX and safe data integrity:** Improve review/confirmation/retry and source truth on existing meal paths, extend canonical records only where necessary, expose honest provenance/unknowns. Define Connections UX as a design specification; activate only real verified providers. Independently test source merge, duplicates, timezone transitions, interrupted sync, revocation and account switching.

**Phase C — conditional provider support:** Implement real HealthKit/Health Connect permissions, incremental/delta sync and device tests **only if native platforms are selected**; then expand provider matrix based on confirmed licence/access and budget. Deferred providers remain unadvertised.

**Acceptance evidence:** Each INT and MKT-INT row gets status Received→Reviewed→Implemented→Tested→Specialist review, branch/SHA, screenshots/API traces, contract tests, observed user-task evidence and applicable Security/Biology/Legal/Brand approvals. Need independent User Testing integration review before claiming that agent has approved these workflows. No public-release approval is conferred by this integration intake.

### 13.5 Unresolved cross-agent requests
- **Product Owner + Architect:** Determine browser/PWA-only versus native/hybrid platform roadmap; business constraints for vendors and countries.
- **Legal + Security:** Confirm OFF ODbL compatibility and data/processor/privacy contracts; provider terms; deletion and consent copy before enabling integrations.
- **Biology:** Approve aggregation semantics, biological provenance terms and representation of incomplete nutrition/biometric measurements.
- **User Testing:** Publish its integration-specific review and independently test provider consent, failed sync, duplicate reconciliation, capture save and revoke/delete scenarios.
- **Branding:** After architecture/platform decision, supply reusable provider-status, consent, conflict/source, capture/confirm and disconnect/retry visual specifications; brand v1.0 stays unchanged.

---

## 14. Revision 6 Amendment A — User Testing integration review verified (2026-10-18)

**New source ingested:** `Bloom_User_Testing_Integration_Review_Signoff_2026-10-18.md` in the shared `/Bloom gut health/` Library folder, read in full by Chief Architect. It reviews the canonical `Bloom_Integration_Specialist_Handoff_2026-10-18_SHARED.md`, INT-2026-101–112, FREE-INT-01–06 and the earlier User Testing requirements. **Disposition: APPROVED FOR CHIEF ARCHITECT CONSOLIDATION — WITH UX CONDITIONS.** This approves the *requirements*, not implementation, real-device tests, users' consent, vendors, legal or security readiness, or production release. Reference metadata: PR #1 `enhance/bloom-experience` at `01638ec1ebf1d397602dcf330865956286b64c4c`; the Testing specialist did **not** inspect a newer working integration or execute integration tests.

**Architect disposition:** Accept all seven incremental test findings **UT-INT-2026-109–115** for backlog intake as acceptance-test and user-journey extensions of canonical INT, UT, and MKT-INT items in §13. Do not create seven new parallel products or independently duplicate the existing onboarding, logging, ingestion, permissions, or progress components. The previously marked 'User Testing integration review pending' in §13.4 and §13.5 is superseded: **proposed-requirement review now verified**; actual independent usability execution and implementation sign-off still pending.

### 14.1 Canonical integration requirement dispositions from User Testing

| Canonical requirement | Testing verdict and mandatory UX acceptance refinements | Stage / mapping |
|---|---|---|
| INT-101 / FREE-INT-03–04 | Conditionally approved **if native app capability actually exists**. Test permission granted/refused/partial, unsupported browser/device, reconnect, source switch, overlap and deletion on real devices. No mandatory permission wall. | Conditional native; MKT-INT-001; UT-INT-109 |
| INT-102 | Approved essential. Values expose metric source, timestamp, unit, measured/entered/estimated status, freshness, missingness, correction and source priority; duplicates and timezone cases do not inflate totals. | Foundational for any sync; UT-INT-110/111 |
| INT-103 / FREE-INT-01,02,05 | Conditionally approved. **Reuse tested USDA/barcode/repeat logging**; editable product match, portion, nutrient incompleteness, uncertain allergen provenance and explicit save; OFF licensing unresolved; don't promise offline photo/voice absent real device tests. | Existing capture uplift; UT-INT-113; LEG-009 |
| INT-104 | Approved essential for *actually supported* connections: provider, permission/categories, last success/failure, data range, source preference, stop/revoke/delete/export choices. | Conditional capability surface; UT-INT-109/112 |
| INT-105 | Approve deferral of Withings pending access/terms/actual account validation; no live-sync marketing. | Deferred |
| INT-106 / FREE-INT-06 | Approve optional P2 Strava pilot; defer broader providers. Workouts preserve identity and partial-coverage visibility; no double-counting. | P2/deferred; UT-INT-114 |
| INT-107 | Approve prohibition on claiming retired/unsupported Fitbit connection; test unavailable/migration messaging. | P0 negative gate |
| INT-108 | Approve research only; distinguish food identity/servings vs nutrient totals vs daily summaries, no invented complete micronutrients. | P1 research |
| INT-109 | Approve future gated lab import: explicit analyte, original number, date, source, unit/method review, ambiguous/guessed/corrected unit journeys; abstain from unconfirmed clinical conclusions. | Future; BIO-LAB-207 |
| INT-110 | Approve aggregator deferral; compare actual user success and export/delete along with pricing and technology only when justified. | Deferred |
| INT-111 | Approve four distinct states: planned, purchased, proposed draft, actually consumed/logged. No photo/receipt-based phantom intake. | P1; UT-INT-113/114 |
| INT-112 | Approve prerequisite only, not technical certification; test user understanding of consent, revocation, deletion and retained copies. Security, Biology and Legal remain owners of substantive controls. | P0 feature gate; UT-INT-112 |

### 14.2 Seven acceptance-test additions (deduplicated, not seven separate feature systems)

| Testing ID | Priority | Implement/test only this delta | Existing work package / review owners | Status at intake |
|---|---|---|---|---|
| **UT-INT-2026-109** | P0 for shipping connections | Measure novice completion, cancellation and fallback for first connection with just-in-time scopes; partial permission, unsupported device, expired credential, outage, empty import, reconnection. Capture observed time, errors and comprehension on applicable devices. | INT-101/104; MKT-INT-001/002; ARC-UT-01; Security/Design/Testing | Proposal approved for architecture; tests not executed |
| **UT-INT-2026-110** | P0 for imported data displays | Moderated test: can users name each metric's provider, measurement/sync time, unit, measured/entered/estimated state, freshness and cause of missingness? A denied source must not appear as measured zero. | INT-102/104; MKT-INT-002/004; MKT-011/014; UT-106/107; Biology/Testing | Proposed test |
| **UT-INT-2026-111** | P0 for ingestion | Exercise two-source overlapping activity/steps/workouts, repeated sync idempotency, updated/deleted source record, persistent user preference, late-arriving records and DST/timezone boundaries. Verify one correct result and explainable conflict resolution. | INT-102/112; MKT-INT-002; SEC-005/009; Developer unit/integration + Testing comprehension | Proposed test |
| **UT-INT-2026-112** | P0 for connection lifecycle | Comprehension and technical journeys must distinguish **stop syncing**, **revoke provider permission**, **delete imported Bloom data**, and **export**. Verify account switch, revoke/reconnect, retained user-entered records and accurate confirmations. | INT-104/112; MKT-INT-005; LEG-005/006; SEC-009; Security/Legal/Testing | Proposed test |
| **UT-INT-2026-113** | P0 existing meal workflow acceptance | Five mobile tasks: recent/favourite; typed ordinary meal; barcode product; barcode failure/manual fallback; optional consented voice/photo editable draft. Track taps/time/corrections; 2-tap favourite target is a **goal**, not achieved evidence. Unknown nutrients/allergens/servings reviewed before saving. | INT-103/111; MKT-INT-003; ARC-UT-03; UT-103; Biology/Design/Testing | Existing functionality partly present; independent test needed |
| **UT-INT-2026-114** | P1 Athlete journey | Two-provider duplicate workout; edited/missing session; high/low workload; historical backfill; imported vs user-logged food; planned vs performed training. Fueling must never treat unlogged food as consumed or partial data as complete. | INT-101/102/106/111; MKT-017; UT-102/104/107; Biology/Testing | Proposed test |
| **UT-INT-2026-115** | P1 release evidence | One evidence row per shipping provider: platform, exact build SHA, tested real OS/device and permissions, account/fields/units, backfill, duplicate/correct/delete, restrictions, UX outcomes, reviewer, outstanding issues. 'Future' and vendor-restricted providers shown as **unavailable**. | INT-101–112; MKT-INT-006; LEG-002/009/010; Testing/Integration/Developer | Proposed evidence matrix |

### 14.3 Independent acceptance fixture matrix (specific testing obligations)

1. **Everyday beginner:** no health permissions or testing uploads; dismiss optional connection, manually log meal and still obtain a useful action.
2. **Everyday metabolic-health:** weight, steps and lab readings from more than one source; conflicting values, original/normalized units, correction, preferred source, trends and disconnect.
3. **Recreational strength athlete:** imported workouts, weight and food; duplicate activities, suggested vs recorded intake, training fuel and missingness.
4. **Endurance athlete:** multi-source exercise across timezone boundaries, hydration, gut tolerance and competition/travel fueling.
5. **Accessibility:** keyboard and screen reader, 200% text zoom, 320px viewport, reduced motion and announced recovery/error states.
6. **Privacy/lifecycle:** granular grant and refusal, expired auth, revocation, removal of imported history, account switch/export and disconnected-provider honest states.

**For each executed test record:** build SHA; tested platform, OS/browser/device; participant persona or clearly declared synthetic fixture; preconditions/steps; expected vs actual result; severity; pass/fail; task time and errors; whether a subsequent fix was independently retested. Do not fabricate satisfaction, timing or retention statistics. UT-2026-108 seven-day follow-up should include connected/disconnected cases instead of opening a competing study.

### 14.4 Updated sign-offs, gates and next Developer action

**Sign-offs now received for requirement consolidation:** Integrations proposal; Branding conditional approval for all 12 INT items; **User Testing conditional requirement approval** (now verified). Security and Legal remain responsible for actual consent, revocation, deletion, vendor data rights and policy-to-behavior checks; Biology for measurements, genetics/clinical language and missing-data semantics. No real provider, API key, native permissions or live data connection has been verified by these specialist handoffs.

**Architect rule:** Revision 6 is approved for Developer backlog reconciliation including the seven UT-INT acceptance rows. The Developer must first recheck the live PR SHA and ledger, choose native vs web targets with Product Owner, and map test rows against existing code/tests; then return a single status table with commit-specific evidence. Avoid implementation of conditional HealthKit/Health Connect without native platform, and avoid enabling Open Food Facts without legal licence decision.

**Supersession of earlier text:** Section 13's sentences implying 'User Testing review not located / publish review' are now **historical** only and superseded by this §14. All §13 platform, deferment and commercial/legal restrictions remain active. User Testing requirement-level approval is **not** live-user test execution, independent implementation sign-off, scientific clearance, security assessment or public release authorization.


---

## 15. Revision 6 — Amendment B: Approved brand asset implementation is P0 (2026-10-18)

**Architect decision:** Implementing the approved `bloom_brand_delivery_v1` asset and specification package is a **P0 product/visual acceptance requirement** for the next intended major Bloom experience release, not a P2 cosmetic enhancement. The former direction to *preserve* brand v1.0 means **do not redesign the approved identity**; it does **not** imply that its supplied assets/tokens were already implemented in PR #1. This section explicitly supersedes any earlier descriptions treating existing branch colours, logos, iconography or visual system as proof of actual brand-package adoption.

**Evidence:** Original asset package `bloom_brand_delivery_v1(1).zip` contains wordmarks, Everyday and Athlete SVG icons, raster icon sizes, monochrome icon, empty-journal illustration, `assets/design-tokens.json`, `specs/SCREEN_BLUEPRINTS.md`, `specs/HANDOFF.md`, `specs/CONTENT_AND_SCIENCE.md` and reference artwork. Earlier architect review of PR #1's changed-file names did **not** identify these asset files; the exact final UI appearance and any pre-existing equivalents require a fresh Developer code/runtime audit. Do not claim that no branding whatsoever exists: existing app CSS/modes do exist, but brand-package implementation has **not been verified**.

### 15.1 P0 brand delivery work packages — Developer owns code

| ID | Priority | Exact required scope | Acceptance evidence / reviewers | Status |
|---|---|---|---|---|
| **ARC-BRAND-P0-01** | **P0** | Inventory supplied original brand files and their placement relative to current `client` and public assets; produce source-to-implemented-file mapping, deduped against MKT-001–010 and MKT-011–020. Preserve original artwork and identity unless Design explicitly approves a justified derivative. | Asset manifest with every provided file accounted for: implemented, design-only reference, or exception approved by Branding; commit SHA | Architect-approved requirement; implementation **unverified** |
| **ARC-BRAND-P0-02** | **P0** | Integrate approved light/dark wordmarks, Everyday/Athlete icons and required icon variants, monochrome application and empty-journal illustration in appropriate app surfaces and app metadata. Supply accessible text, semantic alternatives and accurate theme switching. | Representative screenshots for onboarding, Today, Explore, Progress, Athlete, navigation and empty states; inspect actual served assets and app favicons; Branding sign-off | Proposed implementation; unverified |
| **ARC-BRAND-P0-03** | **P0** | Translate `design-tokens.json` into a single shared production token contract across existing CSS/pages/components; resolve drift among `index.css`, `workspace.css` and legacy guidance without silently changing approved colours/typography. | Token-to-code audit, light/dark and Everyday/Athlete responsive snapshot comparisons, automated checks where practical | Proposed implementation; unverified |
| **ARC-BRAND-P0-04** | **P0** | Implement approved `SCREEN_BLUEPRINTS.md`, `HANDOFF.md` and relevant `CONTENT_AND_SCIENCE.md` visual and content specifications for first-run, Today, Explore, Progress, food capture, Athlete, insights and relevant shared components. Reuse existing functionality; do not produce duplicated screens or unsupported science claims. | Side-by-side real-build screenshots against provided reference/blueprint for mobile and desktop, acceptance matrix per screen; Design and Biology review where science is surfaced | Proposed implementation; unverified |
| **ARC-BRAND-P0-05** | **P0** | Meet keyboard/screen reader, 320px mobile, 200% zoom, reduced-motion, legible contrast, focus/error states and accessible controls throughout the new brand implementation. Ensure design quality does not displace explicit consent, unit uncertainty or provenance disclosures. | Real rendered device and accessibility test report; visual QA at multiple breakpoints/modes; User Testing independent acceptance | Proposed implementation; unverified |
| **ARC-BRAND-P0-06** | **P0 release gate** | Obtain **Branding Agent implementation sign-off on the exact candidate build SHA** by comparing shipped screens, icons and tokens with v1 assets; resolve material mismatches or record explicit approved exceptions. Keep Security/Legal/Biology and independent usability approvals separate. | Formal dated Branding review specifying branch/SHA, pass/fail per screen and asset, outstanding exceptions and screenshots; Architect checks sign-off | **Not granted** |

### 15.2 Mapping and precedence

- **Preserve approved identity ≠ preserve current branch styling.** This Amendment B clarifies §2(1), §13 and all prior brand-preservation statements; **use approved package as the visual source of truth**. The Developer may refactor old CSS to comply, while not inventing a new logo, palette or positioning.
- ARC-BRAND-P0-01–06 are **one P0 coordinated workstream**, mapping to original MKT-001–010, extended MKT-011–020, MKT-INT-001–006, UT-2026-101–108 and UT-INT-2026-109–115, **not six duplicate design systems**. Retain original specialist IDs and source handoff priorities for traceability; this architect-level P0 prioritization controls release readiness.
- Where a branding blueprint conflicts with scientific, safety, accessibility, privacy, source provenance or jurisdiction-specific consent requirements, Specialist and Architect review resolves the conflict; **visual polish never overrides P0 health/legal/security gates**.
- A consistent application of the actual delivered logos, icons, tokens and screen blueprints is a **major user-visible change from the current branch**, even though the approved *brand concept itself* remains v1.0.
- Future enhancement increments may land separately, but **the intended complete v0.5 visual release is not brand-accepted while any applicable ARC-BRAND-P0 item is unverified**. This does not imply every deferred integration must ship for a web-only release.

### 15.3 Developer next action

Check the live PR head; inspect `bloom_brand_delivery_v1(1).zip` and current app assets/components; return a screenshot-based brand gap analysis and an implementation plan linked to a SHA. Implement according to the original asset/specs with design review. In the consolidated backlog, mark all six IDs **Received → Reviewed → Implemented → Tested → Specialist review** as warranted by evidence; no status may skip to completed merely because the asset package exists. The Developer remains exclusive owner of code, testing and GitHub changes.


---

## 16. Revision 6 Amendment C — Mandatory branding before-and-after evidence (P0, 2026-10-18)

**Source:** Product Owner request for an independently inspectable visual comparison of the currently deployed/enhancement-branch UI against the Developer's implementation of the approved Bloom brand v1.0 asset package. **Architect decision:** APPROVED as a required evidence deliverable, not a replacement for Branding Agent design/code review. This supplements **ARC-BRAND-P0-01 through ARC-BRAND-P0-06**; prior requirements remain unchanged.

### ARC-BRAND-P0-07 — Baseline and final screenshot comparison (P0)
**Rationale:** The user and Branding Agent need to inspect the actual visual transformation rather than only a code diff. **Acceptance:**
1. **Capture baseline first.** Before changing any style/asset integration, check out the exact existing enhancement-branch commit; record full SHA, app build and screenshot timestamp. If changes have already begun, capture from an immutable pre-branding commit instead, with a clear provenance label. Never pass off a mockup as the baseline.
2. **Same-content paired captures.** Use deterministic synthetic fixtures, identical user persona/account/mode, route, theme, viewport dimensions, device pixel ratio, feature flags, experiment state, data density, network conditions and locale where practical. If matching state is impossible, document the difference and don't imply pixel-level comparability.
3. **Minimum screen coverage:** (a) Everyday Today dashboard, (b) Explore/search and food result, (c) food logging/confirmation, (d) Progress/lab trends, (e) Athlete home/workspace, (f) Everyday and Athlete first-run/onboarding states, (g) profile/settings/consent, (h) at least one genetics/microbiome/science/evidence insight screen, and (i) empty/loading/error states on representative screens. Capture relevant responsive mobile (320–390 CSS px), desktop (e.g. 1440 CSS px), and light/dark themes where supported. Flag unavailable screens explicitly rather than fabricate comparisons.
4. **Deliver a reviewable gallery:** before and after side-by-side by screen; original full-resolution PNG/WebP screenshots accessible individually; an index with route, persona, date, SHA, viewport, theme, and associated Bloom package asset/token/blueprint references. Optional slider/diff is supplementary, not a substitute for raw images. Prefer a versioned artifact bundle or PR-linked report and provide an accessible text change summary for each pair.
5. **Design fidelity evidence:** A mapping table from each approved source brand element (wordmarks, logos, icons, imagery, typography, palettes/tokens, Everyday/Athlete modes, responsive/navigation/screen blueprints, state and accessibility rules) to component/file and its before/after screenshots. Explicitly list approved deviations and missing work. Contrast/keyboard/zoom/reduced-motion results are separately reported; screenshots do not certify accessibility.
6. **Review/rework:** Branding Agent reviews actual images **and code** against v1.0 asset package, records Pass/Changes Requested/Not Verified by screen; Developer fixes and recaptures the *same final candidate SHA*; Chief Architect aggregates results, Product Owner can compare and approve before release. Independent User Testing reviews real usability separately. No image may be called final approved until Branding Agent has signed off on that exact build.
7. **Privacy and safety:** Only synthetic accounts and fictional health/genetic data in any screenshot or metadata. No personally identifying health data, session tokens, vendor credentials or confidential third-party assets may enter PR artifacts, demo shares or external galleries. Security to verify screenshots and artifact sharing approach.

**Evidence package suggested structure (Developer may choose equivalent):**
```
branding-comparison/
  README.md                 # screen matrix, SHAs, environment and exceptions
  asset-implementation-map.md
  screenshots/
    everyday-today-mobile-before.png
    everyday-today-mobile-after.png
    ...                      # analogous paired captures
  branding-review.md         # specialist decisions, defects, retests
```
**Lifecycle:** Received → Reviewed → Implemented → Tested → Specialist review. Implementation **not started/verified by this architect amendment**. **Ownership:** Developer captures/builds and maintains artifact; Branding reviews screenshots/code; User Testing evaluates usability; Security vets synthetic/public artifacts; Chief Architect consolidates; Product Owner provides final release authorization.

**Hard gate:** Full branding implementation (ARC-BRAND-P0-01–06) is **not accepted** for v0.5 visual milestone without this before/after package and Branding Agent review. Release-go/no-go remains subject to independent science/security/legal/usability gates; a screenshot gallery alone is not certification.


---

## Amendment D — Configurable and locale-suggested measurement units (2026-10-18)

**ARC-UNIT-001 — Independent user-configurable units (P1 UX; P0 correctness for affected workflows).**

**Problem:** Nutrition Profile currently defaults to `cm` for height and `kg` for weight, but users may prefer mixed systems. Locale-driven defaulting must never impose a metric/imperial bundle.

**Acceptance criteria:**
1. Suggest default measurement units from an explicitly saved region preference or non-precise app/device locale; clearly identify inferred defaults, avoid geolocation permission or IP-geolocation dependency, and permit first-use adjustment. Browser language is a hint, not reliable proof of residence. Always offer a usable fallback if locale is unknown.
2. Provide independent selectors: height `cm` / `m` / `ft + in`; body weight `kg` / `lb`; circumferences `cm` / `in`; hydration `mL` / `L` / `US fl oz` as applicable; temperature `°C` / `°F`; energy `kcal` / `kJ`; food serving units `g` / `oz`, volume/household measures only where food identity and density permit reliable conversion. Exact product serving-size facts and country-specific labeling retain source units.
3. Support combinations including `cm + lb`, `ft/in + kg`, and independently selected waist, fluids and food units. Never restrict combinations based on country/locale.
4. Canonical storage preserves original value, original unit, precision/source and normalized computational value; conversion changes display/entry semantics rather than overwriting historical observations. On a unit change, convert existing typed field values accurately or ask for confirmation; never reinterpret an unchanged number as a different mass/length.
5. Persist user preferences account-scoped across sessions/devices; make them available in Nutrition Profile and reusable account settings. Avoid leaking between two signed-in accounts or exposing sensitive data to telemetry.
6. Nutrition targets, BMI/body composition calculations (where applicable), Athlete fueling, meal plans, trends, lab/biomarker results, exports, charts and screen-reader labels use or explicitly preserve correctly identified units. **Clinical laboratory values:** never auto-convert between incompatible assay conventions; source/lab unit confirmation and BIO-LAB-207 take precedence over preference defaults.
7. Negative tests: locale unknown; Canada user preferring `cm + lb`; US user preferring `cm + kg`; `ft/in + kg`; unit toggle while a number is typed; round-trip conversion, rounding drift, no double-conversion; historic values; persistence; account switching; keyboard/mobile accessibility.
8. Preserve data provenance and acknowledge available source units; unknown density/serving mapping must not be silently inferred.

**Crosswalk:** INT-2026-102 normalized source-aware ingestion; BIO-LAB-207 original source-unit safety; MKT-012/020 lab-unit confirmation; UT-2026-101 onboarding; UT-2026-107 longitudinal trends; UT-INT-2026-110 provenance; LEG-2026-002 medical claims.

**Developer ownership / state:** Proposed for Developer intake; no implementation or tests independently verified. Developer owns code, tests, preview deploy and SHA evidence. Branding reviews unit control and accessibility; Biology reviews calculation/clinical correctness; User Testing confirms mixed-unit comprehension. Deploy to protected Render preview once safe minimum gates pass, without waiting on every specialist's final sign-off.

**Required before/after deliverable:** Capture existing Nutrition Profile (`cm`, `kg`) and revised field controls using the same synthetic account/viewport, plus a `cm + lb` and `ft/in + kg` example. Link running preview commit and report actual conversion test results under the standing major-change comparison policy when this is part of a larger UI transformation.


---

## 17. Amendment E — Uninterrupted Developer Execution Directive (2026-10-18)

**Priority: P0 execution policy. Effective immediately; this section supersedes *every earlier process, sequence, waiting condition or approval dependency in this handoff that conflicts with it*.** Product Owner reports development is stopping too frequently. The goal is to **complete implementation continuously**, deliver working protected Render previews, and obtain specialist reviews in parallel rather than requiring serial handoffs.

### 17.1 Default mandate: implement, do not stop for routine approvals

1. **Proceed through the whole v0.5 backlog without returning for permission at every item, feature, phase, PR, or commit.** The Product Owner has authorized continuous development within the agreed scope. Do not request repeated authorization to continue, to push to the existing review branch, to produce artifacts, or to update the protected Render development preview.
2. **No phase-boundary halt.** Previous instructions such as “first return a plan/status table”, “await Architect review before implementation”, “wait for specialist sign-off before starting the next task”, “obtain approval before applying branding” or “provide a review package before proceeding” are superseded **as execution blockers**. The Developer may make and record decisions while continuing work. A brief implementation/status report accompanies completed work, not a prerequisite to begin the next milestone.
3. **Specialist feedback is asynchronous to feature development.** The Developer may implement proposed requirements, run tests and publish preview-ready changes while Branding, Testing, Security, Biology, Legal, and Integrations review. Integrate their findings as they arrive. Specialist approval statuses remain honest and independently tracked; approval is **not implied by a preview**.
4. **Architecture choices:** Make safe, reversible, well-documented choices using current repository architecture and approved handoffs. Do not ask open-ended technical design questions already resolvable from repo or prior requirements. Prefer incremental compatibility, feature flags for uncertain/externally gated components, and practical fallback behavior. Where native/mobile platform or vendor agreement is not present, implement useful web-ready interfaces/data contracts/UX without pretending unsupported connections exist; continue on other tasks.
5. **Do not block all work on one dependency.** If an external credential, licence, native entitlement, regulator/legal determination, paid vendor access or actual test participant is needed, record it as `External dependency / feature disabled`, keep any dependent feature off or simulated with conspicuously synthetic data, and immediately implement the next independent requirement. Never mark a blocked external dependency as resolved.
6. **Preserve security basics for previews:** before each protected Render preview, developer tests must cover build/startup, auth and tenant isolation for affected paths, absence of real user medical/genetic data and secrets, and no active unsafe medical claims or unapproved third-party health-data transmissions. These are **technical safety checks, not specialist meeting/signature prerequisites**. Incomplete/uncleared high-risk features stay disabled behind flags. An unsafe preview build should not be deployed, but the Developer should fix or isolate it and continue.
7. **Render preview is the default review surface.** Push tested incremental work to the existing development branch and deploy/update the access-controlled Render preview after meaningful slices. Provide the current preview URL (only verified real URL), branch/commit SHA, what changed and how to try it. Do not wait for all specialists or public-launch clearance. Preserve before/after screenshots for major transformations without halting coding pending their review.
8. **Developer owns engineering and self-coordination.** Developer alone edits code, GitHub, tests and deployment. Architect and specialists provide guidance, defects and eventual release sign-offs. Developer should *not* delegate implementation to specialists or require a synchronous handoff cycle.
9. **Only ask the Product Owner if a genuinely unavoidable decision is necessary** to proceed on a safety-critical choice, incur new money, provide credentials/sign legal agreement, select a native app launch, change core product scope, or grant public production release. Otherwise use approved defaults and continue. Do not claim autonomous approval for expenditure, external vendor terms, legally regulated medical functionality or public release.
10. **Keep developing within the active turn/task.** Avoid repeated “here is what I would do next” responses in place of implementing. If runtime or tool limitations prevent further progress, state exact blocker and completed work; do not assert unperformed code changes. For large tasks, deliver the largest viable completed increment, continue when supported by the environment, and do not promise background execution absent an explicitly scheduled capability.

### 17.2 Clear distinction among development, preview, specialist acceptance and launch

| Milestone | Authority / condition | Developer action |
|---|---|---|
| **Build and test features** | Already authorized as part of v0.5; no specialist sign-off needed to *start* | Implement continuously; track requirement IDs and tests |
| **Protected Render development preview** | Automated checks + basic privacy/security safety; no live unapproved clinical/vendor processing | Deploy continuously and provide accessible test instructions |
| **Specialist review and real-user validation** | Parallel/after candidate features; independent opinions and findings | Address findings incrementally, no blanket pause |
| **Public production release / new regulated feature** | Product Owner authorization plus applicable legal/science/security/regulatory controls and required clearance | Do not publish or activate uncleared functionality publicly |

### 17.3 Documentation is a lightweight by-product, not a development checkpoint

- Maintain one concise cumulative status ledger per implementation slice: `ID | code status | test status | preview commit/URL | external block | specialist review status`. Create/update it as part of normal commits; **never defer core coding because the ledger or all evidence packages are not yet complete**.
- Before/after packages remain **P0 milestone deliverables** for major UI/functional transformations, including the full Bloom v1 branding rollout, but their drafting and external review run in parallel with subsequent independent development. They block *final milestone acceptance*, not starting subsequent tasks or posting a safe preview.
- “Received → Reviewed → Implemented → Tested → Specialist review” is a traceability model, **not a strictly sequential approval chain**. Developer may advance implementation/testing while earlier reviews are pending; show true state separately instead of waiting or retroactively claiming approvals.
- The document's repeated instructions to have the Architect “approve” every implementation detail, reapprove a plan, await every provider confirmation, receive final screenshots, or wait for Human/Testing studies **are nonblocking during development**. Only the specific affected regulated/vendor feature remains disabled when approval genuinely cannot be skipped.

### 17.4 Immediate Developer action — no stop-and-wait response

**Upon receiving this amended handoff, continue implementing on `enhance/bloom-experience` using the latest repository head.** Deliver substantial working slices and refresh the protected Render preview, starting with actual brand assets/tokens and high-value current-web UX, followed by unit customization, meal capture, evidence/bloodwork, shared provenance and approved integrations. Capture baseline for before/after comparison from a prechange commit. Test, fix and keep moving through the rest of v0.5. **Do not stop at an analysis, planning, status-report or specialist-review stage when code work is independently actionable.**

**Superseded process passages:** §3's “require Developer to map before creating tickets”; §12.5's “no code until design”; §13.4's architecture-first standstill; §14.4's “must first return a single status table”; §15.3's “return gap analysis and an implementation plan”; §16's screenshot/review hard gate **as a precondition for more development**; and every mention of waiting for Architect/Branding/User Testing/Biology/Security/Legal approval *before independently safe coding or preview deployment*. **Substantive medical/privacy/licensing restrictions, no false claims, P0 implementation requirements, testing expectations, launch limitations and independent release sign-offs remain in force.**


---

## 18. Amendment F — Standing authorization for routine Git commits, pushes and review-branch deployment (2026-10-18)

**Priority: P0 execution policy. Product Owner instruction, effective immediately.** The Product Owner explicitly authorizes the Developer Agent to **create commits and push code to the existing GitHub development/review branch without asking for approval for every commit or push**. The Product Owner will review the resulting changes afterward. This section supersedes any earlier language in this handoff implying per-commit, per-push, per-PR-update or per-preview-deploy authorization.

### 18.1 Actions already authorized; do not interrupt development to request permission

- Implement, refactor, test, format and document changes within the agreed Bloom v0.5 scope.
- Create as many appropriately scoped local Git commits as needed; push those commits directly to the existing authorized `enhance/bloom-experience` development branch and update the existing PR #1 (or normal successor review branch/PR if needed for the same scope).
- Run CI, fix failures, amend follow-up commits, and redeploy the access-controlled Render *development preview* after safety checks pass.
- Update developer status/evidence, before/after screenshots and relevant PR descriptions/comments as part of the ongoing workflow.
- Continue through the next actionable backlog item immediately after pushing; do **not** pause to ask whether the Product Owner authorizes another commit, push or ordinary review-branch update.

**Authorization is standing, not one-time.** No repeated 'May I push?', 'Do you approve this commit?', or 'Shall I proceed?' questions for these routine actions. An individual tool or service may still enforce its own confirmation or credentials; the Developer should comply with actual platform permission boundaries and should not invent a workaround or claim a push occurred when blocked by a tool.

### 18.2 Actions NOT authorized by this instruction

- Merge into `main` or another production-protected branch; release publicly; change production settings or expose a public deployment without the applicable release process.
- Force-push, rewrite shared history, delete branches/repositories, weaken branch protection, or perform other destructive Git operations without specific need and authority.
- Commit API keys, secrets, real health/genetic data or identifiable test fixtures; bypass fundamental preview safety checks.
- Incur new expenses, accept binding vendor agreements or enable unreviewed high-risk medical functionality.
- Expand scope materially beyond v0.5 without Product Owner decision.

### 18.3 Required transparency AFTER action, not approval BEFORE action

Following meaningful implementation slices, report in concise form: requirement IDs advanced; commit SHA(s); PR/branch; tests run with pass/fail; actual Render preview URL/deployed SHA (if verified); known risks and external dependencies; relevant before/after artifact links. These reports are **informational and for post-hoc Product Owner review**, not mandatory pause points or implicit requests for approval. Continue other independent work if a specialist's review or an external dependency is pending.

**Core workflow: implement → test → commit → push to authorized review branch → deploy safe Render preview → summarize → continue.** Specialist sign-offs determine eventual acceptance/public launch, not permission to make normal development commits. No GitHub change is made by the Chief Architect through this amendment; Developer remains sole code/GitHub owner.