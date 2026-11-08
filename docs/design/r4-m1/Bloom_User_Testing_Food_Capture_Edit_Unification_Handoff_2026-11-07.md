# Bloom — Food Capture, Editing & Correction: Independent User Testing Handoff

**ID:** UT-FOOD-UX-20261107-R1  
**Date:** 2026-11-07 (America/Regina)  
**From:** User Testing & Product Research Specialist  
**To:** Chief Architect & Integration Lead; Branding/Voice; Structural UX; Graphic Designer; Developer/Codex; Biology/Integration for source correctness  
**Disposition:** **CHANGES REQUIRED — IMPLEMENT IN THE CURRENT FOOD UX/PREMIUM WORKSTREAM; NO BLANKET STOP-WORK GATE.**  
**Repository:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, PR #1  
**Source inspected:** `c5724fdd4f5103321c50737f55fd0ccd697766dc` (current head at review).  
**Evidence class:** Source-confirmed interaction fragmentation; owner-reported lived difficulty; **no authenticated browser/mobile session independently executed in this review**. Do not mislabel inferred tap counts or screenshot quality as tested facts.

## 1. Uncoached emotional reaction and verdict

**I felt irritated and uncertain.** I want to type “chicken breast, rice and broccoli,” correct the rice to one cup, and be done. Instead I must decide how to add food before the editor opens; then I encounter details, a separate review, ingredient-level Change food controls, a review refresh, and another save decision. Editing an existing entry has a different path from adding one. I cannot easily predict which action recalculates values and which actually persists my meal. This is a central product interaction failure risk, not a request for different button colors.

- **Novice Friction: I don't know what to do next.** Multiple methods, explanations and distinct “review,” “recalculate” and “save” language force users to learn the workflow.
- **Expert Friction: This hides the underlying biology.** Not because detail is absent—ingredient sources, portion provenance and nutrients exist—but because a user must navigate several separate review/correction mechanisms to reconcile a food identity and its calculated value.
- **Bland/SaaS Alert** is **NOT VERIFIED visually** at the current SHA. Do not infer aesthetic appearance from CSS or a design reference. Ensure the replacement uses the approved premium editorial design, not another nested form/card stack.

## 2. What the code supports (and does not)

1. `client/src/components/FoodEntryChooser.tsx`: line ~10 prioritizes `search` over `describe` when both are available. It displays a method-choice hero and alternatives rather than opening the natural-language editor directly.
2. `client/src/pages/LogMeal.tsx`: lines ~223–235 show a chooser, method switching, recent meal loading, instructional notes, method-specific flows and optional restaurant context. Lines ~271 onward render a separate details form. Review/save logic uses server review revisions, confirmed receipts, retry protection and partial nutrition safeguards. **Preserve the latter.**
3. `client/src/components/MealAnalysis.tsx`: lines ~79–259 include review disclosures, separate portion/amount controls, `Change food`, removal, and `Update meal review` / `Save corrected portions & recalculate`; nutrition/source disclosures follow. This contains valid functionality but makes source replacement and amounts feel like a multi-step transaction.
4. `client/src/pages/NutritionHistory.tsx`: lines ~417–422 populate a separate journal text edit form. Lines ~350–370 update the meal through `PUT /api/meals/:id` then refresh sources. Its journal row also exposes `Recalculate nutrition` (~1099–1112). This differs materially from the `LogMeal` reviewed ingredient editor. This is **confirmed source-level fragmentation**, not evidence that an actual edit corrupts data.
5. Recent meal reuse (`RecentMealSource.tsx`) is another valid intake path. It should populate the *same* canonical editor rather than introduce another mental model.
6. The newer R4/M1 premium design master spec calls for preserving the existing `/log-meal` editor, data/error states and source fidelity; it does not establish that the split add-versus-edit workflow is independently usable. Update its **Food** implementation contract rather than restarting the design programme.

**Not established here:** actual number of taps, whether source changes persist correctly in hosted Render, smartphone keyboard behavior, real timestamps or exact mobile screenshot quality. These need observed acceptance after implementation.

