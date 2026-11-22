# Bloom EE-01 — Swipe-to-unfold periodic table: prototype and Codex handoff

**Status:** `PROTOTYPE_ENGINEERING_TESTED / OWNER_VISUAL_APPROVAL_PENDING / NOT_APP_INTEGRATED / NOT_DEPLOYED`. Design direction supersedes the older five-tap prototype. This document is a handoff, **not** a new implementation queue or authorization to displace P0–P2 work. Follow `AGENTS.md`, `NEXT_ACTIONS.md`, and the owner-approved scientific Easter egg handoff.

## Exact package

Shared Library (verified upload): `/Bloom gut health/Agent Handoffs/Bloom_Secret_Periodic_Table_Swipe_to_Unfold_Prototype.zip`

ZIP SHA-256: `1c6c89825110b42375fa26e6a678f0164ad5cebce00626a81b9452a27cc7e4f9`. ZIP integrity and per-file manifest hashes verified.

Contents: `index.html`, `styles.css`, `app.js`, `periodic-elements.json` (118 chemistry reference records with period/group/grid position), `desktop_demo_preview.png` (actual Chromium-rendered illustrative screenshot), `README.md`, `QA_RESULTS.md`, `manifest.json`.

## Interaction design

- On pre-1.0 About screen the **Genesis botanical identity** is shown, not public Hydrogen. The resting tile is swipable horizontally on touch and draggable on desktop; 48 CSS-pixel horizontal threshold with vertical cancellation and pointer cancellation. An explicit **Explore Bloom's elements** button and keyboard Enter/Space activation are provided.
- A ghost of the source tile tilts/lifts while a CSS 2.5D transform expands the sheet from the tile's approximate screen origin. On closing, the sheet softly folds back; focus returns to the initiating control. Reduced-motion renders directly without animation.
- All 118 actual chemical elements are in an 18-column periodic-table layout with La/Ac series placeholders and 15 lanthanides/actinides in two separated f-block rows. On mobile the table scrolls horizontally instead of shrinking to illegibility.
- Only **verified published** milestones should illuminate. This standalone prototype deliberately has **zero** published milestones; the optional clearly labelled fictional demonstration lights H/He/Li/Be corresponding to 1.0.0/1.1.0/1.2.0/1.3.0. These are *not shipped release claims*. Clicking a demo tile shows illustrative highlights. No dates are invented.
- Four appearances: Everyday Light/Dark and Athlete Light/Dark, inspired by approved REL-A06 design direction. No external scripts, analytics, network calls, personal records, persistence, or third-party assets.

## Reuse and integration boundaries

- **REUSE EXISTING** approved REL-A01 v3 tile and REL-A06 tokens/motion when actually integrating; the standalone prototype's Genesis glyph and typographic logo are placeholders, not approved replacement brand assets.
- **CODE-GENERATED** 118-element static chemistry data, CSS/DOM release states and unfold motion. Chemical reference metadata is separate from the app's authoritative `shared/product-release.ts` release assignments.
- **DEFERRED** EE-02 Genesis transition, EE-03 DNA, EE-04 organism facts and EE-05 logo reveal. No duplicate release database, animation framework, gamification service, analytics or new global state.
- The approved release mapping advances **chronologically for major/minor named releases**, with patches inheriting the existing element. Do not derive releases from `package.json`, do not assign 2.0.0 arithmetically, and do not display Hydrogen as shipped until an authorized public 1.0 release.
- Implement as a bounded future P3/P4 task under the active execution queue. No app code, protected deployment configuration or hosted service was modified.

## Test receipt and outstanding gates

Automated headless Chromium DOM-render tests passed: 118 cells; 0 live published; 4 opt-in demo illuminated; selection details; explicit button; mouse drag; vertical drag cancellation; Escape; keyboard Enter; focus return; four theme changes; 390px horizontal overflow; normal and reduced-motion open/close. JS syntax, static placement uniqueness, manifest hashes and ZIP CRC passed.

**Not verified:** physical touchscreen swipes, assistive screen-reader usability, forced-colors/200% zoom, full viewport matrix, contrast certification, actual Bloom React integration, actual published release metadata, deployment or independent acceptance. This prototype is ready for owner design review and Codex reference only.
