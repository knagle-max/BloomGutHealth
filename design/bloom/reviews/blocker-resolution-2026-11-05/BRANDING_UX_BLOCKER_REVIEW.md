# Bloom — Branding & UX specialist handoff
**Directive:** Consolidated Blocker Resolution & Specialist Review, November 5, 2026
**Decision:** APPROVE CURRENT SOURCE AVAILABILITY / REVISE RELEASE ACCEPTANCE EVIDENCE
**Review basis:** source inspection of development commit `286555c47e643d14335fd140e88104562d83cbd3`; Render deploy `dep-dbmb2tqvcj2c738d65pg` reported live at this SHA; previous canonical 175-path design source verification. **No authenticated running-app browser session or independent phone inspection was possible in this specialist review.** This is an exact-SHA source review, not final runtime visual signoff.

## A. Items evaluated and scope
- `ARC-BRAND-P0-06`: running application visual/UX acceptance across Today, Food, Athlete, My Biology, Explore, Progress, Profile and major navigation.
- `ARC-BRAND-P0-07` and `MKT-001–010`: checked original source availability; cannot certify exact original acceptance text for missing-source requirement IDs without Architect's authoritative supersession.
- Food Review source completeness, Bloodwork source completeness, flagship and editable Today/biology/exercise packages; cross-check D08 and D09.
- Scientific portraits/molecular pathways/bloodwork icons; existing scientific asset release gate and independent disciplines.
- Nearby UI acceptance dependencies `FOOD-05/08/09`, `MICRO-06`, `GEN-05`, `ARC-REVIEW-01-CAPTURE` are **interfaces to review**, not claims of independent scientific/clinical/legal/engineering closure.

## B. Current evidence (observed)
- Dev branch SHA: `286555c47e643d14335fd140e88104562d83cbd3`. Render service reports same commit **live**; this proves deployment status, **not** user-journey correctness or visual signoff.
- `client/public/brand/design-tokens.json`, `client/src/brand-tokens.css`, `client/src/brand.css` exist. Canonical tokens support distinct Everyday evergreen/light and Athlete dark/blue mode. Do not introduce another visual direction or substitute the design-prototype ivory palette where runtime tokens govern.
- `design/bloom/VERIFICATION.md` and `VERIFICATION.json`: 175 original expected paths; 174 matched exact bytes and SHA-256; 1 absent historic legacy preview at `design/bloom/archives/bloom_brand_delivery_v1/bloom_brand_delivery/previews/brand-concept-reference.png`. Owner decision D09 makes it **nonblocking**. Do not regenerate or request. Earlier 117 SVG source syntax checks did not prove WCAG/runtime pass or image rights.
- Existing editable: `design/bloom/flagship/2026-10-26/prototype/index.html`, `contracts/UX_BLUEPRINT.md`, `existing-editable/02-canonical-food-review.svg`, `design/bloom/archives/Bloom_App_Wide_Experience_Redesign_2026-10-25/food_review.svg`, Today gallery in `design/bloom/archives/Bloom_Today_Experience_Redesign_2026-10-25/`, `design/bloom/biology-progress/2026-10-30/01-grouped-bloodwork.svg`, and ten `client/public/science/bloodwork-v4/*.svg` category assets. Do not reopen broad source hunt.
- Source code for `client/src/App.tsx` includes Today, Explore, Progress, Athlete and Profile route wiring; `client/src/pages/LogMeal.tsx`, `Dashboard.tsx`, `Progress.tsx`, `Explore.tsx`, `Profile.tsx` exist. This is **presence**, not proven interaction correctness.
- `client/src/components/WeeklyFoodReview.tsx` displays source ingredient names with an explicit \"not a dietary diversity or diet-quality score\" limitation; `client/src/components/BloodworkSourceOverview.tsx` links dated grouped source lab results; `client/src/components/OrganismPortrait.tsx` implements failed-image neutral fallback with visible label. These are valid code affordances to test, not completed runtime tests.
- `design/bloom/scientific-iconography/2026-10-30/library-v4/` assets exist on development tree (organism portraits and science categories). Previous Branding review conditionally approved direction; no per-final-blob full Biology, Legal, Security and User Testing approval was established here.
- Direct unauthenticated external attempt to open `https://bloomguthealth.onrender.com` was unsuccessful in the inspection environment. No screenshot, breakpoint, contrast calculation, keyboard run or authenticated account flow captured.

## C. Recommendations / explicit blocker dispositions
| Reference | Recommendation | Reason and closure condition |
|---|---|---|
| `ARC-BRAND-P0-06` | **NEEDS EXTERNAL EVIDENCE — narrow to exact-build visual acceptance** | Stable deploy identified but real authenticated page renders not inspected. Request only one authorized synthetic-account screenshot/device/accessibility evidence batch against that exact SHA. |
| `ARC-BRAND-P0-07` | **RESOLVED source availability; requirement text still Architect-owned** | Canonical source pack present except owner-exempt legacy preview. Architect recovers/supersedes missing textual acceptance; does not equate source availability with implementation. |
| `MKT-001–010` | **SOURCE_MATERIAL_REQUIRED for exact missing original wording or approved supersession** | Original wording not claimed recovered verbatim; replacement should refer to existing master design tokens, UX blueprint and core journey contracts, one requirement ID per record. Do not block new design work due solely to archival source wording after authoritative supersession. |
| Food Review/Bloodwork design sources | **RESOLVED as source dependencies** | Editable reference files and runtime components verified. No new source package needed. |
| Legacy brand concept PNG | **DEFERRED_APPROVED_SCOPE (nonblocking)** | D09 authorizes exclusion, original expected file/hash retained for traceability. |
| Scientific organism/chemistry visuals | **SPECIALIST_REVIEW_REQUIRED** | Only approved identity/rights/secure final blobs may replace neutral fallbacks; Chemistry accuracy not Branding's authority. |
| `ARC-REVIEW-01-CAPTURE` | **NEEDS EXTERNAL EVIDENCE** | Reproduce meal-detail display at exact deployed SHA using synthetic source and screenshot; don't assert historical issue fixed from source presence. |
| `FOOD-05/08/09, MICRO-06, GEN-05` | **DEPENDENCY CONTEXT ONLY** | Brand may assess UI copy/coverage, but licensing, assay evidence, food preparation science and genetics consent require other owners. |

