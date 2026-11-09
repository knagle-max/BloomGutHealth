# Bloom v0.6 — Branding & UX Research Handoff
**Date:** 2026-10-23 (America/Regina)
**Owner:** Branding & UX Agent
**Status:** Proposed for Architect consolidation; v0.6 research only. No runtime, clinical, or usability certification. Codex alone implements and changes GitHub.
**Brand:** One common component library, Everyday botanical green, Athlete performance blue, Coach muted indigo (proposed; Architect approval pending). Coach is a separate workspace, with independent role permissions.

## Research basis
The Chief Architect's v0.6 directive governs UX-OPT-01–07. Independent UX references: NICE NG197 shared decision making (personalized risk/tradeoff explanations, absolute risks, user priorities) https://www.nice.org.uk/guidance/ng197/chapter/Recommendations ; AHRQ SHARE approach (patient values, alternatives, risks) https://www.ahrq.gov/sdm/share-approach/index.html ; W3C WCAG 2.2 AA (keyboard, reflow, contrast, target size) https://www.w3.org/TR/WCAG22/. These support communication patterns, not clinical efficacy of Bloom.

## Requirement proposals

**UX-OPT-01 — Multi-goal setup (P0).** Present Goal → Constraints → Priorities & Trade-offs → Review. Permit multiple goals, one or more priorities or “not sure.” Explicitly show conflicts (e.g. energy deficit vs training capacity), time/cost preferences and what will be measured. Acceptance: finish without genetic or microbiome tests; revise three goals and priority order; preserve history; explain competing recommendations. Dependencies: BIO-OPT-01/02, ML-OPT-01, UT-OPT-02. Reuse existing goals/profile.

**UX-OPT-02 — Integrated day plan (P0).** Today shows ONE primary action with three coordinated sections: Eat, Move, Recover. Each step has expected time, context, evidence, replace/skip/log controls. Not-recorded != not-done; user can change plans. Acceptance: fully usable at 320px without connections; no duplicative “plans”; contextual options and missingness visible. Dependencies: ML decision contract, Biology eligibility constraints, existing TodayFocus/Athlete sessions.

**UX-OPT-03 — Recommendation explanation (P0).** Standard card content: recommended action → why it fits stated goals → inputs actually used (or “general guidance”) → evidence class, population, limitations → practical alternatives → measured endpoint and follow-up → optional mechanism. Acceptance: no unsupported personal effect size; reviewable sources; plain-language action without opening a science graph. Maps MKT-011/014/016 and BIO-26-312.

**UX-OPT-04 — Scientific states (P0).** Text+icon distinctions: Measured; Provider-reported; Entered by you; General research; Association; Validated model estimate (only if actually validated); Research simulation (not measurement); Unknown/unconfirmed. Colour NEVER sole distinction. No universal gut score or speculative enzyme activity badges. Acceptance: participant comprehension tests of evidence types; lab source unit remains separate from display unit; source and collection date inspectable. Maps ML-26-204, MKT-012/019, UT-ML-402.

**UX-OPT-05 — Progress and adjustments (P1 with P0 safety warnings).** Show goal-specific real dated outcomes before settings; baseline, comparable trend, missingness, confounders. “Why your plan changed” includes previous and new action, approved evidence reason, update date, user review, historical snapshots. No change if insufficient evidence. Acceptance: scenarios of improvement, null, worsening, conflicting signals and missing data, no causality inferred from uncontrolled change. Single control per measurement unit per screen. Maps LEARN-01–06, UT-RED-201–208, MKT-013/018.

**UX-OPT-06 — Value of testing (P1).** Dedicated optional explanation “Would additional information change your next action?” Show prospective decision usefulness, privacy, cost and limitations. Explicit “No additional tests needed for this recommendation” state. 16S, shotgun, expression and metabolite assays may not claim equivalent capability. Acceptance: baseline-only user never blocked or upsold; no unapproved testing indication. Maps INFO-01–04 and ML-26-205.

**UX-OPT-07 — Cross-workspace accessibility (P0 AA; P1 polish).** Share typography, card proportions, navigation behaviors, evidence states, spacing and illustrations across Everyday/Athlete/Coach; colour and density differentiate. Coach must remain separately navigable and must never inherit athlete medical/genetic permissions. Acceptance: WCAG 2.2 AA screen-reader/keyboard/reflow/contrast tests at 320px and 200% zoom, reduced-motion, error/empty/offline, light/dark. Design default 44x44px touch targets (WCAG 2.2 AA 2.5.8 permits 24px or exceptions). Maps MKT-BRAND-301.

## Seven realistic flows / expected UI behavior
A. Two goals (metabolic health plus muscle): acknowledges possible tradeoffs and shows one sensible daily plan, not two contradictory meal targets.
B. No assays, wearables, or labs: user gets accessible default food, movement and recovery action; unknowns remain unknown.
C. Endurance athlete on training day: practical fueling and rest coordination; energy expenditure estimate clearly marked as estimate.
D. Imported lab without units: stored pending; no definitive flags; source unit explicitly confirmed before clinical interpretation.
E. Curious user opens bacterial pathway: displays reviewed general mechanism, not personally measured flux; can go back to action.
F. Progress with symptom improvement but worsening performance: shows both observations and choice of priorities; no universal health grade.
G. Coach member views authorized workout summary only; no genetic or medical records without specific permission.

## Copy samples
- “This suggestion reflects your goals and meal preferences. We have not measured your personal response.”
- “Two goals may compete. Which is more important this month?”
- “No comparable results yet. You can still follow general guidance.”
- “This pathway is a research hypothesis, not a measured result in your body.”
- “Your plan changed after an approved evidence review. View the previous version.”
- “Another microbiome test is unlikely to change today's advice based on the information available.”
- “You can skip this item; it will be marked not recorded, not failed.”

## Acceptance study requests
User Testing: novice Everyday, metabolic-health user, strength athlete, endurance athlete and coach persona; mobile 320px/375px, keyboard and screen-reader tasks. Test goal trade-off recognition, plan completion and understanding, correct evidence-category classification, no-data usefulness, alternative selection, change comprehension, unit-error recovery, and control of data sharing. Predefine pass thresholds, count errors and completion times; distinguish source inspection from live study.

## Conflicts, dependencies and release boundary
- Biology owns intervention, clinical safety, dosage and test-utility approval; this UX handoff prescribes none.
- ML owns optimization correctness and abstention; UX cannot make model results reliable by labelling them.
- Security/Legal own consent, Coach grants, protected data and regulations.
- Integrations own provenance and capabilities; no fictitious working connections.
- Architect deduplicates with v0.5 MKT/UT requirements; Codex implements when authorized.
- Avoid replacing v0.5 Today or three-destination navigation. The unified plan is an enhancement.
- Cost: UX design assets no third-party fees; engineering low for copy/status, medium for goals/cards, high for coordinated plan/state/history; licensing and clinical rules separately assessed.
**Specialist research sign-off: approved with conditions for v0.6 architectural consideration, not implementation or release approval.**