## 3. Required product outcome — one canonical Meal Composer

A person sees **one immediately editable, labelled “What did you eat?” input** on opening Add food. They can type/paste or use an available voice capture; search, barcode, restaurant and photo (only when enabled) are visible secondary input actions. New entries, existing meal edits, copied recent/saved meals and corrections all land in the *same source-aware ingredient review editor*, parameterized by task rather than separate competing forms. The main task sequence is:

**Open → Describe/search food → Review identified ingredients/amounts → Make inline corrections if needed → Save meal/Save changes → See confirmed receipt and updated totals.**

No mandatory chooser step for the common natural-language journey. Server review and final acknowledgement remain distinct **internally**; UI must not imply a preliminary nutrition estimate has been saved. Where source identity, units, allergen ambiguity, stale versions or portions are unresolved, explicit confirmation is necessary, even when it costs an additional action. Do not optimize into unsafe silent acceptance.

### Intended mobile (320/390 px)

- Focus on one primary composer, with a minimum 44px tap target. Keep camera/barcode/search/voice options reachable without forcing all methods into equal-size cards. Do not trigger a camera or microphone without user action and consent.
- Review as scannable ingredient rows: name and amount clearly visible; tapping either opens a focused inline/bottom-sheet editor with **Change food / Change amount / Remove**. User returns to the same row with focus restored. Display source confidence/unknown where it materially affects choice.
- Show a compact **known nutrition preview** with visible `partial` label when needed, never replacing unknown with zero; deep nutrients/methods behind an explicit, discoverable disclosure.
- Keep **Save meal / Save changes** visibly associated with the active review, without overlap from bottom navigation or virtual keyboard; preserve unsaved draft when switching options or backing out.
- No nested border-box forest, unnecessary instructional paragraphs or decorative art above the task; reserve artwork for first-use/empty states after the action.

### Intended desktop (768/1440 px)

- One shared entry and review model. Use a wider ingredient list/editing region plus a visible source-based nutrition preview; no separate second screen solely because the viewport is large.
- Keyboard-efficient search/replace/quantity editing, visible status of uncommitted changes, clear Save changes and cancellation, and return to journal row context after save.
- Full evidence/portion disclosure accessible without obscuring the composer; source selection preserves exact reviewed grams or serving basis when physically appropriate and re-checks affected values.

## 4. Prioritized requirements for Architect consolidation

| ID | Priority | Requirement and minimum acceptance |
|---|---|---|
| UT-FOOD-UX-5301 | **P1, current UX workstream** | Direct text composer loads as default from Add food in no-data and returning states; 3-second test reveals one clear action. Secondary methods remain accessible without losing draft. |
| UT-FOOD-UX-5302 | **P1** | A single canonical component/state machine powers new meal, edit existing, copy/reuse and ingredient correction; preserve route/deep links and saved revision/owner controls. |
| UT-FOOD-UX-5303 | **P1** | Each food row supports inline identity, amount/serving and removal changes with obvious verbs. Avoid generic Change labels and repeated independent save buttons. |
| UT-FOOD-UX-5304 | **P0 integrity boundary** | Nutrition preview recalculates from current reviewed source/quantity; never show stale estimates as current. Saved meal/Today/Journal/Progress parity after a confirmed update; partial/unknown/zero distinct. |
| UT-FOOD-UX-5305 | **P0 integrity boundary** | Any save/correction uses existing review revision, actor ownership and idempotency receipts. Uncertain commit response never leads to duplicate entry or false success; retry retains draft. |
| UT-FOOD-UX-5306 | **P1** | Existing journal Edit opens the same ingredient-aware composer already prepopulated; changing original text alone does not silently preserve incompatible old ingredient/source analysis. The user reviews changed matches before confirmed save. |
| UT-FOOD-UX-5307 | **P1** | One stable primary Save meal / Save changes action; review/recalculate language is a scoped feedback state, not an extra confusing final save. Source-conflict and missing quantity still require explicit review. |
| UT-FOOD-UX-5308 | **P1** | Mobile 320/390 and desktop 768/1440 are **coequal** deliverables, not desktop-first with CSS shrink. Check long product labels, keyboard/safe area, touch targets, source correction, dark/Athlete modes and 200% zoom. |
| UT-FOOD-UX-5309 | **P1 visual quality** | Branding/Graphic Designer provides actual premium Food layout before/after renders; no repeated nested bordered rectangles; 16px minimum container padding and 20–24px preferred; all sources/units and status retain legibility. |
| UT-FOOD-UX-5310 | **P1 science** | Clearly distinguish exact branded/label sources, generic composition estimates, user-entered manual labels, and missing data. Preserve full nutrients, original source, serving basis, ingredient assumptions, confidence and provenance behind optional disclosures. |
| UT-FOOD-UX-5311 | **P1** | Keep saved/recent/copy flows, meal dates/times, meal type, dietary preferences, restaurant context where applicable, enabled barcode/photo and supplements without duplicating or losing draft items. |
| UT-FOOD-UX-5312 | **P1** | A novice can navigate an ordinary meal + one correction without instructions. Expert can reach the original numeric data and source after at most an intentional detail expansion; measure success/taps and comprehension independently. |
| UT-FOOD-UX-5313 | **P0 boundary on data delete/revoke** | Edit/delete one meal affects only the intended record and derivative aggregates; source withdrawal removes associated derived claims appropriately; unrelated meals/history remain. Revisions/dates and account boundaries remain correct. |
| UT-FOOD-UX-5314 | **P1** | Error/paused/offline and partial parses present actionable recoveries; an unknown ingredient does not invalidate known meal nutrient contributions; saved response only shown on committed receipt. |

