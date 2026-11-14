# Bloom Response Intelligence — Independent User Testing & Product Review

**Document ID:** UT-BRI-20261114-R1  
**Date:** 2026-11-14  
**To:** Chief Architect & Integration Lead; cc Nutrition/Biology, AI/ML, Structural UX, Branding/Graphic Design, Security/Privacy, Codex  
**Source reviewed:** `Bloom_Response_Intelligence_Science_Handoff_2026-11-14.md`, v1.0, exact published November 14 document available in `/Bloom/Agent Handoffs/` and `/Bloom gut health/Agent Handoffs/`.  
**Repository cross-check:** `knagle-max/BloomGutHealth` PR #1, `enhance/bloom-experience`, head observed `0e41e457c1c920202b23b330e02bf2bec95073ac`; inspected `client/src/components/RoutineLabTiming.tsx`, `client/src/pages/Progress.tsx`, `docs/architecture/V06_HANDOFF.md` and selected laboratory source code. This is a source-level review; not deployed-feature verification.  
**Disposition:** **APPROVE WITH TARGETED REVISIONS for Architect consolidation, not personal causality activation**. Do not create a separate data engine or stall ongoing approved development.

## 1. Product decision

Approve the Biology specialist's **Stage 1 → Stage 2 → Stage 3** progression:
1. Source-faithful lab comparison and chronological event context.
2. Evidence-linked *possible* explanations plus small, high-value questions and safe follow-up options.
3. Optional, suitable, prospectively evaluated N-of-1 and longitudinal response inference after validation.

This solves an authentic user question: **What changed? What may be relevant? What can I maintain or ask about?** It should be a compact capability inside existing Biology/Progress and surfaced sparingly on Today, **not a new major dashboard, score or daily compulsory questionnaire**.

## 2. Strong elements to preserve

- Five scientific layers: observed biomarker, recorded exposure, population evidence, personal association and causal effect. Never merge them in prose or visualization.
- Bitemporal exposures: occurrence or estimated date ranges, versus date entered, with user-reported retrospective status.
- Exact source IDs, original units, correction history, assay comparability, unknown fasting/method and no future-exposure leakage.
- Context-specific periods instead of a generic 90-day window; no invented RCV or single-marker improvement classification.
- Partial records and evidence gaps generate honest abstention and at most one or two useful clarifying questions.
- Counterevidence, simultaneously changed factors and safety/tradeoff review (TG vs LDL/ApoB and other relevant outcomes).
- Distinguish *maintain / review / monitor / clinician discussion / optional hypothesis test*. Do not advise prescription discontinuation.
- Existing Progress `RoutineLabTiming` already offers read-only chronological adjacency, explicitly says timing does not demonstrate cause; reuse it as a precursor, not as proof that BRI is shipped.

## 3. Targeted corrections for Chief Architect and agents

