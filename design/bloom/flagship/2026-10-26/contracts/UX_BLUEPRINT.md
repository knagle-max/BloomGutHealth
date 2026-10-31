# BLOOM FLAGSHIP — BINDING UX BLUEPRINT
**ID:** MKT-FLAG-UX-2026-10-26-A1 · **Owner:** Branding & UX · **Date:** 2026-10-26 · **Status:** Design specification for Chief Architect reconciliation, not a shipped feature.

## 0. Implementation authority and scope
This document is the mandatory behavioral companion to `prototype/index.html`, `prototype/styles.css`, `contracts/IMPLEMENTATION_CONTRACT.md`, the supplied flagship reference images, and the existing original Bloom brand assets. Follow it for information architecture, screen order, user action, copy hierarchy, progressive disclosure, error recovery, motion and state transitions. **Do not infer interactions from image-generation art.** In case of conflict: (a) established approved data architecture and clinical/security/legal gates take precedence; (b) current approved workflow and established mode routing take precedence over aesthetic exploration; (c) within these constraints this blueprint defines the UX. Report any collision with a concrete screen/state proposal to Branding & UX before implementing a different experience. Architect coordinates scope and dependencies; Developer implements; Design owns UX/UI fidelity; product owner has final product authority.

**Preserve:** Today / My Biology / Progress as Everyday navigation; context-sensitive Add Food via established approved chooser/canonical draft; Athlete separate mode, Coach separate #62558D workspace. Do not invent extra top-level nav as suggested by concept renders. Source truth, dated observations and partial-data semantics cannot be traded for more attractive cards.

## 1. Global design / behavioral invariants
1. At most one visually dominant action per current user intent. Secondary actions are quieter, still discoverable; no multiple same-weight buttons competing in one card.
2. Every screen uses a three-tier hierarchy: **current state or primary action** (hero), **one short contextual explanation**, **details and controls**. Advanced science stays one tap away, not absent.
3. Primary page backgrounds: Everyday warm `#F9F8F4`; Athlete ink `#091A31`; Biology clean paper/warm-white with deep green text; Coach existing indigo `#62558D`. Everyday accent `#246B50`, Athlete `#2563A6`. A dramatic surface must retain >=4.5:1 body contrast and legible disabled/selected states.
4. Spacing scale 4, 8, 12, 16, 24, 32 px. Body text 14–16 px minimum by context; critical measurements 28–40 px; large title 24–32 px. Prefer title serif as a controlled accent only; labels/data/forms are sans. Touch hit areas >=44px, input focus visible, numeric entries usable one-handed.
5. State grammar: `Recorded`, `Planned`, `Estimated`, `Needs review`, `Not recorded`, `Sync delayed`, `Unavailable`, `Unknown`, `Partial data` each has distinct label and accessible meaning. Missing never silently becomes zero. Use icon+word, not color alone.
6. Save success only after canonical acknowledgment. Save in-flight retains draft, prevents duplicate submit. Error preserves all user work and offers Retry/Edit. When remote status ambiguous, show `Checking whether this saved` rather than assuming success or repeating an unsafe write.
7. `Why this?` + `Explore science` and original sources accessible on every evidence-based card; no clinical classification or target without eligible reviewed rule. No fabricated projected results.
8. No coercive streaks, shame copy or unexplained automatic plan changes. Celebration applies to confirmed action completion, never predicted clinical improvement.

## 2. Everyday Today — screen design and tap contract
**Hero:** compact greeting and today's local date + date navigation; one informative status graphic based *only* on valid tracked totals/targets, otherwise readable `No recorded data yet` without empty fabricated progress ring. Do not make a calorie ring unavoidable if user hasn't enabled a relevant target. Warm botanical imagery may enrich whitespace but not obscure nutrition values or imply food identification.

**Visible first viewport:** primary `Add food` action/card; compact `Today so far` total where actual source exists; fast-access `Recent` and `Favourites` only with real records; a one-line actionable insight with source qualification. No forced onboarding, uploads or wearable connection.

**Add food tap:** obey established chooser/contextual flow; show available methods accurately. A quick Favourite/Recent tap goes straight to **the same canonical draft**, not silent auto-save; one contextual tap can enter a portion with prior serving prefilled. No camera automatically launches from simply entering Today.

**Recent/Favourite empty:** do not draw fake food photography. Provide `Your recent foods will appear here after you log a meal` and working `Add food` link. Source outages permit manual entry.