P0 labels here identify **data and safety invariants** to preserve and test, not claims of newly observed live release-blocking defects. Severity of any actual regression must be assigned from a reproducer.

## 5. Minimum acceptance scenarios (independent test matrix)

For each case record exact **branch SHA, deploy/build, data fixture, browser/device, theme/mode, viewport, steps, expected/actual, screenshots and result PASS/FAIL/NOT RUN**. Test 320, 390, 768, 1440 px; mobile Safari when physically available; keyboard, VoiceOver and 200% zoom separately mark unperformed tests.

| Case | Steps | Expected |
|---|---|---|
| F-01 First meal | Sign up with no biological reports → Today → Add food → type “2 eggs and 2 slices of toast” | Text input immediate, no method decision required, correct review, safe save and receipt. |
| F-02 Portion correction | Enter “chicken breast, brown rice and broccoli” → change rice to 1 cup | Only rice portion revised; known totals recomputed; no unrelated reset. |
| F-03 Food replacement | Review generic yogurt → select an exact branded label → verify its serving and source | Current row retains focus; current source/quantity clear; old estimate invalidated; re-confirm where needed. |
| F-04 Journal edit | Save meal → Journal → Edit → change toast from two to one slice → Save changes | Same editor; current values in Journal, Today, daily and historical Progress; one saved entry, original date preserved. |
| F-05 Partial ingredients | Type ambiguous mixed meal with one unknown sauce | Known contributions stay visible as partial; unknown does not become zero. |
| F-06 Composite | Enter “two burgers without buns, chicken skewers and salad” | Distinct identifiable foods, no invented buns; quick item-level correction before save. |
| F-07 Fibre/supplement | Log Metamucil with quantity and separately labelled supplement | Correct source category and serving basis; no double counting; unknown nutrient fields remain unknown. |
| F-08 Reuse | Tap a recent meal → modify one ingredient | Reuses canonical composer, does not overwrite original or duplicate until committed. |
| F-09 Multi-source | Combine search food + manual label and change method mid-draft | Single review; selected items preserved; no duplicate-counting of ingredients. |
| F-10 Retry | Save after request commits but response drops; retry | One canonical meal, same receipt; never false success or two rows. |
| F-11 Conflict | Alter selected food source or use stale review version during save | Explicit changed-source message, safe recovery retaining edits, no stale nutrition. |
| F-12 Ownership/delete | Two synthetic accounts; edit or delete one meal and inspect totals | Foreign source denied; only owned record and its derivative contributions change. |
| F-13 Small mobile | At 320 and 390 px, open editor with keyboard, change item and save | No blocked action, horizontal overflow or unreadable title; focus and virtual keyboard behavior appropriate. |
| F-14 Desktop | At 1440 px edit quantity with keyboard and inspect totals/source | Editable field and useful preview remain visible; accessible focus and correct numeric parity. |
| F-15 Visual | Paired actual app before/after at mobile and desktop, light/dark and Everyday/Athlete | Premium composition materially more attractive and less institutional; source and errors not obscured. |