| ID | Priority | Finding | Required correction / acceptance |
|---|---|---|---|
| UT-BRI-5701 | P0 user value | The five proposed explanation sections can become a dense medical report. | Lead with **recorded change** (value, dates, units, comparability status), then a concise **what may have changed** list with at most 2–3 source-grounded candidates, one uncertainty sentence, one next action. Deeper science under disclosure. No claim of individual causation. |
| UT-BRI-5702 | P0 science/UX | The user could confuse *an exposure occurred* with *we have evidence it helped*. | Explicit semantic labels: `Measured result`, `You recorded`, `Supported by population research`, `Possible explanation`, `Cannot determine`. Each candidate shows data source and timing. Color alone never communicates certainty. |
| UT-BRI-5703 | P0 safety | Large or rapid laboratory changes may require evaluation regardless of reassuring trend. | Science/Legal-owned, separately validated critical-value and clinical-referral handling for the supported marker and jurisdiction. Until approved, show bounded non-diagnostic explanations and a neutral clinician-discussion route; no improvised red/green diagnosis or treatment advice. |
| UT-BRI-5704 | P0 data integrity | No universal RCV or fasting assumption should be applied. | Compare only valid analyte/assay observations; show **not directly comparable** and why when method/identity is uncertain. Absolute and percentage change can be calculated only after safe normalization. Separate numerical change from clinical importance. |
| UT-BRI-5705 | P0 temporal truth | Retrospective recall can easily be presented like contemporaneous tracking. | Show original occurrence range, recorded-at date and `Added from memory` where relevant. Post-draw changes may never explain an earlier draw. Dates corrected after the fact invalidate/rebuild dependent explanations without rewriting old source snapshots. |
| UT-BRI-5706 | P1 friction | Pre-lab 7–14 day context capture could create excessive tracking and notification burden. | Only surface when user explicitly records a future lab appointment or opts in. Pre-fill known change events from consented records; 30–60 second review; unknown/skip/decline; no new routine unless valuable. No automatic assumption that an old habit continued. |
| UT-BRI-5707 | P1 scope | System could ask exhaustive diet, stress, exercise, alcohol and medical questions. | Ask at most **one highest-information question at a time**, with `Unknown / Not tracked / Prefer not to answer`; permit dismiss forever for a given comparison; no repeated question once answered. Never solicit sensitive health context simply to fill a completeness meter. |
| UT-BRI-5708 | P1 model transparency | Ranked suspected causes can imply unjustified certainty. | With multiple co-occurring changes, group as **plausible contributors, cannot separate** rather than a numbered probability ranking. Display both supporting and inconsistent evidence. One variable cannot be credited for a multi-factor result. |
| UT-BRI-5709 | P1 information architecture | A new Response Intelligence route could fragment current Biology and Progress. | Entry from the **existing specific marker history/trend** and Progress comparison. New result: unobtrusive Today invitation. Preserve marker drilldown, original units/source and previous navigation/focus. Do not require the user to re-enter historical labs. |
| UT-BRI-5710 | P1 recommendation intent | “Keep doing” after an improved lab might inadvertently endorse unsafe behavior or ignore other outcomes. | Action categories require reviewed eligibility and tradeoffs. Use `Consider continuing an already safe routine` only where appropriate; otherwise `Monitor / Ask clinician / Gather more context / No action suggested`. Avoid unsupported claims of improvement, personal causal benefit or individual dietary doses. |
| UT-BRI-5711 | P0 privacy | Versioned derived explanations can leak removed sensitive details after source deletion or consent withdrawal. | Owner-bound source snapshots, access checks on every read, deterministic invalidation on correction/delete/consent change, private caches/exports respecting policy, no raw data to third-party models without authorized scope. Test account switch and cross-tenant links. |
| UT-BRI-5712 | P1 accessibility/visual | Biological “intelligence” risks another card stack or colour-coded clinical portal. | One measured-value comparison and editorial timeline; light-touch explanatory grouping; tap/keyboard disclosure to evidence and conflicting hypotheses; warm visual tokens. Screens at 320,390,768,1440 widths, light/dark, Everyday/Athlete, 200% zoom, focus return, VoiceOver when available. |
| UT-BRI-5713 | P1 scope | BRI overlaps existing `BIO-2026-104/108`, `V06-04`, lab revision/trend source handling and experiment APIs. | Architect maps BIO-2026-109–115 as extensions/refinements of canonical source/response records. Do not copy laboratory history into new tables, build new “evidence engines” or reopen v0.5. |
| UT-BRI-5714 | P1 defensible data use | Baselines consisting of only two quarterly results are weak. | Show a **descriptive difference**, not a proven trend or discovered personal response. More than two values still require method/time comparability and sufficient density. Stage 3 cannot graduate from a polished Stage 2 explanation without prospective evaluation. |
| UT-BRI-5715 | P1 meaningful learning | User needs longitudinal continuity, not a one-off interpretation paragraph. | Make source-linked “What changed since the last test?” editable; show last explanation version, confirmed follow-up event and whether a later result is comparable. Preserve null/neutral and reversed findings. Avoid turning user corrections into silent recomputation. |
| UT-BRI-5716 | P1 evidence verification | Science handoff cites 2026 lipid guidance and consensus and proposes RCV but does not provide BRI-specific algorithm validation or assay-level RCV tables. | Biology independently resolves reference details, approved marker and clinical rules, tests effect/time applicability and identifies the limit of every claim before public display. No inferred clinical rule from citation title. |

## 4. Minimal recommended experience

**On an existing triglyceride marker detail:**

**Your recorded change**  
`2.1 → 0.6 mmol/L` (illustrative values only). Dates and assay/fasting qualification visible; if a condition is unknown, mark it.

**What changed around that time?**  
`More walking` (if actually recorded), `weight change` (if recorded), `diet change` (only if recorded). If several changes occurred, say **“These happened during the interval; Bloom cannot isolate which caused the result.”**

**What else matters?**  
Method, fasting, medication, illness, timing and the possibility of normal variation; disclose what is missing, not as red warnings.