**Today actions:** `Add food` -> select method -> draft -> review -> save -> show confirmed success and updated totals; `View day` -> Today detail; `My Biology` -> evidence summary; `Progress` -> dated charts. **No duplicate journal stores or parallel totals.**

## 3. Food quick entry and canonical Review meal — precise UX
**A. Capture:** choose approved scan/search/describe/photo/restaurant (only enabled and legally approved methods). Search allows multi-select into a persistent plate/tray; a selected food shows name, source identity, household quantity and an adjustable number. Each add changes the draft, not the saved journal. Frequent/favourite shortcuts have stored servings and can be changed before confirm.

**B. Review header:** exact `Review your meal`, description or source beneath, count of recognized foods if supported. Ingredients in one-line scan rows: `[food name] · [human-readable portion]` with supporting chip `Label verified / Estimated match / Needs review`; trailing `Change`. A row tap opens item selection and portion correction, then returns to same review scroll position. When uncertain, show clear warning under that row; no engineering codes or large repetitive boilerplate.

**C. Summary panel:** Calories, P, C, F computed from **the same canonical persisted-version nutrient function** as detailed macros/vitamins/minerals. Show real numeric 0 only for actual verified zero; `—` for unknown; `Partial` for incomplete coverage (retain known contributions as partial if supported). If source detailed sums are present but header says zero, treat as release-blocking parity defect. No invented numeric values from AI concept illustrations.

**D. Save:** one filled `Save meal` control. Click -> pending state -> acknowledged save -> compact confirmation; Today and Progress refetch same canonical meal. Uncertain provider or failed save stays in review, all ingredients and edits intact. Repeated taps/retry idempotent. Editing saved meal uses same review component, clearly marks edit mode and supports cancellation without mutation.

**E. Special paths:** description recognition uncertain -> editable candidate, not forced search for every recognized item; exact branded SKU only when verified; impossible portion -> prompt to correct unit; allergy/medical restrictions -> never quietly substitute; unavailable barcode/photo -> keep method listed/labelled honestly and route to an approved fallback; 320px, large text and VoiceOver must support every ingredient control.

## 4. Athlete workout — exact UX and state machine
**Header:** session label, phase or scheduled date, planned exercise count and time (where real). Dense dark athletic composition; no decorative effort/recovery score. One highlighted current exercise and an orderly collapsed list of upcoming exercises.

**Set table:** `Set`, `Previous`, `Weight`, `Reps`, completion. Previous means confirmed prior actual data, includes unit and visible previous-session date in details. If no history: `No prior set`. Weight/reps inputs numeric, large touch areas, sensible auto-advance strictly after user action, never unexpected focus changes when screen opens. Unchanged values may be prefilled only with clear user control.

**Complete set:** activate once -> locally pending, then confirmed actual completion -> discrete check/haptic only where supported. Optional rest timer starts after acknowledged completion IF the person enabled it. Timer is adjustable, pausable, skippable and does not dictate recovery. Undo/correction returns to previously editable set without duplicate record.

**Skip/rest:** `Skip set` or `Rest today` exists without shame or forced makeup programming. Plan edits show before/after/why; `Accept`, `Edit`, `Keep original`, and `Undo` operate on versioned proposed changes, not live hidden mutations. Session final `Finish workout` clarifies what is completed vs skipped; user decides whether to save partial session.

**No data / unavailable:** Workout logging works manually without watch, Coach, readiness engine or Apple Health. Sync state labels reflect import freshness and original source; combined manual/watch activity not double-counted.

## 5. My Biology / Bloodwork — information architecture and safety
**Landing:** domain cards in source-report order, e.g. `Lipids & Cardiovascular`, `Liver & Biliary`, `Endocrine`; every card lists observed marker count and verified most recent date; no `all optimal`/green score without reviewed test-specific eligibility. Preserve original imported section separately from standardized Bloom categories. Choosing a domain opens dated panel list.

**Panel:** date selector first, then category headers, then rows showing marker, original/normalized value with explicit unit provenance, measured-date and eligible status if defensible. Search, filter, and sort never lose original grouping information. An unrecognized assay still appears as saved/uninterpreted rather than being dropped.

**Marker detail order, non-negotiable:** (1) Name, observed value/unit/date/source; (2) plotted *measured* points and observed numeric change only if compatible, with caveat when uncertain; (3) `What does this measure?`; (4) `What does your result mean?`; (5) `What could you do?` only for Biology-approved applicable actions; (6) `Explore the science` sources/method/reference, original report, and correction controls. User can expand without leaving marker. Relevant comparison may be shown but lab interval vs clinical target vs suggested comparison must be distinct.

