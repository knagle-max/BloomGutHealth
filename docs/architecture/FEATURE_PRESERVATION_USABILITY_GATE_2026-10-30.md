# Bloom — Architect decision: Core-Journey Feature Preservation Gate
Date 2026-10-30 | Disposition: APPROVED AND BINDING for usability/flagship implementation.
Source: `Bloom_User_Testing_Feature_Preservation_Usability_Guardrails_2026-10-30.md`, UT-PRESERVE-3201–3207. This is a specialist proposal, not implemented or independently tested. Crosswalk existing UX-GATE-3100 and UT-USABILITY-3101–3109, UT-EXAI-2701–2708, UT-TAXON-2801–2808, UT-BIOPROG-2901–2907.

## Binding rule
**Reduce complexity exposed by default; never remove useful available depth or discard data as a side effect of interface simplification.** Prior features are not automatically sacred: eliminate a truly redundant UI only if its complete supported functions remain clearly accessible through the canonical replacement. Removing capability or intentionally narrowing support requires explicit Architect exception, documented owner impact and test evidence; don't call something redundant without demonstrating parity.

## Approved acceptance by source ID
- **UT-PRESERVE-3201 P0:** Before changes, inventory Today, Food, Activity, My Biology, Progress and Athlete: source entry points, edits, source history, charts, scientific panels, preferences and cross-mode mapping. Classify `keep visible`, `move to expandable details`, `consolidate with deep link`, `replace with fully capable equivalent`, or `remove only after explicit exception`. Exact baseline SHA, after SHA, screenshots and journey proof.
- **UT-PRESERVE-3202 P0:** Reviewed educational detail, claim-level research citations, limitations, source values, molecule/pathway context and historical results remain discoverable within one clear action or equivalent direct link. Do not substitute empty generic microcopy or a fabricated one-number score.
- **UT-PRESERVE-3203 P0:** Food retains editable components/portions/nutrient coverage/source and edits. Exercise retains individual set IDs, reps, loads, direct completion and extended Athlete training detail even if Everyday simpler. Biology retains diverse imported marker categories, original units/dates, revisions, and clickable taxon research. Simple forms may change only submitted fields; absence of field cannot erase advanced stored data. Unknown never becomes zero.
- **UT-PRESERVE-3204 P0:** My Biology→Progress consolidation is navigation, not lab-record deletion. Preserve report/marker/source deep links, focus, selected time/date where practical, and current canonical record. Editing/reimport/offline failure/account switch remain integrity-safe.
- **UT-PRESERVE-3205 P0:** Do not conceal clinically meaningful source/uncertainty warnings, consent, privacy or data-quality states. Move generic technical explanatory detail to optional Data details; retain important decision-context warnings near results/actions.
- **UT-PRESERVE-3206 P1:** Real-browser mobile and desktop test novice and expert tasks, 320px, light/dark, keyboard/screen reader; verify ability to retrieve advanced detail as well as faster quick logging. Independent UT findings to be distinguished from planned tests.
- **UT-PRESERVE-3207 P0:** Ship gate for demonstrable core capability loss, silent field truncation, missing audit history/evidence, unexpected changed results or broken account separation. Require automated edit/data retention regressions, real journey screenshots and release notes. Fix before release; any deliberate exception must be narrowly documented and explicitly approved. Cosmetic differences not a blanket blocker.

## Minimal practical regression matrix
1. Food capture→recognized item→serving correction→save/reload→nutrition summary and original source.
2. Exercise multi-set parse→compact parent→one-click completion→edit child reps/load→save/reload→Everyday/Athlete preserves all sets and advanced fields.
3. Lab imported source→marker category→chart & research→original specific report→unit/date correction→trend refresh without stale entries or loss of source revisions.
4. Microbiome composition row→organism research (claims/substrate/potential products/citations)→actual source percentage/date→return to same report.
5. Athlete→Everyday→Athlete with coach permissions unchanged and training structure intact.
6. Account switch, source removal, partial load failure and absent unknown-data cases do not expose stale/private data or present missing data as zero.

## Implementation instructions to Codex
Audit current HEAD and active UI before rewriting. Add a maintained `Feature Preservation Matrix` with baseline/current commit SHA, area, prior function, new surface, parity test and status. Update it on substantial UX changes; avoid exhaustive inventory of nonfunctional archived concepts. Implement approved flagship designs and usability reductions but **do not treat archive-only mockups as previously shipped features**. Use one canonical record and existing source services throughout; avoid duplicate stores. Run focused preservation tests on each affected area rather than a giant refactor. Document exact deployed Render SHA/screenshots and independent usability acceptance separately. If hidden behind many interactions, capability is not genuinely preserved simply because code exists.

## Boundaries
This decision approves a feature-preservation standard and release criteria, **not** a claim that the current app already passes or that every specialist's proposed unimplemented feature is historical shipped functionality. Apply parity to capabilities actually verified in the baseline, and separately implement newly approved roadmap features.