## 6. Explicit process — build now, review while work progresses

- **Architect:** crosswalk IDs into ongoing R4/M1 Food UX implementation. Authorize a unified interaction architecture that reuses existing canonical meal review, composition, save, source snapshot, history and retry APIs; arbitrate design conflicts. Do not demand a new independent engine or block all views pending cosmetic approval.
- **Structural UX:** supply a single production-ready Meal Composer state/interaction contract with desktop/mobile composition, draft/dirty/review/revision/failure/saved states, focus and route preservation; simplify but never delete accuracy checks.
- **Branding:** create short human labels and state copy (`What did you eat?`, `Edit ingredient`, `Change amount`, `Update preview`, `Save changes`) vetted for precision; don't fill the main screen with caveats.
- **Graphic Designer:** design the Food composition using approved Bloom art/tokens; provide actual mobile/desktop before-and-after targets, polished item editor and nutrition preview. Ensure first action visually dominates and deeper telemetry looks precise.
- **Developer/Codex:** implement the Architect-approved structure and visuals on `enhance/bloom-experience` with no new database or nutrition model. Preserve exact source rules, original descriptions, actor locks, idempotency, form drafts and errors. Supply real screenshots and test results, not only component checks.
- **User Testing (this lane):** independently test task completion on rendered mobile **and** desktop, label unperformed physical/human tests, classify actual defects separately from inferred source risks and provide targeted corrections. **Do not claim final UI pass without evidence.**

**Important sequencing:** Do not hold back approved coding merely because another agent has not signed a document. Implement safe independently specified portions now; request exact decisions only for conflicts that materially affect source semantics, data integrity or accessibility. Capture screenshots early and correct failures within the Food slice. Final acceptance remains separate from permission to implement.

## 7. Completion definition / anti-regression crosswalk

1. Novice can add/edit food without choosing which of several workflow models to use; one clearly dominant action within three seconds.
2. Editing a saved meal uses the same row-level corrections and source-aware review as a new entry, with current totals and explicit final save.
3. Lab/microbiome/biology depth not affected by this Food UI work; no unrelated redesign or server model rewrite.
4. Scientific provenance accessible, estimated and missing values honest, no personal medical claim invented.
5. Each major Food state has paired **actual** mobile/desktop screenshots with hash-labeled source fixture and designer visual-quality judgment; no mere before/after CSS token claims.
6. Functional, visual, accessibility and scientific acceptance are separately reported; premium visual readiness cannot be inferred from CI.
7. Architect receives one deduplicated implementation punch list; **code implementation should proceed** while tests and design reviews run.

## 8. Status and handoff

**Source review:** completed at named SHA.  
**Human usability / authenticated hosted / physical iPhone testing:** NOT RUN.  
**Code implementation:** NOT MODIFIED by User Testing.  
**Architect disposition:** requested, NOT YET RECORDED.  
**Branding/Structural UX/Designer review:** requested, NOT YET RECORDED.  
**Shared Library publication:** to be verified separately.  

**Related:** `Bloom_User_Testing_Successor_Agent_Operating_Standard_2026-11-07.md`, `Bloom_User_Testing_Visual_Experience_Quality_Gate_Addendum_2026-11-07.md`, `Bloom_User_Testing_Premium_Production_R2_Cross_Agent_Execution_Review_2026-11-07.md`, current R4/M1 designer/UX master handoff and Architect-approved premium production directives. This is an additive **Food usability correction** within the current premium implementation, not a new competing master specification.