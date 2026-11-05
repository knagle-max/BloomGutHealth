# Bloom — Whole-product UX coherence corrective handoff
Date: 2026-11-05 | Owner: Branding & UX Specialist | Decision: **REVISE existing conditional visual acceptances**. This document does not redirect Codex; it is for Chief Architect reconciliation against authorized v0.5 work.

## Accountability and root cause
Prior reviews focused on individual components, evidence honesty, brand colours and separate acceptance contracts. They insufficiently tested attention competition, depth at first glance, user task priority, repeated page composition and plain-language translation across all surfaces. An accessible and scientifically correct panel is still harmful UX if it distracts from the primary action.

## Five product-wide rules — acceptance, not a redesign
**UX-COH-01 / attention budget:** Every landing/primary screen has ONE visually dominant purpose and primary CTA. Supporting cards are subordinated or collapsed. Competing first-screen panels require documented user-task necessity. No arbitrary total-card cap: evaluate relative attention and viewport, not a numerical quota.
**UX-COH-02 / progressive disclosure by default:** Above the fold show the useful summary and action, not the complete source/evidence/debug metadata. Provide readable direct paths to data, citations, limitations and exports without burying safety-critical missingness/uncertainty.
**UX-COH-03 / action-before-library:** For task screens, input/edit/confirm is first; background reading and research below or linked. For information-driven Biology screens, show meaning and next optional step first, then trend/source detail. No forced health recommendation if evidence ineligible.
**UX-COH-04 / composition system:** Shared hierarchy across Today, Food, Athlete, Biology, Explore, Progress and Profile: (i) contextual header; (ii) main task/one focal card; (iii) two or fewer obvious supporting choices at first glance when applicable; (iv) grouped drilldown/details, (v) controls only where contextually relevant. Maintain mode-specific Everyday green / Athlete blue and approved flagship typography; do not homogenize professional workflow or replace canonical navigation.
**UX-COH-05 / human-facing language:** Technical terms such as claim eligibility, source revision, genetic strand, provenance, assay normalization, source-only and technical gate are not default card headings. Translate to `What this means`, `Why we can't interpret it yet`, `Where this came from`, `Updated result`, `Some details missing`. Preserve exact technical terms and original measurements in expandable detail, exports and audit UI. A safety-critical disclosure remains visible even when detail is collapsed.

## First-slice application review by area
| Screen | Main job | First glance | Keep in detail | Evidence needed |
|---|---|---|---|---|
| Today | decide next action | one dynamic, honest task + fast Food action | research, historical status, source metadata | complete screenshot 320/390/desktop plus interaction recording |
| Food | log/adjust food | source choice, editable serving/portion, review/save | complete micronutrient panel, source rows | search→portion→review→save→Today→Progress |
| Athlete | perform/review workout | exercise, previous performance, current set, completion | muscle map, volume, training research | start→edit→check→next→finish including units |
| Biology | understand current records | concise human meaning, status, trend if comparable | raw date/unit/source, correction history, citations | from finding to exact source ≤2 deliberate interactions, no misleading inferred claim |
| Genetics | understand selected meaningful findings | 0–5 eligible or source-backed educational cards, explicit type | exact REF/ALT/assembly, evidence registry and history | measured ≠ reviewed ≠ personally eligible, no risk scoring |
| Explore | learn a mechanism | plain-language what/why/unknown | study models, contradictory sources, molecular identifiers | distinguish education from user measurement |
| Progress | see changes over time | 1–2 meaningful real data trends or empty state | all raw series and corrections | no synthetic zero/connected incompatible datapoints |
| Profile | manage account choices | grouped preferences and privacy actions | rare developer/debug options | role and consent controls only in appropriate groups |

## Review method for actual build — gate UX-COH-06
At stable release SHA collect:
1. First screen full-page and **first viewport** screenshot at 320 and 390 CSS px, desktop 1280, approved light/dark modes.
2. Annotate one dominant visual element, its main CTA, number and relative prominence of competing cards, expanded technical text/scroll burden.
3. Perform 60-second first-use test: can an uncoached user state what to do and find the action?
4. Try one core task, error, empty, partial-data, save/correction and account-switch state per feature. Measure clicks, focus, navigation and loss of context.
5. At 200% zoom, keyboard and assistive technologies, confirm critical caution and primary action are both reachable; do not conceal clinically consequential status for visual tidiness.
6. Mark **PASS**, **FAIL**, or **NOT_TESTED** for whole-screen hierarchy, consistency and comprehension separately from underlying code/security/biology.
7. For FAIL, record route, expected/observed, screenshot, build SHA, task difficulty, corrected component, and re-test. No blanket redesign when local rearrangement solves it.

## Corrective acceptance principles
- Each new science feature should **not** create its own Today card by default. Biology/Explore own deep science. Today surfaces it only if reviewed, meaningful and actually actionable.
- Multiple informative panels on a page are acceptable when users intentionally enter analysis; landing screens are not encyclopedias.
- Primary user action remains accessible even when APIs fail, provided safe manual fallback exists.
- Do not count completeness by widgets rendered or number of research cards.
- Scientific correctness cannot be traded for brevity. Compress jargon, **not evidence honesty**.
- Preserve existing approved blueprint and design tokens. No new design direction, new top-level tab, duplicated page framework or data store.
- Retain source fidelity through one/two deliberate disclosures; original units, genetics notation, study sources and corrections remain available.
- Avoid one-size-fits-all CTA for screens whose main task is education, history review or consent.

## Binding scope and priority request (Chief Architect only)
- **v0.5 P0**: Remove observed competing cards blocking primary actions; fix inaccurate/error-prone wording, misleading action hierarchy, keyboard/zoom regressions; avoid redirections away from task flows.
- **v0.5 P1**: Progressive-disclosure and composition alignment when touching core screens; plain-language copy; simplify look before expanding functionality.
- **v0.6**: Research presentation and cross-feature editorial consistency, after core task slices.
- Review existing screens before reimplementation. Do not reopen legacy source requests or replace existing feature correctness.
- No claim of runtime PASS from this source rule; the Architect coordinates exact-build screenshot/device acceptance under ARC-BRAND-P0-06.

## Developer-facing component contracts (presentation only)
`PrimaryTaskSurface`: `title, oneMainAction?, contextualStatus?, supportingActions[], childrenDetail?` with no invented action when none eligible.
`MeaningFirstSummary`: `observed?, conciseMeaning, evidenceClass, importantLimitation, sourceDisclosure`.
`EvidenceDetails`: `sourceRefs, measurements, originalNotation, reviewVersion, limitations, optionalExpandedState`.
`EmptyOrPartialState`: `knownData, missingData, nextSafeAction?, sourceStatus`, never missing==zero.

## Signoffs
Branding decision: **REVISE** earlier *component-level conditional direction* insofar as it implied overall coherence; accept existing brand system and source files. No actual physical iPhone/accessibility or uncoached participant results claimed. Independent User Testing owns task comprehension; Chief Architect controls implementation queue. No new Product Owner decision needed.