## D. Targeted test matrix and corrective acceptance
**All rows PENDING actual runtime verification; not PASS or FAIL claims.**
| Surface / priority | Test and expected result | Source starting point |
|---|---|---|
| Today · P0 | 390px and 320px width, 200% zoom: one clear next action, real observed food totals, correct partial/missing language, no overlapping bottom nav | `client/src/pages/Dashboard.tsx`, `client/src/components/TodayFocus.tsx`, `TodayFoodSummary.tsx` |
| Food · P0 | Search/serving/quantity/correction/save → Today→Progress; correct food details, noninvented unknown macros, errors and manual fallback | `client/src/pages/LogMeal.tsx`, food review source SVG, `WeeklyFoodReview.tsx` |
| Athlete · P0 | Session start, set weight/reps editable, checkmark, next exercise, review/save, kg/lb correction, restoration after reload | `AthleteWorkspace.tsx`, `AthleteHome.tsx`, existing Athlete tokens |
| Biology/Bloodwork · P0 | Date/unit/source and original lab corrections reachable; named section grouping and neutral unavailable states; no pseudo health score | `BloodworkSourceOverview.tsx`, `LabExplorer`, grouped-bloodwork design |
| Microbiome & scientific imagery · P0 | Qualitative “Reported”, provenance, non-strain/BFT inference; reviewed illustration only or neutral fallback, semantic alt and source limitations | `MicrobialProfile.tsx`, `OrganismPortrait.tsx` |
| Explore · P1 | Sources, study types and unknowns one action away, no paper automatically promoted into advice | `client/src/pages/Explore.tsx` |
| Progress · P0 | Saved values persist after navigation, missing data gaps not zero; no incompatible trend line; tabs keyboard/focus | `client/src/pages/Progress.tsx` |
| Profile · P0 | Unit switch edits preserve original measurement, consent/role controls, privacy and logout under account changes | `client/src/pages/Profile.tsx` |
| Global · P0 | Everyday/Athlete tokens applied as approved; light/dark, 320px–desktop, 200% zoom, 44px targets, contrast, reduced motion, error/loading/no-data states | `client/public/brand/design-tokens.json`, source CSS |
| Source/reference · P0 | Missing historical preview not requested; original current brand/editable files not duplicated | `design/bloom/VERIFICATION.md` |

**Required evidence per failure:** route, screenshot/video, viewport, mode, build SHA, reproduction steps, expected/observed behavior, accessibility impact, severity, precise component, corrective re-test. No speculative redesign; reuse existing source components and brand system.

## E. Dependencies
- Architect supplies binding ID-level substitute for each unrecovered MKT/ARC source acceptance entry; do not silently invent old wording.
- Developer provides stable deployed SHA and synthetic non-sensitive test environment.
- Independent User Testing owns actual iPhone/Safari, 200% zoom, VoiceOver, uncoached task testing.
- Biology owns taxonomy/molecule semantics, Legal source rights, Security SVG/upload controls and privacy. Brand checks language, visual semantics and layout only.
- Runtime screenshots or accessible authenticated browser session needed to issue per-screen PASS/FAIL. No credentials requested.

## F. Priority
**v0.5 critical:** exact-SHA Today, Food, Athlete, Biology/Progress, Profile and global accessibility/error-state acceptance; source-related blocker clean-up.
**v0.5 noncritical:** reduced-friction Explore scientific explanations and science illustration polish, where not release safety-critical.
**v0.6/later:** optional richer illustration animation and advanced science/storytelling refinement; not a blocker on functioning core journeys.

## G. Owner decision
**NO NEW OWNER DECISION REQUIRED.** D01/D08/D09 and the existing browser/PWA-first decision govern. Escalate only material new rights/cost/privacy/irreversible scope matters, not ordinary visual decisions.

## H. Architect pickup
1. Record `ARC-BRAND-P0-07`/existing flagship, Today, Food Review and Bloodwork asset source availability as resolved; legacy PNG explicitly nonblocking.
2. Keep `ARC-BRAND-P0-06` as `SPECIALIST_REVIEW_REQUIRED` or `IMPLEMENTED_PENDING_ACCEPTANCE` (if Architect has corroborating implementation proof), **not OWNER_DECISION_REQUIRED**. Exact live SHA identified above; obtain one real-device/browser acceptance packet.
3. Reconcile original `MKT-001–010` text via D01, not fresh user requests. Preserve old IDs, mark authoritative replacements explicitly as replacement, not recovered originals.
4. Route only observed, reproducible failure tasks to Codex through Architect; no competing direct developer instructions.
5. Keep scientific art enablement separate from the textual source completeness pass, requiring explicit final-blob multi-specialist ledger.
6. On a newer release candidate, update all runtime test references to exact new SHA; source review at old SHA does not transfer automatically.

**This submission closes avoidable Branding source-dependency requests. It does NOT close deployed UX acceptance.**