**One useful next step**  
`Review changes` (reopens an editable event timeline) OR `Ask a clinician` when appropriate. Under **See the evidence**, show source provenance, population research, counterevidence and attribution limits.

At most one clear primary action; avoid “You optimized your triglycerides!” or a health-score badge. The example is not a diagnosis and never inserts invented individual exposure history.

## 5. Acceptance test scenarios (independent task + engineering suite)

1. **No event history**: values shown; question offered; no fabricated ranked contributors.
2. **Four simultaneous changes**: explain plausibility without individual causal attribution.
3. **Event after specimen draw**: excluded from explanation even if the event was entered before import.
4. **Retrospectively entered event**: timing uncertainty clearly shown; no falsified prospective provenance.
5. **Lab date correction**: affected comparison and explanation version revised; original lab source/history retained.
6. **Noncomparable analyte or assay**: no percentage change or RCV verdict based on invalid normalization.
7. **Fasting or test-context mismatch**: qualified comparison; do not claim mismatch explains all change.
8. **Outlier and ordinary variation**: no “benefit achieved” celebration; RCV only with approved method/source.
9. **Improved TG but worsened ApoB/LDL**: no single-metric success or unqualified maintain advice.
10. **High-risk laboratory value**: vetted referral path; no supplement or medication change prescribed.
11. **Missing or declined context**: useful minimal result view; no pressure and no completeness guilt.
12. **Deleted exposure / withdrawn consent / account switch**: no stale private explanation; cross-account denial.
13. **Chosen action not performed**: never counted as actual exposure or user adherence.
14. **Existing Bloodwork/Progress navigation**: open relevant marker, read comparison, go back with focus/scroll context preserved.
15. **Small screen/zoom**: primary action, data labels and evidence access at 320/390/768/1440, light/dark, 200%, no horizontal overflow or buried crucial details.
16. **Later reversal**: repeated results show uncertainty and alternatives; old explanations stay versioned, no retrospective rewrite.
17. **New user with no prior lab**: no faux “response” dashboard; clear option to add a first source and review general education.
18. **Third-party model outage**: canonical measured comparison still works; hypothesis layer abstains, not hallucinated.

Record PASS / FAIL / NOT TESTED by scenario, candidate SHA, viewport, mode, date, and test method. Source-code reasoning is not an executed human usability test.

## 6. Implementation sequencing without unnecessary gates

**Stage 1:** A marker-specific read-only comparison using actual canonical labs; use existing trends, source corrections and date-context records. Then add a compact editable event timeline, with source and retrospective flags. This must be useful even with zero genetics/microbiome/device data. 

**Stage 2:** Add reviewed, limited hypothesis objects, source applicability/contradictions and one optional high-value context question; show conservative next actions. No causal ranking/percentages.

**Stage 3:** Optional prospective experiment/individual learning protocols with sufficient measurement cadence, safety review, preregistered objective and honest abstention. Mathematical sophistication is not scientific validation.

**Parallel work:** Biology supplies assay-specific evidence and hazards; Structural UX specifies precise state/scroll/focus handling; Branding designs actual mobile/desktop visual compositions; Codex works against a frozen implementation SHA after Architect dedup. Do not stop unrelated approved v0.6 development for review paperwork; do not activate clinically consequential interpretations without appropriate claim review.

## 7. Status, ownership and evidence boundaries

- **Source review:** COMPLETE — full source handoff read.
- **Repository cross-check:** PARTIAL — source-tree/UX overlap inspected on PR #1 head `0e41e457c1c920202b23b330e02bf2bec95073ac`; no commit, schema, compiled build or hosted UI test executed.
- **Scientific citations:** NOT INDEPENDENTLY REVALIDATED for this review. This review assesses stated safety boundaries and product experience, not an independent 2026 lipid-guideline appraisal.
- **Functional implementation:** NOT EXECUTED here. Stage 1 existing lab/routine timing capability verified by source inspection; full BRI not shown implemented.
- **Actual screenshot/aesthetic and physical-device testing:** NOT RUN.
- **Disposition:** APPROVE WITH TARGETED REVISIONS FOR ARCHITECT CONSOLIDATION. This document provides independent User Testing requirements, not standalone scientific/legal/clinical authorization.

**For Chief Architect:** Crosswalk to `BIO-2026-104/108` and `V06-04`; adopt requirements UT-BRI-5701–5716 and the 18-case matrix without starting a second architecture/data layer. Keep one clear next action and rigorous observed-versus-hypothesized labelling in every surface.