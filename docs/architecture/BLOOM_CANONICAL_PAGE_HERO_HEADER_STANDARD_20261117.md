# Bloom — Canonical Editorial Page Hero/Header Standard
**Owner directive:** 2026-11-17; **priority:** standing P1 design-system requirement, incremental with current approved work
**Status:** CHIEF ARCHITECT APPROVED implementation specification; screenshot/asset handoff state described below; NOT proof of rendered implementation
**Branch:** `enhance/bloom-experience` · **Owner-supplied reference:** Bloodwork landing screenshot 2026-11-17 (10:50 phone screenshot), exactly 706×1536 px, JPEG SHA-256 `361b5f47c99fd4275a769f5cf0f76f159de237c0d242224867a524028ed9a2f6`.

## 1. Scope, precedence and intent
**Apply this hero/header pattern to the top of every primary application page** across **Everyday** and **Athlete**, and future authorized **Coach**, including Today, Food/journal, Meal Planner, Activity Log, Explore, Progress, Biology, Bloodwork, Microbiome, Genetics and related substantial screens where a hero is appropriate. Reuse the existing approved Bloodwork landing hero as the visual quality/template reference. The **shared header pattern** is intentionally consistent; the **page body/feature UX remains purpose-built** and must not become a clone of Bloodwork or the LDL marker-detail view. Distinguish **page hero/header** from persistent global app navigation; retain the latter's correct mode and responsive semantics. Do not add redundant giant banners to tiny dialogs, drilldown fragments or repeated subpanels without utility.

**Preserve completed art and real function:** This is explicit authorization to conform page-level *header presentation* while retaining canonical assets, chart science, source fidelity, buttons and page interactions. The earlier mobile Biology/Microbiome preservation rule does not prohibit this owner-directed header alignment; constrain modifications to header and required surrounding transitions, not unrelated already well-refined content. The separate approved LDL **expanded marker** screen remains its own editorial visual reference with its own layout and does not need to become a landing-page hero.

**Standing governing references:** `BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md`, `BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md`, `BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md`, `AGENTS.md` and current `NEXT_ACTIONS.md`. This standard changes visual **how**, not the active backlog **what**.

## 2. Actual reference image — mandatory pixel fixture
**Exact user-uploaded screenshot:** `docs/design-references/app-headers/approved-bloodwork-page-header-20261117.jpeg`. It depicts the live Bloodwork landing hero, not a mockup of a different feature. Source asset: owner upload `F9DF5FF7-3206-488B-A350-B13D93C72F7A.jpeg`, native 706×1536, SHA-256 above, 203,514 bytes. A matching Codex-ready ZIP under `/mnt/data/bloom_header_reference_for_codex.zip` was prepared for transfer with the correct `docs/design-references/app-headers/` path. **The image binary must be present in GitHub (or another authenticated Codex-readable persistent location) and opened for direct pixel comparison before declaring visual reference acceptance.** A text-only note and a file path without bytes do NOT satisfy this. When the binary cannot be verified on the branch, explicitly record `IMAGE_BINARY_NOT_DELIVERED`, request/obtain the prepared file from the attachment, and mark `REFERENCE_VISUAL_COMPARISON_NOT_TESTED`. Do not generate a lookalike to substitute for the owner's screenshot. This screenshot is a QA/design reference **not** a runtime image or a grant of rights to copy its depicted artwork.

Reference-specific visible features to reproduce, without literally hardcoding text:
- **Single generously sized, softly cornered immersive image surface** positioned just below the **existing** global mode/navigation bar; balanced safe inset to the page edges. Image is atmospheric and text-safe, not fully obscured by a dark filter or busy crops.
- **Quiet, premium living-material hero backdrop**, overlay gradient for readable contrast, art subject offset away from prominent live text.
- **Small uppercase eyebrow/kicker** with generous tracking and ivory/appropriate themed contrast: screenshot uses “YOUR BIOLOGY, WITH CONTEXT”; choose page-specific expressive but concise kicker.
- **Large distinctive editorial serif title**, screenshot “Bloodwork”, with confident hierarchy and readable line wraps.
- **Short purpose-specific deck** (one or two concise lines where feasible), with meaningful live page-specific summary count or context beneath it. In screenshot: “Explore your results, with dates, units and source details.” and “145 recorded results”; use real current data and state, not the screenshot's count.
- **Bottom-aligned 1–2 meaningful actions**: prominent warm ivory filled primary control, secondary low-chrome text/outlined action. Actual actions vary (Bloodwork “Add lab results” / “Manage reports”); do not force extra buttons on a page without useful actions.
- **Natural height/spacing** that keeps title, summary and actions jointly readable without overscrolling or giant empty blocks; layered tactile materials, correct text/image contrast, clear action focus and tap target.
- **Transition to the page's next meaningful section** with shared warm, botanical editorial language but page-specific arrangement, not a mandatory duplicate “Your panel, together” card.

