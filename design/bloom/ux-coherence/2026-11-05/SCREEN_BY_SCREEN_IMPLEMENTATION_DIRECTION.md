# BLOOM — Binding proposed screen-by-screen simplification specification
**2026-11-05 | Branding & UX | For Chief Architect approval and Codex implementation**
**Decision: REVISE CURRENT COMPOSITION; KEEP FUNCTIONALITY, BRAND, NAVIGATION AND DATA SAFETY.** This replaces overly abstract UX improvement advice with precise interface decisions. It is a specialist handoff, not authority to bypass Architect prioritization or clinical/legal controls.

## Product position
Bloom should behave like an exceptionally usable consumer app with optional scientific depth. On default screens **tasks or understandable findings** take priority over source/system details. Scientific truthfulness remains intact: uncertainty needs one short, relevant sentence when it affects interpretation, not repeated warnings everywhere.

## Universal screen construction (approved brand, no new framework)
1. **Header**: one concise title and optional date/context; omit decorative kicker + introductory paragraph + large hero repeated on every tab.
2. **Primary zone**: the thing this page is for: log meal, current set, next step, selected finding or trend. At most one visually dominant filled button.
3. **Secondary zone**: at most two adjacent short actions/compact summaries in first viewport; more content is stacked below, collapsed or linked.
4. **Depth**: tabs or expandable rows for history, methods, full datasets, sources and scientific studies. Never keep an accordion of repeated legalistic caveats visible by default.
5. **Recovery**: inline human-language status next to affected control; user edit retained; explicit no-data state and retry; success only after real save acknowledgment.
6. **No forced universal hero**: `CompanionHero` is appropriate when it genuinely conveys the page's main action, not as a compulsory repeated banner on Today, Food, Biology and Athlete.
7. **No numeric card quota on intentionally analytical pages**. Budget first viewport attention on landing/task screens; scientific deep-dive views can be information-dense after explicit user navigation.
8. Use canonical `client/public/brand/design-tokens.json` and current approved flagship `design/bloom/flagship/2026-10-26/contracts/UX_BLUEPRINT.md`. Everyday green/light and Athlete navy/blue identities are deliberate. Do not generate new parallel palettes or duplicate navigation.

## Today — `Dashboard.tsx`, `TodayFocus.tsx`, `TodayFoodSummary.tsx`, `TodayPlanner.tsx`
**Above fold:** compact date/greeting, ONE current primary task panel (often `Add food`, or contextually `Review planned session`), 1-line reason, one filled CTA. Immediately beneath: a low-profile `Today so far` line/card based on actual journal entries; two secondary text links `Recent foods`/`View day` only when available. **Do not simultaneously render multiple full-size `CompanionHero`, research, planner, inspiration and status panels.** Research and planning live below first viewport or in their destinations. Unknown nutrition is `Some nutrition information is missing`, not a technical diagnostic paragraph. When no data: invitation to add first meal, no empty rings, no wall of unavailable metrics. Acceptance: on 390px mobile a user can state next step immediately; main button visible without competing filled buttons; food save returns to updated Today.

## Food — `LogMeal.tsx`, `FoodEntryChooser.tsx`, `ProductPicker.tsx`, `MealAnalysis.tsx`, `SavedMeals.tsx`
**One journey:** choose capture → find/select food → edit serving/amount in same draft → `Review meal` → one `Save meal`. Make search/manual and recent/favourites easy, barcode if usable; optional photo and restaurant are tertiary and capability-labelled, not equally prominent tiles. **Do not repeat source, uncertainty and nutrition disclaimer on every ingredient.** Each item gets simple `Exact product`, `Estimated`, or `Needs review` only as applicable; one combined note for partial information. Review puts foods and amounts first; compact calories/protein/carbs/fat second; full micronutrient and original-source information in `Nutrition details` and `Food source`. Keep error at field/item with `Change` and no lost draft. Save pending and confirmed distinct. No unverified data forced to zero. Acceptance: dinner with two foods, edit one portion, save, correct saved meal, see matching Today/Progress.

## Athlete — `AthleteWorkspace.tsx`, `AthleteHome.tsx`, `ActivitySetEditor.tsx`, `ActivityReview.tsx`
**Workout mode:** session name and modest timer/elapsed time, one large **current exercise**, compact previous actual set and direct editable weight/reps/current-set completion. Next exercise appears collapsed. Start/resume/finish clearly exclusive by state; no competing `build training day`, `fuel`, `recover`, physiology explainer or multiple heroes while a workout is underway. Preserve one-tap completed-set and reversible correction, optional rest timer, explicit unit, confirmation after save. Athlete planning screen may show training, fueling and recovery as separate quieter sections **when not inside an active workout**. Acceptance: complete three sets with no detour into profile/science; keyboard/touch edits straightforward.

## My Biology — `BiologyHome.tsx`, `BloodworkSourceOverview.tsx`, `LabExplorer.tsx`, `Microbiome.tsx`
**Landing:** title `My Biology`, one gentle summary `Your health information` and a **list of four clear destinations**: Bloodwork, Gut reports, Genetics, Measurements. Each row shows only useful state like `22 recorded results`, `Report added`, or `Add your first report`. Remove a mandatory large bloodwork hero for all users: its priority depends on current user context, and it duplicates the Bloodwork row. No full source detail or caveat under all four.
**Detail:** one selected finding or report summary first, trend where genuinely comparable. Sections/tabs `Results`, `Trends`, `Original report`, `What it means` when available. Clinical/assay limitation appears as short on-card text when crucial; technical source revisions/units are in detail, except units needed to interpret a displayed measurement. Microbiome: separate `Organisms`, `Viome ratings`, `Food suggestions` where actual source PDFs support them; never pretend categorical data are numerical.