**Import:** Upload/Paste -> preview grouped source sections/counts, date and original unit -> correct exceptions -> confirm import -> view grouped results. Raw entered number retained; guessed units require explicit `System guess — confirm unit`. No trend classification from provisional values; provisional history still inspectable. Multiple samples remain dated and selectable. Unknown fields stay `Not provided`.

**Escalation:** No alarm or urgent medical suggestion without reviewed clinical rules and approval; a neutral context caveat may say data are incomplete, never imply dangerous tests are harmless.

## 6. Progress — UX
Top segmented domain switch `Nutrition / Activity or Training / Biology` within Progress (not top-level routes). Default to the person's currently relevant data; never show decorative fake charts. Range switch `Week / Month / 3 months / Year / All` only where enough dated data; unmeasured intervals are gaps, not interpolated perfect curves. Body metric charts use actual plotted observations and source/comparability labels; logged-day bar charts show explicitly counted records, not guessed physiological activity. Each tile answers: `What changed?`, `Compared with when?`, `How certain is that?`, `What could I do next?` where eligible. Tap plotted point or data row -> exact record/source/correction, not a fabricated diagnosis.

## 7. Motion and delight states
- Tap: 120–180 ms opacity/scale response; never animation at expense of prompt feedback.
- Successful canonical save: 180–260 ms restrained count/row transition plus confirmation copy; do not show check before server acknowledgment.
- Expand biomarker explanation: reveal contiguous section without dramatic layout jump; maintain focus and scroll anchor.
- Switch Progress range: animate existing chart layers <=260 ms only if no falsified in-between observations; for `prefers-reduced-motion`, snap immediately.
- New workout set: subdued blue highlight; rest timer only user-enabled, skip always possible; no flashing status.
- Persistent errors never auto-dismiss; successful toast can disappear but status remains ascertainable.

## 8. Required design-fidelity screenshot/state matrix
For EACH of Everyday Today, Food Capture, Review, Athlete Session, Biology Overview, Marker Detail, Progress, deliver 320 / 375 / 390 / 430 px phone; desktop 1280 px; light and dark where applicable; 200% zoom; VoiceOver+keyboard focus pass; and state variations **first use / populated / loading / incomplete or provisional / failure / saved**. Images from concept renders never count as those runtime screenshots. Provide exact commit, feature flags, fixture IDs, source checks and baseline diff for Design review.

### Immutable scenarios
1. First use with no profile and no connected device -> Add Food manually immediately available, no fake rings.
2. Five-food described meal -> editable candidates in one draft, change one without duplication; real source macro details match top overview *including zeros vs absent*.
3. Saved prior meal repeated -> quantity edit before save, one journal record, totals and Progress update exactly once.
4. Active Athlete session -> previous verified set, numeric entry, complete -> optional timer -> correction/undo; no false completed on pending.
5. Rest day or a skipped week -> no guilt or automatic catch-up.
6. LDL observations with missing reference/method -> visible dated points and numeric direction, no invented 'optimal'; applicable science and sources one tap away.
7. Imported panel retains section headings `Lipids & Cardiovascular / Liver & Biliary / Endocrine` across import, view and export.
8. Zero/offline/partial import -> honest status, durable correction path, accessible next action.
9. 320px/200% zoom -> no concealed buttons, data overflow, autofocus trap or overflow text.

## 9. Acceptance and handoff workflow
**Architect:** reconcile with approved requirements, assign existing functionality and intended route/component identifiers; ensure no new competing database/workflow; record design conflict instead of inventing alternate interactions. Reference this document **by path and ID** in developer work item. **Developer:** copy bundled reference files into repo under `design/bloom/flagship/` (without unauthorized font distribution); implement UI against existing state/data contracts, provide real screenshot/state matrix and interaction tests. **Design:** check layouts, flows, writing, motion, light/dark, edge cases and exact-build visual fidelity; only Design can confirm UX/UI conformance, and the owner can override design direction. **Biology/Legal/Security:** independently authorize scientific claims, sensitive-source handling and actions before enabling. **User Testing:** validate actual tasks with real build and independent participants. No team may mark delivered based solely on handoff or generated concept art.

**Supersessions:** Enhances `MKT-FLAG-2801–2808` and `MKT-PREM-2701–2708`. Visual art direction supersedes the *plain styling* of prior wireframes, **not** approved flows, original data constraints, Coach workspace ownership, or original brand tokens.