## 3. Same skeleton, context-driven content and mode
| Header element | Canonical consistent structure | Dynamic per view |
|---|---|---|
| Image backdrop | One approved registry asset/semantic reserved fallback with correct responsive crop and overlay | Biological vessels, food, botanical scenes, activity motion, progress landscape, athlete context, future coach etc. |
| Kicker | Small tracked uppercase, accessible contrast | Relevant feature/category statement rather than repeated generic tag |
| Main title | Expressive serif, dominant focal hierarchy | Exact page title, wrapped intelligently |
| Deck | Plain-language one/two-sentence purpose | Useful description; no duplicate technical disclaimers |
| Dynamic context | Small live supporting cue | Result count, logged items, relevant goal or current state, only when known |
| Actions | One meaningful primary and optional secondary, consistent styles | Feature-appropriate task; no fake navigation/nonfunctional buttons |
| Mode | Shared material/type/spacing grammar | **Everyday botanical forest/ivory**, **Athlete approved blue**, **Coach approved purple when enabled**; preserve original mode tokens/accessibility |
| Composition | One editorial hero role, same semantic structure, adaptive sizing | Mobile vertical, tablet transitional, desktop spacious split/offset text-art where appropriate |

## 4. Existing asset inventory and missing imagery decisions
The branch already includes a **canonical** `docs/visual-assets/visual-asset-registry.json`, generated `client/src/content/visual-asset-ids.ts` and existing editorial media mapping `client/src/content/editorial-media.ts`. **Do not create another registry or directly hand-edit the generated asset-IDs file.** Actual entries inspected include:
- BVA-0001 Today, BVA-0002 Food, BVA-0003 Biology, BVA-0004 Explore, BVA-0005 Athlete — existing hero records/slots (delivery and current crop must be verified before visual acceptance).
- BVA-0009 Bloodwork landing — **already integrated**; preserve original image bytes and current successful hero structure, reuse header styling/geometry rather than replacing media.
- BVA-0017 Microbiome existing category hero; BVA-0019 Explore atlas; BVA-0021 Progress scene; BVA-0023 Athlete recovery; BVA-0024 Coach header (do not activate Coach without authorization).
- BVA-0032–0035 Biology source banners and existing original scientific assets remain; do not repurpose as fake page photos.
- BVA-0051 new Microbiome overview hero requested/reserved from an earlier distinct owner directive; **do not substitute another existing hero contrary to its dedicated art brief**. Use truthful reserved surface until new suitable source art delivered.
- **Activity Log header currently has no clearly dedicated registered hero** among inspected general entries. Add additive BVA-0052 `Activity Log editorial hero` as **requested** with no source file, bytes, hash, rights or review asserted; visual component may display intentional reserved fallback, not a broken image or generic clipart. Search current app before implementing any new asset; if a suitable existing **approved** image is already present, reuse it with its original ID and do not add an unnecessary duplicate.
- For Food diary/planner, Today subpages, Progress and other routes: **reuse an existing on-topic hero when suitable**; where no suitable asset exists or a distinct new hero is needed, register a separate `requested` ID in the canonical registry with placement, art brief, text-safe crop, alt/decorative semantics and truthful pending lifecycle. Do not invent an exhaustive list of unneeded images in advance; inventory exact route/component first.

**Reference image != runtime asset:** `docs/design-references/app-headers/approved-bloodwork-page-header-20261117.jpeg` is for design QA; do not add it to production `editorial-media.ts` or visual asset registry as an app hero. It contains UI and personal-looking placeholder values.

## 5. Component and CSS architecture
Use **one** canonical reusable **page-hero presentation primitive** (or extend the existing effective Bloodwork hero component) shared across Everyday/Athlete/Coach, with props/slots for `eyebrow/title/description/supportingContext/imageAssetId/primaryAction/secondaryAction/mode`. Reuse current button, typography, editorial media and mode/theme tokens; avoid building a parallel card library or replacing global nav.

**Illustrative contract (adapt to actual code, not duplicate it):**
```ts
type BloomPageHeroSpec = {
  assetSlot: string;                 // MUST resolve to existing canonical registry entry
  eyebrow: string;                   // per page
  title: string;                     // per page
  description?: string;              // concise + truthful
  contextText?: string | null;       // data-backed; unknown remains unknown
  primaryAction?: React.ReactNode;   // real page action
  secondaryAction?: React.ReactNode; // optional real page action
  presentationMode: "everyday" | "athlete" | "coach";
};
```
Keep content/permissions from the original page controllers; do not make the hero own API requests, source math, identity, role permission checks or extra state. Semantic actual headings (<h1> once), actions as buttons/links, keyboard and screen-reader semantics. A primitive with meaningful variation is desirable; one universal copied page **body** is not.

