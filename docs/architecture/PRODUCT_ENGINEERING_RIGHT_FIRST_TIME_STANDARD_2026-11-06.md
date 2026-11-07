# Bloom — Product Owner Standard: Build for Actual User Intent, Limit Rework
**Date:** 2026-11-06
**Status:** APPROVED; binding on new features and materially changed existing features. No assertion of zero rework, deployed AI provider, fully audited repo or completed remediation.
**Product Owner directive:** Stop treating narrow internal proof-of-concept implementation as complete user-facing functionality. Develop features against the real scope of natural user expectations, preserve breadth, and test complete user journeys before close. Codex autonomously makes design/engineering choices within approved privacy, costs, clinical and launch restrictions. Branding and specialist review happens at final integrated gate; no interim review blockade.

## A. Audit-derived known facts versus unconfirmed risk
**Verified at current dev branch review:**
- `ActivityLog.tsx` `describe()` invokes synchronous `describeActivityParts()`; `shared/activity-capture.ts` is a regex/limited menu parser and fails owner-provided mix of 45-min run + 10 pushups + bench 3x10x225 lb + 20 bodyweight squats. Its source-preserving review is worthwhile, but a regex-only parser is not an adequate final solution for the expected open-ended activity-description feature. P0 issue `ACTIVITY_DESCRIBE_MIXED_EXERCISE_PARSE_REGRESSION_2026-11-06.md`, superseded/expanded by `ACTIVITY_AI_ASSISTED_UNIVERSAL_DESCRIPTION_ARCHITECT_DECISION_2026-11-06.md`.
- `LogMeal.tsx` already has `aiConsent`, reports `/api/analysis/status`, supports optional **AI ingredient parsing**, and uses server `/api/meals/review` with explicit `/api/meals/confirm`. This is structurally more mature than Activity, **not proof** of unrestricted food/restaurant language success, exact nutrition data, or hosted provider activation.
- `Upload.tsx` supports Viome PDF and JSON/CSV review; the historically reproduced fixed-third-column/row ambiguities show why simplified synthetic layouts are not broad format acceptance.
- `shared/meal-intelligence.ts` includes fixed evidence pattern matching for food pathways and nutrition-related explanations. This is a narrow **research context** mechanism, not a free-text biological explanation engine or proof of personal response.
- `client/src/components/FoodEntryChooser.tsx` and `ProductPicker` distinguish entry methods; exact product selection, fuzzy lookup and generic estimates are different capabilities. No blanket declaration that all other Describe flows are defective.

**Priority audit candidates to verify against current code and real persisted flow:** meal description (mixed foods, portion/brands, sauces and multiple meal times), restaurant free text (composite dishes and ingredients), product/barcode/photo routes, food-to-ingredient preparation identity, manual report metadata/dates, supplement free text, exercise/athlete repeat and workout logging, source linking and reports, research queries with unfamiliar organisms/variants. Classify each `PASS / USER-VISIBLE_DEFECT / LIMITED_SUPPORTED_MODE_DISCLOSED / PROVIDER_ACTIVATION_PENDING / NOT_APPLICABLE`; do **not** create a blanket backlog of speculative defects.

## B. Binding definition-of-ready before code (lightweight, not new committee)
For every new or significantly modified user-facing capability, Codex writes **a concise executable product contract** in adjacent test/spec (not a large governance document):
1. **What a normal user believes it does** in plain English, including varied real-world inputs and its legitimate limits.
2. **Input breadth and source trust:** free text/open vocabulary, spelling colloquialism, mixed forms, language scope, source types and versions, missingness, relevant units, messy data, provider permissions.
3. **Output contract:** what is extracted vs inferred vs estimated vs unknown; edit/undo/source trace; explicit bounds and hard safety constraints.
4. **Successful full journey:** start/capture→parse/review→correction→save→reload/use→delete/undo (as appropriate) with real app state and proper account ownership.
5. **Integration and fallback:** existing service/AI vs deterministic baseline; user consent/cost/latency; provider unavailable behavior; offline/manual operation remains useful. No feature marketed as AI-powered before genuine authorized provider path verified.
6. **Representative negative cases** and known data hazards. A complex, open-ended intent must not be silently replaced by small fixed keyword lists. If MVP intentionally supports less, label it `limited/basic` in UI and backlog and do not close broad promise.

**No new owner approvals for routine choices.** Codex should infer sensible scope from owner goal and existing contracts, implement the full safe version when feasible, and keep unsupported tiers active research/privileged-shadow where appropriate. The Product Owner is not required to specify all phrasings for an ordinary feature.