## Genetics — `GeneticHighlights.tsx`, `GeneticsCatalogue.tsx`, `GenotypeExplanations.tsx`
**Landing:** one `Your genetics` introduction; concise **source-observed** educational highlights and only independently approved **personal effect** interpretations when eligible; no pressure to pad to 3–5. Default 2–4 cards is a presentation hypothesis, not a promise. Each card: plain-language title, gene+variant in secondary type, 1–2 lines of why it matters, single `Why this? / View details` disclosure. One `See all results` and `Explore genes` route. Do **not** place five catalogue/review/count widgets above highlights; coverage counts move to `About your genetic data`. Consent-sensitive traits never auto-promoted. No universal genetic health score. No blanket empty state if valid general education can be shown.

## Explore / Science — `Explore.tsx`, `EvidenceInsight.tsx`
**Landing:** search and 3 understandable subject categories (e.g., organisms, genes, molecules/pathways); a small `Recently explored` row if real history exists. No feed of all research studies or big technical knowledge-graph labels. On a topic: `What it is` → `Why researchers study it` → `What we know / don't know` → one `Studies and sources` expansion. `What's changed` appears only for reviewed meaningful claim revisions; no competing research ticker.

## Progress — `Progress.tsx`, `FoodProgress.tsx`, `LabTrend.tsx`
**Landing:** a select period, then one useful trend chart from a verified metric or clear `No data yet`, with 1–2 concise companion trends; categories elsewhere. Do not render a carousel of unrelated progress, disease/research, workout and nutrition charts equally prominent. Existing tab navigation for detailed categories remains. Never fill chart gaps with zeros or join incompatible units/methods; preserve source in tap/expand.

## Profile — `Profile.tsx`, `ExperimentalSettings.tsx`, `ConnectionsOverview.tsx`
**Top:** Account, Units & preferences, Connected data, Privacy & export; each as clear grouped rows. Development tools, optional experimental flags, migration/source diagnostics and account-security minutiae belong in expanded `Advanced` with authorized role gate. Privacy choices remain findable directly. No oversized welcome or repeated companion hero.

## Copy translation: ship these patterns
| Avoid on landing pages | Use by default | Retain in detail |
|---|---|---|
| `claim eligibility` | `We haven't confirmed what this finding means for you` | specific reviewed claim requirements |
| `source revision` | `This result was updated` | exact version history |
| `provenance` | `Where this came from` | report ID/date/method/immutable receipt |
| `assay normalization unresolved` | `We couldn't reliably read this result` | build, strand, normalization |
| `source-only` | `Recorded result — explanation not available` | technical status |
| `partial nutrient coverage` | `Some nutrition information is missing` | per-nutrient validity and source |
| `interpretation withheld` | `We don't have enough information to explain this yet` | reason/consent gating |

Only display a warning at first glance when it changes whether the result may safely be relied on or acted upon. One concise sentence is usually enough; details one tap away. Do NOT suppress critical allergy, measurement unknown, false genetic interpretation, consent or health risk caveats merely for visual cleanliness.

## What to remove, merge, hide (not delete features)
- Merge duplicated introductory hero + landing title + next-step panels into a single primary zone.
- Replace multiple equal-weight cards with compact rows and navigation to deeper dedicated views.
- Move developer strings like `source-only`, `review eligibility`, `specimen source mismatch` into evidence/source details, with human status inline.
- Shift methods, scores, scientific relationship diagrams and full variant lists out of default landing viewport.
- Do not delete original source pages, labs, genetic notation, technical audit access or user export; only reorganize discovery.

## Release acceptance — observations not assumptions
1. At 390px height-first viewport, document *one* element user's eye goes to and *one* primary action. If ambiguous, FAIL hierarchy. At 320px/200% zoom, action and relevant caveat stay reachable.
2. For each primary route, before/after screenshot of default, first-time empty and one error state. Check text length and layout, not solely shared colours.
3. Observe a novice: ask `What is the main thing you can do here?` and `Where would you go for details?`. Two answers should match intended task. Record failure and re-test.
4. Critical flows: Food→Today→Progress; Athlete set save; Biology original report; Genetics observed vs inferred; Profile account/units. No loss of work through UI rearrangement.
5. Whole-screen visual/interaction review at exact deployed SHA. Branding owns design pass; User Testing independently checks novice comprehension; Biology/Legal/Security retain their own claims and controls.

## Build order for Architect
**P0 UX coherence fixes in currently touched v0.5 journeys:** Today primary CTA and card competition; Food review/save; active Athlete set; Biology landing duplication; technical copy causing confusion; material 320px/zoom/accessibility defects.
**P1:** Progress composition, Explore discoverability, Genetics top+all hierarchy, Profile grouping and science detail consistency.
**Do not stage a separate broad redesign or new page framework.** Reuse existing UI components, tokens and routes; implement in a small number of route-complete slices with before/after and screenshot acceptance. No paid/new providers. No owner decision needed.