**Device behavior:** At 320/390 mobile, title/deck/actions remain legible without image focal conflicts or clipped controls, small-screen safe area and bottom navigation preserved. At tablet 768, content reflows intentionally. At 1024/1440, hero can use a broader panoramic aspect or tailored picture variant to occupy the editorial stage; don't simply make mobile content enormous. Light/dark, Athlete-blue/Coach-purple, high contrast/forced colors/reduced transparency/motion all retain readability. Prefer CSS container queries and tokens over device-specific JS branches. Keep imagery original and preserve existing source/asset hashes.

**Avoid:** embedded headings/buttons baked into generated art; generic stock medical imagery; arbitrary hardcoded height that causes vertical emptiness; unreadable text on detailed imagery; inaccessible color-only mode distinction; duplicated header under a global nav; repeated hero for every minor subpanel.

## 6. Representative per-page content brief (editorial suggestions, not hardcoded text)
- **Today:** “Today” / calm current-day context / one eligible primary next action, perhaps view plan or log quick entry; maintain the existing actual Daily Intelligence action meaning.
- **Food:** “Food” / practical nourishing imagery, logged food context / “Log food” or “Add meal” and optional meal-plan action; do not mark suggestions consumed.
- **Activity Log:** “Activity” / approved active movement visual or reserved art / “Record activity” and optional view history; do not invent burned calories or completed session.
- **Explore:** “Explore” / rich botanical biological atlas / “Explore biology” or current real discoverability action.
- **Progress:** “Progress” / longitudinal editorial scene / “Add measurement” where applicable or review recorded changes; preserve actual source and trend meaning.
- **Athlete:** "Training" / existing athlete visual and blue mode / appropriate workout/recovery action, never force ordinary Everyday logging into Athlete-specific setup.
- **Coach (future):** "Coach" / purple mode and permission/role-appropriate context; retain private grants/visibility and don't expose before authorization.
- **Biology, Bloodwork, Microbiome:** keep valuable existing page-specific science imagery and relevant content; apply the shared structural grammar without changing protected charts, organism art, original sources, or unrelated content.

## 7. Visual and functional acceptance
For each **touched primary page** (not a mandatory all-page rewrite immediately):
1. Codex loads the **actual** screenshot at the canonical reference path; if missing, mark reference QA not tested and fix delivery. Maintain original image SHA in the reference manifest.
2. At **320/390/768/1024/1440 CSS px**, capture actual rendered screenshots for realistic page content, in Everyday light/dark and Athlete blue variants (future Coach purple when authorized). Check portrait safe areas, typography, composed text-safe imagery, proper action placement, desktop width usage, no overflow, touch/keyboard focus and zoom.
3. Review **header structural fidelity** separately from **page-specific experience quality**, and both separately from **brand coherence**. Confirm real imagery (or truthful reserved fallback) is actually rendered; no copied UI pixels inserted as media.
4. Verify preserved original source functionality, chart/organism interactions, login/role/consent, data-dependent counts, modes, original media hash/IDs, accessibility, source/assay correctness, correction/edit actions, no duplicate submitted mutation.
5. Record exact SHA, tested app/preview evidence, and `PASS/FAIL/NOT_TESTED`; functional unit tests alone do not satisfy image QA. No invented screenshot comparison or asset approval.
6. When images are missing, include requested placeholder & asset brief in canonical registry **as part of the touched page's implementation**; do not make every pending hero a blocker to safe working functionality.

## 8. Priority and release discipline
This is a **standing design-system correction** aligned to the existing application-wide approved visual DNA; integrate iteratively alongside `NEXT_ACTIONS.md`. Do not interrupt source-safe v0.6 work, Food #12 or Response #15 for a speculative app-wide rewrite. No new page framework, technology migration, synthetic clinical data, duplicate asset registry or per-image owner review gate. Preserve current reviewed art and actual implementation receipts; status tracked by real code and screenshot evidence.

**Definition of done:** A user immediately recognizes the same premium Bloom editorial page header on Food, Activity, Today, Explore, Progress, Biology, Bloodwork and Athlete, with feature-specific text, actions and appropriate approved/registered imagery. Coach will use the same grammar with its approved purple palette when enabled. Pages remain distinct below the header and scientifically/functionally intact.