## C. Test design: user intent first, code path second
- Write **acceptance examples independently of proposed implementation** before tuning regex, prompt or parser. Include normal, messy, colloquial, mixed, contradictory, unfamiliar (open-vocab), broken/incomplete, multimodal/source-specific and adversarial examples.
- For extraction tasks, test **field-level identity/quantity/unit/association coverage and precision**, not merely parser didn't throw, total component count or output JSON validity. Check for hallucinated details, missed spans, mis-associated amounts and source preservation. For AI compare actual model under authorized integration against fallback and hold-out human-generated examples, not only synthetic examples written to match the prompt.
- For source documents include exact layout-faithful originals/authorized private source acceptance when available; surrogate tests cannot certify true provider compatibility; report dynamic per-source counts, never hardcode one sample. Privacy of genuine source is nonnegotiable.
- Test end-to-end persisted real application data (owner-scoped synthetic isolated DB), refresh, duplicate/retry, correction/deletion, queued work and relevant downstream summaries. Unit tests are necessary but **not sufficient** to declare a user feature done.
- UI: Branding meaning-first, one legible task action, source/uncertainty within context, details accessible, responsive 320/390px/200% zoom/keyboard/VoiceOver, error and empty paths, no hidden data/correction; actual device and independent human acceptance remain distinct final-gate statuses.
- Record exact implementation SHA, input fixture/manifest, model/provider version when used, test environment type (unit/browser/hosted/device), observed limitations and exact deployed SHA. No generic `PASS 500 tests` in place of workflow proof.

## D. Build the intended architecture, not a disposable shortcut
**Prefer reusable extraction/review contracts over per-field regex patches**. For open-ended user text, use one appropriately authorized structured AI interpretation capability and a deterministic schema validation/provenance/unknown/fallback layer. Specific Activity Describe can reuse the established Meal review architecture, not duplicate existing provider/consent/billing systems. No medical inference and no AI direct write.

Keep parsers for structured and easily deterministic data, but treat them as genuine parsers with provider/version variability and strict compatibility/uncertainty—not token-specific fixture workarounds. Keep canonical biological, food, athlete and source models; no competing migration/knowledge graph. Do not force a user to change how they naturally phrase a task to match our shortcuts.

The right architecture is proportional: not every button needs AI, and some tasks are better solved with deterministic, typed logic. **AI generates tentative structured interpretations; verified source/catalogue facts and user corrections govern stored truth.** Avoid accumulating multiple paid vendors and hidden inference costs. If a provider is not yet authorized, implement tested adapter/consent/fallback and separately classify provider activation—not broad project stop.

## E. Anti-rework engineering loop (autonomous, fast)
1. Inspect current functionality and relevant approved UX contract; **reuse working tested pieces**.
2. Implement one vertical slice matching the intended user job, not multiple internal abstractions without a user-facing result.
3. Run targeted tests, hold-out variation and real UI→API→persistent source review/reload; fix observed failure. Avoid unchanged 600-test suite reruns every commit.
4. Briefly document supported scope, genuine limits and final-gate-only review status in current task ledger; do not declare broad promises done from mocked AI calls or fixture-specific counts.
5. Commit/push authorized dev branch, check exact preview once when appropriate, advance to next approved task. No interim specialist signoff loops and no new huge documentation backlog.
6. Reopen only on actual owner-reported failure, reproducible regression, new approved requirement or safety issue. Avoid repeated defensive refactoring with no demonstrated user benefit.

**Systemic acceptance:** New functionality can be `ENGINEERING_COMPLETE_FOR_DEFINED_SCOPE` only when its **plain-language user promise** is tested in a real round-trip, not merely when internal implementation works. Intentional unsupported contexts must be disclosed and tracked as remaining capabilities. Engineering completion ≠ independent final release/security/clinical/public activation.

## F. Immediate scoped audit and corrective priority
1. **P0 Activity Describe**: fix the exact four-exercise regression and deliver open-vocabulary AI-assisted structured extraction + safe fallback, per owner-approved `ACTIVITY_AI_ASSISTED_UNIVERSAL_DESCRIPTION_ARCHITECT_DECISION_2026-11-06.md`. Do not close just by adding a few new regex aliases.
2. **Targeted existing Describe audit:** exercise; Meal/Restaurant; selected other free-text workflows actually exposed in the app. For each, collect 5–10 realistic user intent cases and run current UI path; classify and fix only demonstrated losses, bad unit/food match/partial save or misleading label. Do not stop P0 to write a giant audit inventory; audit each as current relevant route is touched.
3. **Current existing PDF and quantitative/qualitative source parsing**: continue exact compatibility acceptance without pretending generic fixture sample is universal. Reuse owner-defined safe data handling and source-review gates.
4. **All future v0.5 and v0.6 development**: apply A–E as persistent developer standard. Where later ML R&D produces scientifically borderline outputs, compute in permitted shadow, expose only to server-privileged experimental users, keep public medically constrained, without shrinking engineering ambition.

**Owner expectation:** Fewer user-reported basic failures, fewer brittle parser-only rewrites, more capability-complete slices with honest fallback and functioning workflows. No engineering process can guarantee zero rework, but these tests and acceptance definitions materially reduce foreseeable misalignment.
