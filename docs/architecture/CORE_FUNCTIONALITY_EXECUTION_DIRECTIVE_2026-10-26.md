# Bloom — Product Owner Directive: Core Functionality First
**Date:** 2026-10-26 | **Authority:** Product Owner | **Status:** Effective immediately on development branch `enhance/bloom-experience`.
**Applies to:** Codex task selection, existing v0.5 completion and subsequent v0.6 execution. This supersedes older prioritization language when it would cause prolonged edge-case work before working user journeys. It does NOT waive safety, privacy, source/nutrition correctness, release or medical-claim gates.

## Decision
**Prioritize complete useful vertical user journeys over exhaustive rare edge cases or infrastructure tangents.** Build and verify a coherent app that delivers value with ordinary inputs first. Capture lower-impact exceptions as backlog items; return to them in stabilization after primary paths work. Avoid spending sessions repeatedly polishing or defending cases that do not meaningfully obstruct user experience.

## Priority filter at every task boundary
**Must fix now (P0 blockers)** if reproducible and materially affecting:
1. A core journey cannot complete or is seriously misleading for normal realistic input.
2. Corrupt/lose/duplicate user records, nutrient calculations or source identity; cross-account leakage, authentication, data confidentiality, material security vulnerabilities.
3. Unreviewed clinical/medical claims, unsafe triage, data-driven actions that present significant health risk, incorrect provider-source confidence or fabricated readings.
4. Repeated failure under normal use (ordinary mobile, save/retry, basic navigation, supported import/source).
5. A legal/consent/provider-rights requirement necessary before actually enabling the feature.

**Record and defer (P2 stabilization)** if primarily rare, cosmetic or theoretical, without a plausible material safety, privacy, data integrity, source misattribution or typical-path impact: unusual legacy date permutations, low-probability concurrent retries, exotic unsupported units/schema permutations, exhaustive stress/negative case matrices, pixel-perfect polish and speculative expansions. Keep an ID, repro, severity, affected users/path, workaround, and revisit milestone in a **separate deferred backlog**. Do not silently discard. A nominal P0 label in an old handoff does not automatically force immediate implementation; evaluate actual impact and gates with current evidence, preserving legally required gates.

**Implement later (P1 core feature)** important working behaviors currently missing: usable Everyday Today→goal→food/activity logging→accurate feedback→Progress, quick correction, trustworthy food search including homemade recipes/brand identity, basic activity logging, straightforward bloodwork input/history and clinician-discussion educational context, genetics and Viome file/paste import with honest data, Athlete core workout and fueling. A partially working headline feature is more urgent than polishing a peripheral module. Do not scope-creep into advanced Coach/AI/model/complex wearables or niche scientific simulations before basics work.

## Developer execution protocol
1. Inspect latest code and ledger: give each active item a **Core Journey / Must-Fix P0 / Defer P2 / Blocked External** classification. Spend the **majority of development effort** delivering the highest-impact incomplete core journey, not serial edge-case hardening.
2. Select one **end-to-end vertical slice** and complete it (UI→API→storage→review/correction→refetch→main user destination), with a small representative regression set. Deliver and validate a working path before starting unrelated optimization.
3. Minimal representative tests: typical successful input, one real failure/retry, correct save/refresh, accuracy/permission invariants, basic responsive accessibility. Add deeper edge-case tests only where a bug was observed or meaningful harm is reasonably foreseeable.
4. When discovering nonblocking edge cases, **log once and continue**. Do not implement an entire subframework, complex immutable revision mechanism, extra permission layer or large matrix solely to cover hypothetical corner cases if normal canonical behavior remains reliable.
5. Reconcile **existing code and duplicate tasks** before new implementation. Do not reinterpret architecture handoffs as orders to implement every optional refinement before the next core feature. Existing detailed acceptance remains release/stabilization criteria where applicable, not a demand for simultaneous completion.
6. After each functional slice, publish source SHA, tests/CI and actual Render user-path result separately. Mark **implemented, tested, deployed, independently accepted** distinctly. Then move immediately to the next highest-value core workflow. Do not claim v0.5 complete until mandatory gates are met.
7. Maintain existing no-merge-to-main, no unauthorized production activation, clinical restrictions and approved provider licensing. Keep v0.5 priority over advanced v0.6, but allow small high-value basic experience work when it unblocks a complete vertical slice.

## Immediate suggested sequence (inspect for already completed first)
A. **Food capture/search/review:** ordinary generic/branded/homemade results → one editable canonical meal → credible macros → saved journal and Today. Correct real overview-versus-detail mismatch. Basic success must not depend on all providers.
B. **Everyday usefulness:** first goal/action, basic activity entry, Today and dated Progress data consistency, return visit.
C. **Bloodwork essentials:** easy import/manual entry, dynamic dated records, raw source and unit truth, observed trends and neutral medical-professional discussion prompts; no claims/automated treatment.
D. **Gut/genetics usable imports:** file/JSON entry, reviewed recognized data, multi-date retention and simple meaning, no fabricated medical inference.
E. **Athlete essentials:** setup, workout session recording, honest relevant nutrition and progress. Advanced adaptations/native vendor devices only after normal no-device journeys are functional.
Sequence can change based on validated live severity and dependencies; Codex documents deviations briefly.

## Guardrails against misapplication
- Do **not** postpone a real data corruption, medical safety, security, privacy, account isolation or legally necessary fix by calling it “edge case.”
- Do **not** disable existing tests, delete history or reduce correct source identity simply to accelerate development.
- A synthetic-only exotic corner case may be deferred; a supported common user input must not.
- Chief Architect can still add requirements, but Codex should log optional or low-frequency branches for a refinement/stabilization pass rather than immediately build them.
- Release approval and clinical/Legal/security signoff remain separate from a useful development preview.

**Owner intent:** Stop over-investing in low-impact edge-case engineering; make the core app coherent and useful first while tracking genuinely important postponed work.
