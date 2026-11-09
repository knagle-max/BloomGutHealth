# BLOOM — R4 MOBILE MEDIA & EDITORIAL EXPERIENCE: FULL PRODUCTION BUILD SPEC (M1)
**Prepared:** 2026-11-07  |  **ID:** UX-R4-MOBILE-MEDIA-M1  |  **Target:** `knagle-max/BloomGutHealth` · `enhance/bloom-experience`
**Status:** Implementation-ready Structural UX contract / Designer paint resolved in §3 and Appendix M1-D / 13 raster compositions (26 WebP variants) DELIVERED IN SHARED LIBRARY, NOT REPO-IMPORTED / runtime QA NOT TESTED. This document is additive to the latest R4 master with Designer Appendix V and 204-key proposed Branding copy table. It does not remove or reinterpret existing scientific behavior.

## 0. Executive correction, authority and source certainty
**Problem observed from current branch code:** the mobile UI has premium typography and tokens but many original illustration/photographic references are absent from page markup. CSS v2.4 only paints art for opted-in `.bv-editorial-hero[data-bv-art][data-bv-art-safe="true"]`, whereas the verified `CompanionHero` emits `.today-focus` and a 54px generic brand icon. Existing breakpoint at ≤639px shrinks its optional art to 110px at opacity `.07`. The D3-R media package has since been produced and file/hash verified in the Shared Library; presence in the GitHub branch or deployed app is NOT verified. The original inspected repository finding is historical, not current asset-production status. The R4 Batches 1–6 archive contains 87 SVGs; those are real available inputs, not WebP substitutes.

**Evidence tiers:** `VERIFIED REPO` exact source code read from branch on 2026-11-07, not screenshot proof; `VERIFIED ASSET ARCHIVE` SVG names/bytes/hash in the attached production ZIP; `R4 SOURCE` prior owner-approved structural/design constraints; `NEW UX DECISION` the mobile compositions and behavior described here; `TO COMPLETE` means an *observable* build/asset value must be supplied by named owner. Do not present untested runtime states as PASS.

**Policy:** Make available SVG art prominent on mobile now; integrate the delivered WebP pairs after repo copy, SHA/HTTP checks, and license/artifact clearance. No new cross-team stop-work gate. Artist/Designer owns composition, palette, crop and final visual beauty; UX owns safe insertion and interactions; Architect owns final precedence; Codex implements and tests. Owner reviews full application before main, with Today early internal calibration. Mockups are design references, never deployed-after evidence.

### 0.1 Non-negotiable cross-screen contracts
- No decorative asset may communicate user nutritional intake, microbiome results, species identity, lab status, dates, health improvements, performance readiness or clinical classification.
- Unknown ≠ zero, log absence ≠ zero intake, missing data ≠ observed negative, planned ≠ completed, unsaved ≠ confirmed saved, research ≠ personal effect; preserve source-specific uncertainty.
- One genuine page h1, one contextual primary action, and meaningful source-checked content. Art never changes DOM reading/focus order, disabled states, mutations or CTA labels.
- Rendered images must preserve >=44px interactive targets and visible focus; no pointer-events for decoration; decorative `<img alt="" aria-hidden="true">` unless a truly informational image requires exact UX-approved alt.
- At 320/390/768/1440 CSS px, 200% zoom, landscape/mobile nav, all themes, forced-colors, high contrast, reduced transparency and `prefers-reduced-motion`, no overlap with CTA, labels, units, errors, disclosures, controls or provenance.
- The R4 asset archive is authoritative for finished SVG artwork; the D3-R archive contains **13 PNG originals and 26 WebP variants (delivered, GitHub import pending)**. Never show fake broken-image placeholders while waiting.
- One active canonical scoped designer stylesheet; avoid second global skin or duplicate motion definitions. CSS under `.app-shell[data-bloom-visual="premium"]` only.
- Present conceptual microbiology renders with visible text **Illustrative, not your data**; do not imply that a generic organism illustration depicts the sample or identifies a species.
- Developer must not guess path, selectors, variants or copy. Use verified source mapping and record any deviation with reason/owner; continue unrelated tasks while resolving.
- No mandatory Today owner go/no-go that stops remaining implementation. Internal Today screenshot calibration, then full-product owner review before main.

### 0.2 Version precedence and scope
| Domain | Authoritative source | Rule |
|---|---|---|
| Product, science, source logic | Current R4 UX base and implementation | Do not rewrite algorithms or truncate details |
| Voice and copy | R4 proposed 204-key `bloomCopy.ts` plus runtime text | Designer/Branding review; never replace runtime-derived fact with static string |
| Paint, fonts, palette | Canonical Designer v2.4/R3 `bloom-visual-scoped.css` | All new mobile rules appended to same scoped file |
| Finished SVGs | `Bloom_Production_Assets_Final_Batches_1_to_6_2026-11-07.zip` | 87 SVGs, check SHA before import; use actual source path |
| Raster/photo art | D3-R approved direction and this spec | No known delivered raster files; track as future import, not available today |
| Motion | Canonical CSS hero/save/chart and shimmer | One trigger per motion, reduced motion disables |
| Actual acceptance | Authenticated browser screenshots | Not verified in this handoff |

## 1. Verified implementation inventory & root-cause matrix
| Component/file | Verified observation | Consequence / action |
|---|---|---|
| `client/src/components/CompanionHero.tsx` | `<section className="today-focus …">` with 54×54 generic icon, no data-art slot | Add explicitly permitted optional `media` property or `EditorialMedia` child without moving actions |
| `client/src/components/TodayFocus.tsx` | Consumes `CompanionHero`, preserves context action | Insert media without changing `todayContextAction` selection |
| `client/src/components/FoodEntryChooser.tsx` | Uses `CompanionHero` for entry selection | Optional decorative food art; hide in review/active form |
| `client/src/styles/bloom-visual-scoped.css` | Art rules require `bv-editorial-hero`/`data-bv-art` and `data-bv-art-safe=true` | Cannot assume old hero gets any art; add safe attributes only to approved targets |
| `client/src/styles/bloom-visual-scoped.css` line 198 | Mobile optional pseudo art width 110px and opacity .07 | Replace generic low-opacity rule with per-slot visibility and width, not global !important |
| `client/src/workspace.css` mobile rules | At ≤600px `.today-focus` padding 20px, header-log hidden ≤480px; `today-focus > .panel-note` hidden | Check CTA and explanatory text visibility, avoid hiding substantive copy |
| `client/src/pages/NutritionHistory.tsx` | `main.science-page.journal-page` | Insert visual header without obstructing journal and logged entries |
| `client/src/pages/Microbiome.tsx` | `main.gut-reports-workspace`, organism table/profile open action | Keep searchable clickable organism names and source values visible |
| `client/src/pages/PrecisionNutrition.tsx` | Labs, Biology home, source management | Keep click-analyte navigation and data disclosure intact |
| `client/src/pages/Explore.tsx` | `main.science-page.biology-explorer` with research links | Never overprint evidence or research caveats with imagery |
| `client/src/pages/Progress.tsx` | Tabs and source-aware charting | Art only in intro/true empty; none on graph |
| `client/src/pages/AthleteWorkspace.tsx` | Single large component, separate Athlete routes | Keep status, consent and session controls visible |
| `client/src/pages/Profile.tsx` | Source/privacy and editable preferences | Image never lives with destructive or consent controls |
| `client/src/components/PremiumIcon.tsx` | Uses `/brand/visual-v2/<batch>/<icon>.svg` mask for route icons | Existing icon wired; do not treat as evidence hero imagery is done |
| `client/public/images/editorial/{cutouts,heroes}/...` | Canonical *package* paths exist in delivered archive; not verified on branch | Import original PNGs and WebP pairs, assert SHA/HTTP 200; retain SVG-first UI before import |

### 1.1 File locations to inspect before modifying
`client/src/components/BottomNav.tsx` (Everyday three entries; Athlete five); `client/src/components/AppNavigation.tsx` (desktop); `client/src/components/BiologyHome.tsx`; `client/src/components/TodayFoodSummary.tsx`; `client/src/components/FoodProgress.tsx`; `client/src/components/OrganismPortrait.tsx`; `client/src/content/bloomCopy.ts` (verified import in live Biology/Profile source; exact source freshness confirm); existing route manifest and CSS import graph **TO COMPLETE — Developer**. All new art paths must pass actual HTTP 200 tests on deployed preview, not just file-existence checks.

## 2. Mobile visual hierarchy and responsive geometry (UX decision; Designer fills final paint)
| Parameter | 320px | 390px | 768px | 1440px | Owner / verification |
|---|---|---|---|---|---|
| Outer inline gutter | 16px | 18px | 24px | 28–40px; actual workspace max-width unchanged | UX defaults; Designer may tune without changing safe widths |
| Editorial art max block size | 72–116px | 96–160px | 160–240px | Designer route-specific | Designer final composition |
| Image-first banner crop | approx 3:2 to 2:1 | approx 2:1 to 3:1 | 3:1 to 12:5 | 12:5 | Designer art crop; do not distort |
| Minimum heading/action clear space | never overlap | never overlap | never overlap | never overlap | UX hard requirement |
| Photo+text positioning | separate blocks | separate blocks or reserved art pocket | possible split with ≥50% text | split editorial layout | Designer final; safe fallback mandatory |
| CTA target | ≥44px high, full width if necessary | ≥44px high, often full width | ≥44px high | ≥44px high | UX |
| Visual-only microbe disclaimer | always visible with raster render | same | same | same | UX |
| Optional Progress/Profile ornament | hide if dense | ≤88px only if clear | ≤112px | Designer discretion | Designer + UX |

**Breakpoints must follow real layout constraints, not devices:** 320 and 390 are acceptance viewports; 600/639/768 existing CSS boundaries are relevant, but 200% browser zoom of a 1440 viewport gives roughly a 720 CSS px reflow scenario. Do not rely on user-agent sniffing. Ensure notched safe areas and bottom nav do not overlap sticky controls; no horizontal page scroll except explicitly scrollable scientific tables.

## 3. Shared layout primitives & developer implementation
### 3.1 `EditorialMedia` component (recommended one-time reusable non-data primitive)
**New file:** `client/src/components/EditorialMedia.tsx` (new; verify against current branch before creating). Required props: `slot`, `svgSrc`, optional `raster` source set when files are imported and HTTP-verified, `mode` = `banner|cutout|conceptual|state`, `priority`, `className`, `labelledConceptual`. It MUST NOT accept personal score, reported abundance, data reading, health status or suggestion confidence. Its only job is rendering passive assets.

```tsx
import { useState } from "react";

type Raster = { src: string; src2x: string; width: number; height: number };
type Props = {
  slot: string; svgSrc: string; mode: "banner" | "cutout" | "conceptual" | "state";
  raster?: Raster; priority?: boolean; className?: string; labelledConceptual?: boolean;
};
export function EditorialMedia({ slot, svgSrc, mode, raster, priority = false,
  className = "", labelledConceptual = false }: Props) {
  const [failed, setFailed] = useState(false);
  // Remount with a key including the variant identity on a route/source change.
  // Avoid trusting any raster URL until the file is imported and HTTP-verified.
  const active = raster && !failed;
  const conceptual = mode === "conceptual" && labelledConceptual;
  return <figure className={`bv-media bv-media--${mode} ${className}`} data-bv-slot={slot}>
    {active ? (
      <img src={raster.src} srcSet={`${raster.src} 1x, ${raster.src2x} 2x`}
        alt="" aria-hidden="true" width={raster.width} height={raster.height}
        decoding="async" loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setFailed(true)} />
    ) : (
      <img src={svgSrc} alt="" aria-hidden="true" width={480} height={480}
        loading={priority ? "eager" : "lazy"} decoding="async" />
    )}
    {conceptual && <figcaption className="bv-media-concept-label">Illustrative, not your data</figcaption>}
  </figure>;
}
```

**Integration note:** the sample `<source>` will fall back to SVG when WebP is unsupported, but a network-404 WebP may not automatically trigger SVG fallback because `<picture>` picks a supported source. Supply `raster` only after both files are built/deployed and integration checks pass; for a loaded-source failure, implement an explicit image `onError` fallback state or remove the source on error. Width and height above are placeholders in this typed example until final per-image intrinsic dimensions are recorded; do not copy 600×400 into all image slots. For production, use `aspect-ratio` plus matched widths to prevent layout shift. `fetchPriority` may depend on project React/TypeScript support; use JSX attr supported by installed types, not unchecked `any`. Figure captions only for conceptual renders; do not produce redundant generic media captions.

### 3.2 `CompanionHero` opt-in media amendment
Add optional `media?: ReactNode` prop to existing `CompanionHero`; **do not** replace the existing icon or action implementation unless Designer selects. Render art in an explicitly reserved noninteractive region **before** the action node in DOM only if this does not move focus or semantic sequence; preferred order for today hero: eyebrow/title/reason/action in logical DOM order, then decoration in a CSS-named decorative sibling. Because art has no accessible content, DOM position is semantically inert, but its CSS painted position may not eclipse controls. Use class `bv-media-slot` rather than fake existing `bv-editorial-hero` opt-in attributes on an unverified container. Preserve `aria-labelledby` and actual `today-action-title`, keyboard order and dynamic buttons.

### 3.3 Exact CSS appendix for Designer to merge into ONE canonical file
Do not introduce an independent global `bloom-raster-media.css`. Sample base rules below establish structural-safe geometry; Designer has supplied specific values in Appendix M1-D (this file); Developer merges those scoped rules, and must test actual image pixels and slot geometry in browser. Do not blanket hide imagery at mobile width.

```css
/* Append to client/src/styles/bloom-visual-scoped.css AFTER existing art rules. */
.app-shell[data-bloom-visual="premium"] .bv-media {
  position:relative; min-width:0; margin:0; isolation:isolate;
}
.app-shell[data-bloom-visual="premium"] .bv-media {
  display:block; width:100%; height:100%; overflow:hidden; border-radius:inherit;
}
.app-shell[data-bloom-visual="premium"] .bv-media img {
  display:block; width:100%; height:100%; object-fit:contain;
}
.app-shell[data-bloom-visual="premium"] .bv-media--banner .bv-media img {object-fit:cover;}
.app-shell[data-bloom-visual="premium"] .bv-media--conceptual .bv-media-concept-label {
  position:absolute; inset-inline:8px; bottom:8px; z-index:2;
  display:block; width:max-content; max-width:calc(100% - 16px);
  padding:4px 8px; background:var(--bv-porcelain); color:var(--bv-forest);
  font:600 12px/1.4 var(--bv-sans); border-radius:8px;
}
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="today-hero"] {
  block-size:clamp(104px, 28vw, 176px); overflow:hidden;
}
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="food-banner"],
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="athlete-banner"] {
  block-size:clamp(124px, 33vw, 220px); overflow:hidden;
}
@media (max-width:639px) {
 .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="today-hero"] {block-size:120px;}
 .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="food-banner"] {block-size:144px;}
 .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="athlete-banner"] {block-size:144px;}
 .app-shell[data-bloom-visual="premium"] .bv-editorial-hero[data-bv-art][data-bv-art-safe="true"]:has(.bv-media)::after {
   content:none;
 }
}
@media (max-width:359px) {
 .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="today-hero"] {block-size:96px;}
 .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="food-banner"] {block-size:112px;}
}
@media (forced-colors: active) {
 .app-shell[data-bloom-visual="premium"] .bv-media {display:none;}
 .app-shell[data-bloom-visual="premium"] .bv-media--conceptual .bv-media-concept-label {
   position:static; background:Canvas; color:CanvasText; border:1px solid CanvasText;
 }
}
```
**Important:** The old `.45` pseudo-art opacity is obsolete for slots using a real `EditorialMedia` child; **remove/suppress the pseudo-element** for such slots, rather than layering it over real media. Never apply photo opacity to data, forms or text. At most one artwork asset per slot; do not layer duplicate SVG pseudo background and WebP image. Do not add absolute positioning to text/control containers. In forced colors keep the conceptual disclaimer visible even if the image is hidden. No image entrances outside existing approved `bv-hero-enter` motion.

### 3.4 Image system integration rules
- SVG source files from the final archive copy to `client/public/brand/visual-v2/<batch>/<filename>` preserving directory structure; verify full 87-source SHA against target. Do not assume old root-level `botanical-orbit.svg` exists; it did not exist at the previously checked target path.
- Raster canonical path: `client/public/images/editorial/cutouts/bloom-*.webp` or `client/public/images/editorial/heroes/bloom-*.webp` and matching `@2x.webp` pairs (cutouts 600/1200 square; heroes 1200×500 / 2400×1000); paths/dimensions/bytes/hash are in the delivered manifest and Appendix M1-D. Never use the proposed `brand/visual-v3-media` path. Record tool/prompt/license as unknown pending provenance evidence; do not invent.
- Prevent 2× image fetch as a costly universal default: use `srcSet` + `sizes` for responsive banners (e.g. `(max-width:639px) 100vw, (max-width:991px) 80vw, 1200px`) after widths are validated; use 1x/2x DPR only when actual CSS display width warrants it.
- The R2 200KB per delivered file is a **target**; prefer visual quality under realistic mobile cellular budgets. Report actual size and justify exceptions instead of silently downsampling biologically relevant source text (which must never be embedded in artwork).
- Above-fold LCP image: only actual primary hero may use `loading=eager`/`fetchPriority=high`; other imagery lazy. Do not eagerly load all 7 route images.
- If image fails, preserve layout and correct text; use existing SVG alternative or collapse visual-only region, never break CTA. Rendered state icon art may be omitted without losing status meaning.
- No automatic generated microbiology images as taxon portraits, no representation of user food consumption as AI food photography, and no reconstructed patient data.
- Glass/photo overlay only in approved decorative intro region; text sits on fully predictable solid surface unless Designer measures worst-case contrast behind overlay in light/dark/Athlete. Reduce transparency and forced-colors fallback required.
- Do not put private nutrition, biological or session values into image request URLs or externally hosted assets; all approved art served locally.

## 4. Seven route-by-route full build contracts

# 1. Today — mobile production contract
## 1. Header
- **Routes:** `/`
- **Verified repo anchors:** `client/src/pages/Dashboard.tsx`, `client/src/components/TodayFocus.tsx`, `client/src/components/CompanionHero.tsx`, `client/src/components/TodayFoodSummary.tsx`, `client/src/components/TodayStatus.tsx`
- **Verified selectors/regions:** `.bloom-dashboard`, `.dashboard-heading`, `.today-focus`, `.today-focus-heading`, `.today-focus-actions`, `.flagship-nourishment`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-1-original/hero-today.svg`; support: `batch-5-system-onboarding/ornament-botanical-branch.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Primary `bloom-today-meadow` banner; optional `bloom-echinacea-flower` or `bloom-blueberry-sprig` cutout only if the banner is not competing with CTA; never stack two hero compositions. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Eyebrow/date → h1 → truthful takeaway → contextual TodayFocus hero (action first) → recorded food summary → other daily status → inspiration/secondary navigation.
- **390/320 layout:** Use a side-by-side **reserved art pocket** when 390px text and controls fit; otherwise split into an 88–128px-high image band ABOVE the hero text. The contextual action must remain wholly visible, full-width when needed. Never let an absolute image overlap the CTA.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| T1 | Today context hero | `CompanionHero` root `.today-focus` (verified; lacks `bv-editorial-hero` / `data-bv-art` opt-in) | above/adjacent text; 96–140px visible at 390 | no image on confirmed source error if it competes; decorative |
| T2 | Empty journal art | `TodayFoodSummary` `.flagship-nourishment` (verified) | 80–120px inside empty-only block | only after successful no-record check |
| T3 | Daily section supporting art | `Dashboard.tsx` secondary/inspiration (DOM placement verify) | optional 56–88px beside editorial non-data copy | omit when dense |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| T1 | Today context hero | `CompanionHero` root `.today-focus` (verified; lacks `bv-editorial-hero` / `data-bv-art` opt-in) | decorative botanical SVG now, optional blueberry cutout later | above/adjacent text; 96–140px visible at 390 | no image on confirmed source error if it competes; decorative | UX-owned one image child or background after verifying root |
| T2 | Empty journal art | `TodayFoodSummary` `.flagship-nourishment` (verified) | `batch-1-original/empty-journal.svg` | 80–120px inside empty-only block | only after successful no-record check | append to current empty-specific branch |
| T3 | Daily section supporting art | `Dashboard.tsx` secondary/inspiration (DOM placement verify) | `batch-4-food-science/spot-berries.svg` | optional 56–88px beside editorial non-data copy | omit when dense | optional safe slot |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** Today first-use, recorded, partial, chosen/paused action, meal source failed, Athlete mode.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** Existing `todayContextAction` selection, pause/choose semantics and Journal retry remain canonical. Do not hard-code example CTA or invent intake.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

# 2. Food and Journal — mobile production contract
## 1. Header
- **Routes:** `/nutrition`, `/log-meal`, `/saved-meals`, `/meal-planner` (secondary routes; preserve native source names)
- **Verified repo anchors:** `client/src/pages/NutritionHistory.tsx`, `client/src/pages/LogMeal.tsx`, `client/src/components/FoodEntryChooser.tsx`; saved-meals and planner page path TO VERIFY — Developer
- **Verified selectors/regions:** `.journal-page`, `.meal-page`, `.meal-page-heading`, `.food-entry-chooser`, `.food-entry-hero`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-2-heroes/hero-food.svg`; support: `batch-4-food-science/spot-fibre-foods.svg`, `batch-3-states/empty-food-plan.svg`, `batch-6-final-states/state-partial-nutrition.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Primary `bloom-food-oatmeal-linen` banner; alternate `bloom-oatmeal-bowl-primary` cutout when an editorial bowl is appropriate; no logged-meal implication. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Page heading and context → food logging primary action or journal controls → meaningful editorial hero/image → list/summary → review/source → history, trends and planner links.
- **390/320 layout:** At 390px use full-width short food visual band with 3:1–2:1 crop, then a separate readable title/action block. On input/review screens either reduce image to 64–96px accent or suppress while editing; never shift focused fields.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| F1 | Food journal top | `NutritionHistory.tsx` `.journal-page` `.science-heading` | mobile 110–160px-wide contextual art region or 140px image band | decorative editorial only |
| F2 | Log entry selection | `FoodEntryChooser.tsx` `.food-entry-hero` / `CompanionHero` | 72–100px; avoid action row | hide while method chosen and form visible |
| F3 | Partial nutrition | `LogMeal.tsx` current partial/source warning branch | 48–72px next to status heading | does not replace exact source/unknown wording |
| F4 | Empty planner | planner route component TO VERIFY | 96–128px | only confirmed no plan |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| F1 | Food journal top | `NutritionHistory.tsx` `.journal-page` `.science-heading` | `batch-2-heroes/hero-food.svg` fallback; `bloom-food-oatmeal-linen.webp` when imported | mobile 110–160px-wide contextual art region or 140px image band | decorative editorial only | insert approved media after heading, before data controls |
| F2 | Log entry selection | `FoodEntryChooser.tsx` `.food-entry-hero` / `CompanionHero` | `batch-4-food-science/spot-berries.svg` | 72–100px; avoid action row | hide while method chosen and form visible | independent safe slot |
| F3 | Partial nutrition | `LogMeal.tsx` current partial/source warning branch | `batch-6-final-states/state-partial-nutrition.svg` | 48–72px next to status heading | does not replace exact source/unknown wording | state-specific presentational art |
| F4 | Empty planner | planner route component TO VERIFY | `batch-3-states/empty-food-plan.svg` | 96–128px | only confirmed no plan | do not imply planner failure is empty |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** first-use, meal recorded, review/edit unsaved, partial nutrition, source error, saving, confirmed saved, uncertain save, dense food history.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** Food image must never masquerade as user-logged food, portion, product or inferred nutrient. Preserve candidate food parsing, unknown totals, original descriptions, save/review transactions.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

# 3. Biology and Gut Reports — mobile production contract
## 1. Header
- **Routes:** `/precision` (tabs), `/microbiome`, `/biology/reports` alias where supported
- **Verified repo anchors:** `client/src/pages/PrecisionNutrition.tsx`, `client/src/components/BiologyHome.tsx`, `client/src/pages/Microbiome.tsx`, `client/src/components/MicrobialProfile.tsx`, `client/src/components/BloodworkSourceOverview.tsx`
- **Verified selectors/regions:** `.precision-page`, `.science-heading`, `.biology-context`, `.biology-summary-tile`, `.gut-reports-workspace`, `.microbial-composition-table`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-2-heroes/hero-biology.svg`; support: `batch-4-food-science/concept-microbe-community.svg`, `batch-3-states/empty-labs.svg`, `batch-1-original/empty-biology-report.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Primary `bloom-biology-abstract-cells` conceptual render (alternate `bloom-biology-rods`), with visible "Illustrative, not your data" adjacent at all widths. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Intro → source and latest observation summary → visible entry points to lab report groups and organism explorer → content/data → methods and provenance; do not bury click-by-name profiles.
- **390/320 layout:** Artwork is a reserved 100–140px composition in intro, never the background for lab/organism measurements. For conceptual microbe render show visible disclaimer within same region on every breakpoint, including crop and zoom.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| B1 | Biology landing intro | `BiologyHome.tsx` or `PrecisionNutrition.tsx` heading (exact wrapper placement verify) | 96–132px beside intro or above | separate from real data |
| B2 | Gut report conceptual header | `Microbiome.tsx` `.science-heading` | 100–144px | visible "Illustrative, not your data" for conceptual render |
| B3 | No laboratory records | `PrecisionNutrition.tsx` lab tab empty branch | 80–120px | only after successful record check |
| B4 | Organism explorer thumbnail | `Microbiome.tsx` composition rows / `OrganismPortrait.tsx` | 36px or 44px | maintain name as primary open-profile button |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| B1 | Biology landing intro | `BiologyHome.tsx` or `PrecisionNutrition.tsx` heading (exact wrapper placement verify) | `batch-2-heroes/hero-biology.svg` | 96–132px beside intro or above | separate from real data | safe non-data intro |
| B2 | Gut report conceptual header | `Microbiome.tsx` `.science-heading` | `batch-4-food-science/concept-microbe-community.svg` fallback; `bloom-biology-abstract-cells.webp` when imported | 100–144px | visible "Illustrative, not your data" for conceptual render | not in table or measurement result |
| B3 | No laboratory records | `PrecisionNutrition.tsx` lab tab empty branch | `batch-3-states/empty-labs.svg` | 80–120px | only after successful record check | not on fetch failure |
| B4 | Organism explorer thumbnail | `Microbiome.tsx` composition rows / `OrganismPortrait.tsx` | existing source-aware thumbnail or neutral symbol | 36px or 44px | maintain name as primary open-profile button | do not replace actual source name with generated species artwork |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** no reports, lab-only, gut-only, both available, partial/import review, stale/revoked source, failed source, selected analyte/organism dialog.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** No made-up gut scores, abundance, toxin claims, biological age, microbiome health conclusions. Preserve report date, assay, relative abundance and research/population limits.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

# 4. Explore — mobile production contract
## 1. Header
- **Routes:** `/explore`
- **Verified repo anchors:** `client/src/pages/Explore.tsx`
- **Verified selectors/regions:** `.science-page.biology-explorer`, `.science-heading`, `.explore-layout`, `.relationship-card`, `.relationship-map`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-2-heroes/hero-explore.svg`; support: `batch-4-food-science/concept-pathway.svg`, `batch-3-states/empty-explore.svg`, `batch-6-final-states/state-no-search-results.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Primary `bloom-explore-blueberry-macro` 12:5 banner, crop centered toward right subject; move heading outside image if needed. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Question/topic-led page heading → search/topic selection → featured editorial scene → research relationships → cited evidence and limits; no personalized data masquerading as research.
- **390/320 layout:** Featured image can occupy full-width 120–160px band. Place headline BELOW image if no opaque reserved contrast layer. Keep search and filters in normal flow and visible without art competition.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| E1 | Explore introductory hero | `Explore.tsx` `.science-heading` (verify actual candidate) | 100–140px editorial media band | no search control overlay |
| E2 | Featured research topic | `Explore.tsx` `.relationship-card` selected topic | 88–120px region | headline below media unless contrast measured |
| E3 | No matching topic | Explore search empty result branch | 72–104px | only true search-empty |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| E1 | Explore introductory hero | `Explore.tsx` `.science-heading` (verify actual candidate) | `batch-2-heroes/hero-explore.svg` | 100–140px editorial media band | no search control overlay | add noninteractive slot |
| E2 | Featured research topic | `Explore.tsx` `.relationship-card` selected topic | `batch-4-food-science/concept-pathway.svg` or berry banner | 88–120px region | headline below media unless contrast measured | no pathway-as-user-activity implication |
| E3 | No matching topic | Explore search empty result branch | `batch-6-final-states/state-no-search-results.svg` | 72–104px | only true search-empty | not on source error |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** general research no selection, concept selected, results, zero search results, partial references, research source unavailable.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** Preserve evidence/context distinction, source references and confidence limits; diagrams are never a measured biological pathway.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

# 5. Progress — mobile production contract
## 1. Header
- **Routes:** `/progress`
- **Verified repo anchors:** `client/src/pages/Progress.tsx`, `client/src/components/FoodProgress.tsx`
- **Verified selectors/regions:** `.progress-workspace`, `.science-heading`, `.progress-domain-tabs`, `.food-progress-controls`, `.food-progress-scale`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-2-heroes/hero-progress.svg`; support: `batch-1-original/empty-progress.svg`, `batch-6-final-states/state-sparse-progress.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Optional `bloom-three-leaf-sprig` cutout on desktop only; mobile retains approved SVG accent if safe. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Heading and selected period → date-correct plots/tables/metric labels → interpretation constraints → detail/source tables; optional art only in intro and truly empty state.
- **390/320 layout:** Avoid art inside chart or scrollable data table. Use small 64–92px illustration above charts in header or none for highly dense states. Optional leaf cutout is hidden at mobile.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| P1 | Progress intro | `Progress.tsx` `.science-heading` | 64–96px non-data accent on mobile | suppress where controls wrap |
| P2 | No observations | existing no-record condition in selected tab | 80–120px | real empty only |
| P3 | Sparse history | selected real single-date state | 64–96px | numeric observation still shown |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| P1 | Progress intro | `Progress.tsx` `.science-heading` | `batch-2-heroes/hero-progress.svg` | 64–96px non-data accent on mobile | suppress where controls wrap | header only |
| P2 | No observations | existing no-record condition in selected tab | `batch-1-original/empty-progress.svg` | 80–120px | real empty only | no fabricated plot |
| P3 | Sparse history | selected real single-date state | `batch-6-final-states/state-sparse-progress.svg` | 64–96px | numeric observation still shown | complement factual note |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** no dates, one date, multiple irregular dates, partial nutrition, incompatible observations, loading/error, Athlete context.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** Never connect unknown gaps, interpolate missing dates, treat missing as zero or invent a trend; preserve accessible numerical equivalents and source provenance.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

# 6. Athlete — mobile production contract
## 1. Header
- **Routes:** `/athlete`, `/athlete/fueling`, `/athlete/recovery`, `/athlete/competition`
- **Verified repo anchors:** `client/src/pages/AthleteWorkspace.tsx`, `client/src/components/BottomNav.tsx`
- **Verified selectors/regions:** `.athlete-session-status`, athlete workspaces/section route from `location.split("/")[2]`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-2-heroes/hero-athlete.svg`; support: `batch-1-original/athlete-motif.svg`, `batch-3-states/empty-athlete.svg`, `batch-6-final-states/state-no-training-history.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Primary `bloom-athlete-mountains` 12:5 banner with Athlete navy surface; no people, no status overlay. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Performance context + status → actionable training/fueling controls → recorded sessions/measurements → history/source; stable labels planned/completed/cancelled.
- **390/320 layout:** Use short 112–156px navy landscape banner ABOVE controls; reserve separate opaque navy text block. At 320px photo can collapse to 72px accent or hide if content cannot fit. Avoid overlaying completion/sets/units.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| A1 | Athlete overview introduction | `AthleteWorkspace.tsx` overview section (candidate verify) | 112–156px image band | never cover status/actions |
| A2 | No training history | existing successful empty history branch | 80–120px | only if no sessions |
| A3 | Fueling or recovery states | relevant existing subroute | 64–96px | hide when forms dense |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| A1 | Athlete overview introduction | `AthleteWorkspace.tsx` overview section (candidate verify) | `batch-2-heroes/hero-athlete.svg` fallback, `bloom-athlete-mountains.webp` after import | 112–156px image band | never cover status/actions | no interaction wiring change |
| A2 | No training history | existing successful empty history branch | `batch-6-final-states/state-no-training-history.svg` | 80–120px | only if no sessions | retain first training CTA |
| A3 | Fueling or recovery states | relevant existing subroute | `batch-1-original/athlete-motif.svg` | 64–96px | hide when forms dense | decorative only |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** no sessions, planned, completed, cancelled, unsaved, saved, source failure, partial activity, 5-tab mobile nav at 320.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** A decorative check is never a completed session indicator; only persisted logged completion earns success status. No readiness score.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

# 7. Profile — mobile production contract
## 1. Header
- **Routes:** `/profile`
- **Verified repo anchors:** `client/src/pages/Profile.tsx`
- **Verified selectors/regions:** `.profile-workspace`, `.science-heading`, `.profile-settings-list`, `.profile-section`, `.profile-editor`
- **Frozen SHA / preview:** TO COMPLETE — Architect/Developer; moving branch observed 2026-11-07
- **Reference source:** R4 Designer references DESIGN REFERENCE ONLY; exact mock image name TO VERIFY — Designer
- **Owner:** UX structure, Designer appearance/crop, Developer integration, Architect version, Branding tone
- **Approval state:** UX contract ready; runtime screenshots NOT TESTED; Designer pixel pass NOT TESTED
## 2. Token and asset assignments
- **Available art source:** `batch-2-heroes/hero-profile.svg`; support: `batch-5-system-onboarding/ornament-botanical-branch.svg`, `batch-3-states/empty-connections.svg`, `batch-6-final-states/state-consent-revoked.svg`. All are known paths inside verified asset ZIP; target import/path: TO VERIFY — Developer.
- **Raster/photo future enhancement:** Optional `bloom-three-leaf-sprig` cutout decorative and hidden on mobile. Raster supplied separately from SVG archive: 13 original PNGs / 26 WebPs in Shared Library; file/hash/alpha checks COMPLETE. GitHub import, commercial-use verification, full-resolution human QA, and browser/crop checks PENDING.
- **Material and type:** use existing `--bv-canvas`, `--bv-paper`, `--bv-porcelain`, `--bv-forest`, `--bv-secondary`, `--bv-brand`, with v2.4 serif h1–h3 and mono numerics. Exact Designer tokens, dimensions, fit, contrast fallback and mode treatment defined in Appendix M1-D; validate in the actual app.
## 3. Mobile structure and geometry
- **Content order:** Heading → account/consent context → settings groups, profile editing, measurements/preferences, connected sources/privacy → save/error/conflict confirmation.
- **390/320 layout:** Only small 56–88px botanical art in introductory whitespace; suppress behind settings controls. Do not add photo banner to privacy-sensitive forms.
- **Tablet 768:** retain readable side-by-side only if 200% zoom and long text still fit; otherwise stack. Desktop 1440: no changes to R4 source-driven ordering. Breakpoints are layout-derived, not device UA guesses.
## 4. Top-to-bottom element map (each item has purpose, data source and responsive instruction)
| # | Element | Source/interaction | 390/320 rule | Data/semantics |
|---|---|---|---|---|
| 01 | Page eyebrow and h1 | existing semantic heading | Natural wrap; never crop | Branding `route.h1`, runtime date when applicable |
| 02 | Takeaway/explanatory line | existing page context | Max readable line length; not hidden solely due to width | No unverified personalized claims |
| 03 | Primary contextual action or safe no-action state | existing action hooks/links | Visible ≥44px, full width when needed | No UI-driven mutation redesign |
| 04 | Premium image/media slot | new passive media slot | Visible when safe; dedicated block or reserved pocket | Decorative; no personal evidence |
| 05 | First observed-data or control surface | existing source-aware component | Below art; controls not overlapped | Runtime values only, unknown not 0 |
| 06 | Secondary list/insights/history | existing components | Flatten decorative wrapper where approved; preserve semantics | Search, dates, units and provenance remain |
| 07 | Error/review/empty/saved disclosure | existing per-source branches | State-specific imagery optional; status text never hidden | Error≠empty; saving≠saved |
| 08 | Supporting navigation and source methods | existing links and disclosures | Mobile reachable, no clipped nav | No new routes/scores |
| R1 | Profile intro | `Profile.tsx` `.science-heading` | 56–88px accent, if available gap | hide when heading wraps too deeply |
| R2 | No connections | existing account source status empty state | 76–100px | only after successful state check |
| R3 | Revoked consent | existing revoked status | 64–96px | accurate source status remains text |
## 5. Art-slot contract and manifest requirements
| Slot | Existing anchor (VERIFY live DOM) | Selected source | Mobile placement | Condition / limitation | Wiring owner |
|---|---|---|---|---|---|
| R1 | Profile intro | `Profile.tsx` `.science-heading` | `batch-2-heroes/hero-profile.svg` | 56–88px accent, if available gap | hide when heading wraps too deeply | not inside controls |
| R2 | No connections | existing account source status empty state | `batch-3-states/empty-connections.svg` | 76–100px | only after successful state check | never imply revoked is still connected |
| R3 | Revoked consent | existing revoked status | `batch-6-final-states/state-consent-revoked.svg` | 64–96px | accurate source status remains text | decorative only |
Every active asset requires filename, exact source SHA, target path, intrinsic width/height, 320/390/768/1440 crop position, source/dark/Athlete variant or fallback, 200%-zoom rule, foreground/text contrast result, status `IMPORTED` and real HTTP request. Missing raster means **SVG immediately**, not empty art or a broken URL.
## 6. State and fixture matrix
**Minimum fixtures:** default, dirty, saving, saved, failed, version conflict, revoked consent, 200% zoom, keyboard+screen reader.
| State | Artwork behavior | Truthful content | QA evidence |
|---|---|---|---|
| Loading | Hide large nonessential art if loading skeleton dominates | Source checked/loading not absence | Screenshot + source query state |
| Empty (confirmed) | Correct empty-state illustration, not generic failure | No saved entries / no source record, not zero result | Controlled fixture + DOM assertion |
| Recorded | Editorial image only in non-data intro region | Actual source units, dates and values | Screenshot + mocked source payload |
| Partial/unknown | Preserve coverage/state icon when present | Known contributions and unknown fields distinguished | Data-source test |
| Source failure | State art optional; never hide Retry | Named failed source + working Retry | Error injection + keyboard |
| Unsaved/review | Exclude celebratory art | Review draft before saving | Mutation state assertion |
| Saving/uncertain | No success illustration until confirmed | Pending vs ambiguous network receipt distinct | Idempotency/retry test |
| Saved | Optional saved art ONLY with actual server receipt | Saved to source with receipt | Response receipt assertion |
| Long text/200% zoom | Art shrinks or moves; no CTA overlap | Full content remains in normal document | Visual 320/390/768 + zoom |
| Dark/Athlete/forced-colors | Correct variant, hide optional art if needed | Labels/controls remain | Theme/OS screenshots |
## 7. Copy and dynamic text
- Existing R4 `bloomCopy` keys supply headings, neutral empty/error/review/confirmed copy; runtime CTA, source name, report identity, values, units, person greeting and save receipt remain sourced from live data. No text embedded in decorative SVG/WebP. Any new conceptual-image label has exact copy “Illustrative, not your data”.
## 8. Motion, modes and load policy
- Hero uses only existing v2.4 hero entrance, once at mount, not on every query refetch. Saved state motion requires confirmed receipt. Images do not animate independently; `prefers-reduced-motion` strips motion. Existing image not above fold uses lazy loading.
## 9. Accessibility and source integrity
- **Behavior preservation:** Never obscure the dirty-change warning, revoke/delete buttons, data source lists or current authorization state.
- Exact mobile checks: no overlays on actions/units/source/error; decorative img empty alt and aria-hidden; meaningful disclaimer remains text and visible; label/focus/tab order unchanged; explicit source retry; no animation required to interpret state; color contrast with fallback and image visible, 4.5:1 normal text and 3:1 large text; 200% zoom.
## 10. Mock parity / capture plan
- Capture both 390 and 1440 source fixture variants plus 320 and 768 worst cases. Save path, branch SHA, viewport, DPR, mode, source fixture, image load status, media filename/hash, browser and timestamp. Compare reference to **actual app** not an SVG preview. Designer returns numbered layout delta by element ID, Developer closes and recaptures. Preserve R4 data accuracy tests.
## 11. Completion checklist
- [ ] Verified current DOM selectors in app, not just stylesheet
- [ ] Asset source and deployed target SHA match
- [ ] Visible intentional mobile image; no blanket 7% disappearing art
- [ ] Primary CTA/focus/status/provenance unobstructed
- [ ] 320/390/768/1440, 200% zoom tested
- [ ] Actual image failure fallback tested
- [ ] Dark, Everyday, Athlete, forced-colors, reduced transparency and motion tested
- [ ] No fabricated values or decorative art interpreted as biological data
- [ ] Designer visual status recorded, UX structural status recorded
- [ ] Real screenshot and linked test artifact recorded

## 5. Cross-screen responsive image decision table (no developer guessing)
| Asset family | Source of truth | Mobile default | Dark/Athlete | Performance | Status |
|---|---|---|---|---|---|
| Hero SVG | Final Batches 1–6 archive | Visible at 96–160px as safe slot, not pseudo only | Use palette appropriate to mode; Designer confirms | Same local SVG, lazy except above fold | READY TO IMPORT |
| Empty/state SVG | Final Batches 1–6 archive | 80–120px beside confirmed state copy | Respect system focus/contrast | Lazy except immediately visible state | READY TO IMPORT |
| Food photos | Delivered D3-R WebPs (Shared Library; repo import pending) | 120–160px short banner or bowl cutout | Check actual photo against mode | WebP 1200/2400 and fallback | DELIVERED / GITHUB IMPORT & RUNTIME QA PENDING |
| Blueberry/botanical cutouts | Delivered D3-R WebPs (Shared Library; repo import pending) | 96–140px art pocket; never CTA | Alpha edges checked light/dark | WebP alpha 600/1200 | DELIVERED / GITHUB IMPORT & RUNTIME QA PENDING |
| Conceptual microbes | Delivered D3-R WebPs (Shared Library; repo import pending) | short header + always-visible illustration label | Opaque label background | WebP + local SVG fallback | DELIVERED / GITHUB IMPORT & RUNTIME QA PENDING |
| Athlete ridge | Delivered D3-R WebPs (Shared Library; repo import pending) | 112–156px navy short banner | Use navy overlay, no value overlays | WebP 1200/2400 and fallback | DELIVERED / GITHUB IMPORT & RUNTIME QA PENDING |
| Biology organism portraits | Current `OrganismPortrait` source-appropriate artwork or symbol | 36px thumbnail, click name to profile | Text/identity controls unchanged | Lazy if source valid | EXISTING; DO NOT REPLACE WITH D3 RENDER |

## 6. Developer implementation packets, tests, and completion ledger
| Packet | What to do | Where | Accept when |
|---|---|---|---|
| M0 | Pin HEAD commit, preview URL; inventory import graph, shells, existing routed selectors; list image endpoint HTTP statuses | Router/AppShell/CSS and CI | SHA, screenshot baseline, exact target paths recorded |
| M1 | Import full final 87 SVG archive with validated folder names and checksums | `client/public/brand/visual-v2/<batch>/` | 87 hashes, 87 route-accessible URLs where expected |
| M2 | Build reusable passive `EditorialMedia` and safe fallback; no personalized props | `client/src/components/EditorialMedia.tsx` | TS typecheck, missing WebP and missing SVG error test |
| M3 | Update `CompanionHero` optional slot and Today safe composition; preserve CTA | Today components + canonical CSS | 390 mobile image visible, no overlap, first-use and error |
| M4 | Food / Biology + Gut / Explore headings and empty art | Page components | Source/record states still correct, image visible at 390 |
| M5 | Progress, Athlete and Profile safe art slots | Page components | Charts, session controls and privacy safe, imagery visible where specified |
| M6 | Theme + forced-colors + reduction + responsive QA | Canonical scoped stylesheet | No CSS leakage; actual screenshots and no-flag parity |
| M7 | **Import delivered D3 WebPs and retained PNGs now** using SHA-verifiable source manifest; incrementally enable only when source URLs return 200 and human/licensing review clears | `client/public/images/editorial/{cutouts,heroes}/` | 13 originals + 26 variants copied; SHA matches, true-alpha QA, responsive crops, 404 fallback, byte exceptions documented. No stop-work gate |
| M8 | Real app 7-screen screenshot matrix and designer punch list | Preview deployment and PR | Each screen real screenshot links, zero unresolved high-severity problems |

### 6.1 Specific regression tests to add
- [ ] Everyday mobile Today after first use shows the selected hero SVG rendered at perceptible size (nonzero client rect and non-negligible opacity) and button fully within viewport.
- [ ] At 390px, Today `getBoundingClientRect` of media does not intersect `hero-button` or a text status block. At 320px + 200% zoom same.
- [ ] Food description focus, keyboard and save flow unaltered with media inserted; photograph never shown as food confirmed in log.
- [ ] On Biology microbiome missing report, source error and confirmed empty cases render different text/states; generic organism image not announced as identified species.
- [ ] When research conceptual WebP loads, visible label “Illustrative, not your data” is present; when it errors, SVG fallback plus label remains.
- [ ] On Progress with sparse irregular dates, numerical and plotted data unchanged before/after art integration; no artificial points.
- [ ] Athlete 5-item bottom nav at 320px remains fully operable, no covered status/controls or accidental check.
- [ ] Profile unsaved, conflict, revoke, destructive actions have clean focus and no overlap with decorative art.
- [ ] No premium CSS leaks when `data-bloom-visual` flag off; baseline visual parity at 390/1440.
- [ ] All image requests use approved same-origin files; 1x/2x files exist before `srcSet` is activated; simulate 404 and offline.
- [ ] Screen reader ignores decorative images; conceptual label remains accessible as text; visible focus remains 3px.
- [ ] Network throttle mobile: only actual LCP image loads eagerly, below-fold art deferred, no unexpected layout shifts.

### 6.2 QA capture rows / exportable CSV
Full matrix: seven principal routes × 320/390/768/1440 CSS px × Everyday light/dark + Athlete-appropriate where mode applies × first-use/recorded/partial/error as applicable. Required final capture minimum: each route at 390 and 1440 in its appropriate modes, a 320px stress capture, a 768px reflow capture, and at least one 200% zoom + image-failure capture for each distinct slot family. Real app screenshot only; snapshot label includes commit, preview, viewport, DPR, mode, fixture, screenshot date, locale, asset hash.

## 7. Exact asset handling and manifest schema
The attached CSV enumerates **all 87 individually SHA-verified SVGs** from the canonical Designer archive and gives the prescribed target path. The manifest should be extended by Developer with actual copied target SHA and request status; do not mark “IMPORTED” from packaging alone. The delivered D3 WebP manifest (Shared Library) supplies actual file, hash, dimensions, byte count, alpha and source provenance; the deployment ledger must additionally contain `file`, `type`, `slot`, `origin`, `tool`, `model`, `generationDate`, `exactPrompt`, `license`, `commercialUseReview`, `humanArtifactReview`, `alt`, `conceptualLabel`, `width`, `height`, `bytes`, `sha256`, `theme`, `mobileCrop`, `desktopCrop`, `fallbackSvg`, `lastVerifiedCommit`. Example statuses: `PROPOSED`, `GENERATED`, `REVIEWED`, `IMPORTED`, `BROWSER_VERIFIED`. Never mark produced before bytes exist.

## 8. Owner and approval responsibilities — no blanket stop
| Owner | Exact responsibility | Output | Status |
|---|---|---|---|
| Structural UX | Approve slot boundaries, text order, state contracts; screen regression review | This document + browser PASS/FAIL | SPEC COMPLETE / BROWSER NOT TESTED |
| Designer | Produce media and specify exact slot geometry, crop, typography and CSS integration; approve actual 7-page mobile composition once rendered | Appendix M1-D, delivered 13-source/26-WebP archive; 390/320 captures pending | ASSET DELIVERY & SPEC COMPLETE / BROWSER REVIEW PENDING |
| Architect | Resolve source/version and ensure no duplicate CSS or art; approve target asset mapping | Frozen SHA, asset winner map, D3-R addendum | TO COMPLETE — Architect |
| Developer | Import and wire safe art, validate responsive source flows, capture screenshots | Branch commits, tests, screenshots, PR ledger | TO COMPLETE — Developer |
| Branding | Validate only any NEW visible media-related copy, including conceptual disclaimer | Copy review of changed strings | Existing R4 keys reused; incremental review |
| Owner | Inspect completed integrated premium mobile product | Final review before main | NOT TESTED |

## 9. Completion criterion (do not misreport)
“Mobile art implementation complete” requires: all seven routes show the selected intentional media where defined (or documented safety-suppression for a specific state), source hashes tracked, all approved SVGs that are used load on actual deployed preview, existing CTA/data interactions preserved, no 7%-opacity effectively invisible primary art, source-state language correct, responsive and 200% zoom captures passed, visual and structural reviews recorded. "Full D3 photographic implementation complete" additionally requires physical WebP files, manifest/license review, responsive 1×/2× integration and live crop/contrast testing. Both are separate acceptance claims; R4 SVG implementation should not wait for optional D3 photos.

## 10. Source and uncertainty appendix
**Inspected:** repository source on target branch, including Today/CompanionHero, FoodEntryChooser, NutritionHistory, Microbiome, BiologyHome, Explore, Progress/FoodProgress, AthleteWorkspace, Profile, BottomNav, PremiumIcon, `client/src/workspace.css` and `client/src/styles/bloom-visual-scoped.css`; canonical `Bloom_Production_Assets_Final_Batches_1_to_6_2026-11-07.zip` with 87 SVGs; shared `Bloom_R4_Master_With_Brand_Copy_2026-11-07.zip`; `Bloom_R4_D3_Raster_Media_UX_Architect_Decision_2026-11-07.md`. Source names in this document are not a screenshot-derived description of a deployed build. Some secondary route component paths are still TO VERIFY. The D3-R WebP files and source hashes are now available via the Shared Library package `Bloom_R4_Editorial_Raster_Production_13_Originals_26_WebP_2026-11-07.zip`. This is subsequent evidence relative to M1’s repository inspection. Actual GitHub file presence, HTTP status and browser acceptance remain unverified.

---
**Developer instruction:** Use this as a complete additive mobile-media contract for R4, implement now. Preserve the intact R4 master with Appendix V and Branding copy; do not replace it with this narrower mobile spec. Open one PR/commit series on the existing development branch; deliver actual 390px mobile screenshots and cross-route fixtures, not design reference exports.

---

## Appendix M1-D — FINAL DESIGNER MEDIA RESOLUTION (binding, additive to M1)
**Designer disposition:** Spec and raster production **COMPLETE**; source-package hashes verified; **GitHub import, commercial rights, physical-image QA and deployed visual approval PENDING**. No cross-team owner stop/gate. Preserve full R4 UX and copy.

### D1. Canonical deliverables and paths
- `Bloom_R4_Editorial_Raster_Production_13_Originals_26_WebP_2026-11-07.zip` published under `/Bloom gut health/Agent Handoffs/`; 13 PNG originals and 26 WebP exports. The lightweight companion `Bloom_R4_Editorial_WebP_Only_26_Images.zip` has WebPs and manifests but omits PNG originals.
- **Canonical repo target** `client/public/images/editorial/` with `cutouts/` and `heroes/`; public URLs start `/images/editorial/`. Retain source PNGs unmodified and check exact original/source hashes. Never use the older proposed `client/public/brand/visual-v3-media/`.
- 1x/2x variants in the manifest represent target resolutions; 2x hero variants were upscaled from ~1942px-wide originals and are **not true native 2400px detail**. Preserve the quality caveat. File sizes above 200 KB are documented quality exceptions, not silent failures.
- Manifest does NOT establish generation tool/model/exact prompts or commercial-use license. These are **unknown** until provenance is supplied, and must not be claimed verified. Alpha-channel integrity is verified programmatically; actual edge halo/food anatomy visual QA remains pending.

### D2. Exact 13-source / 26-WebP register
| Name / family | 1x dimensions | 2x dimensions | Intended slot | 1x SHA-256 | 2x SHA-256 |
|---|---|---|---|---|---|
| `bloom-blueberry-sprig` (cutout) | 600×600 | 1200×1200 | Today secondary botanical OR Explore accent; no simultaneous hero overlay | `7d2f9ab5a4057b5d99d1ff6f631cf07f437e72903244e1632886f2fb3f67a007` | `7856ba8143db14ae8a844c5e04bd2eda102d8b846b96bcd1a5a6af90e11a0b53` |
| `bloom-echinacea-flower` (cutout) | 600×600 | 1200×1200 | Today optional cutout, never over contextual CTA | `a561edfdca657d9bb5529c5e966922bccdecf45f3d695fc54b2514c1c9327180` | `2c6ed6c8d7cfc470f9061dd1f790e66e53ace56acef4c70fad9ddd4fe7c26e99` |
| `bloom-three-leaf-sprig` (cutout) | 600×600 | 1200×1200 | Progress/Profile optional desktop intro only; hidden mobile | `3f4359731ac1566acf924321715f6753cb03fb3fcc67fde09493435fefd793b3` | `2e852fa7510187e48ae2a54bc73b341c58e53968d9602db38c49e6b9d6e6adad` |
| `bloom-oatmeal-bowl-primary` (cutout) | 600×600 | 1200×1200 | Food meal editorial cutout (never a claimed logged meal) | `c6229a44f9c85880f50f53fc960fc3aff71c2ad079ea30e8a0eec72109f876bc` | `8a5b60b306dffdac919219e91d488198846d8b1694e5cc192db62a3342ff1f40` |
| `bloom-oatmeal-bowl-alternate` (cutout) | 600×600 | 1200×1200 | Food alternate presentation only, never duplicate simultaneous hero | `223076ba37a47984badf0564b864a32e7498fb8cee538bca31a640befdf6af14` | `c1d47210b35106fd0f6b1dc79077266eda8073e72a18909620131e798daa9673` |
| `bloom-yogurt-honey-blueberries` (cutout) | 600×600 | 1200×1200 | Food genuine editorial/recipe content, not diary record | `cd0580a931d6004886654b9b63fd39bc9fb61d8032c5301f303e99196916aed6` | `fd7a08387b22cce0d89f0d04ba2492e3d38a60ec0ad90d90f5f6d40c6027275b` |
| `bloom-raspberry-smoothie` (cutout) | 600×600 | 1200×1200 | Food editorial content, not diary record | `0f4a14d0459a49dc9b37b6b74bde135fbe88ce6f4e8f36d45d64d425c14dcefe` | `f83b4d932c3d9cf423efec61a9db80c399b4d856bbb6380915cb1c3547b9bd7a` |
| `bloom-food-oatmeal-linen` (banner) | 1200×500 | 2400×1000 | Food hero banner; 1 chosen composition | `8071380f51d748e435b3438c502c70e6d6c5690a7fe1f307dd792e955480df2b` | `64e01ab7693cbeabced8ae938a6bd8db3bcae2177048ec4bff83e9a5c9c419e0` |
| `bloom-explore-blueberry-macro` (banner) | 1200×500 | 2400×1000 | Explore featured banner | `b99386cef0cf1d4326040aa2446fbde13f128f51c1fa284aef18fc39118ee98d` | `b29f0c4d321601c0bf4029f20183aca4a63af332b29ab6ccc7c4786afa013763` |
| `bloom-today-meadow` (banner) | 1200×500 | 2400×1000 | Today primary atmospheric hero when text remains separate | `72f76225f898d52c5ee73109c6cdaccac60796e69be5df2e59b12410dbf5546e` | `e3f268196905cb43eea68137a5d050f8115664a60b601bb2a9b97c80c1fc2ce0` |
| `bloom-athlete-mountains` (banner) | 1200×500 | 2400×1000 | Athlete navy banner, no session status overlay | `1b8579ef1ead1e509cf30a0473263d56bc875203ae704202864adfd505f6ad77` | `61a6950589f88d71cd635d46a2422037aa18a98eb66a0b0395be9363ebddcd84` |
| `bloom-biology-rods` (conceptual-render) | 1200×500 | 2400×1000 | Biology alternative conceptual header; visible disclaimer | `4cd5ea1b142e1cdc308d9f1082e08daa6e54859b6c82147509cc6d65c705471a` | `4e61564626a901ff9b7c58498ae34453c0acec6b55ace945a7c60cb85b5c2430` |
| `bloom-biology-abstract-cells` (conceptual-render) | 1200×500 | 2400×1000 | Biology primary conceptual header; visible disclaimer | `cd6fde190758eb7976398141fd939eba07903618b964a59e7c8251945aa80f74` | `c42596c2190e301486f2b43125468905d0390e518c80e64bfcd59ab42b96ac68` |

### D3. Mobile-safe image slot choices (Designer values; UX retains ordering)
| Slot | 320–359 CSS px | 360–767 CSS px | 768–1439 CSS px | ≥1440 CSS px | Focal point and fallback |
|---|---|---|---|---|---|
| Today / `today-hero` | 96px art band; CTA in separate flow | 120px | 156px | max 176px | `bloom-today-meadow` 70% x / 50% y, `object-fit:cover`; fallback `hero-today.svg`; if no safe slot use SVG cutout or omit photo |
| Food / `food-banner` | 112px | 144px | 180px | max 220px | `bloom-food-oatmeal-linen` 78% x / 50% y; fallback `hero-food.svg`; no photo on sensitive entry/review forms |
| Biology / `biology-banner` | 100px + caption below | 128px + caption below | 160px | 200px | `bloom-biology-abstract-cells` 73% x / 50% y; fallback `concept-microbe-community.svg`; caption always rendered, including fallback |
| Explore / `explore-banner` | 104px | 132px | 168px | 200px | `bloom-explore-blueberry-macro` 80% x / 50% y; fallback `hero-explore.svg`; headline below picture |
| Athlete / `athlete-banner` | 112px | 144px | 180px | 220px | `bloom-athlete-mountains` 75% x / 45% y; fallback `hero-athlete.svg`; navy solid label and CTA region |
| Progress/Profile | No cutout on mobile | No cutout on mobile | Optional ≤96px cutout | Optional ≤120px cutout | `bloom-three-leaf-sprig` `object-fit:contain`; suppress around data charts, permissions and edits |
| Empty/error states | SVG only, 80–96px | SVG only, 96–120px | SVG only, 120px | SVG only, 140px | R4 per-state SVG; use only when true state warrants, never over Retry, unsaved draft or measured values |

### D4. Scoped CSS paint values — merge into `client/src/styles/bloom-visual-scoped.css`, **not** a new global stylesheet
```css
.app-shell[data-bloom-visual="premium"] .bv-media { position:relative; isolation:isolate; overflow:hidden; min-width:0; margin:0; border-radius:20px; background:var(--bv-paper,#F5F3EB); pointer-events:none; }
.app-shell[data-bloom-visual="premium"] .bv-media img { display:block; width:100%; height:100%; object-fit:contain; }
.app-shell[data-bloom-visual="premium"] .bv-media--banner img,
.app-shell[data-bloom-visual="premium"] .bv-media--conceptual img { object-fit:cover; }
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="today-hero"] img { object-position:70% 50%; }
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="food-banner"] img { object-position:78% 50%; }
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="biology-banner"] img { object-position:73% 50%; }
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="explore-banner"] img { object-position:80% 50%; }
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="athlete-banner"] { background:#182B45; }
.app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="athlete-banner"] img { object-position:75% 45%; }
.app-shell[data-bloom-visual="premium"] .bv-media--conceptual { overflow:visible; }
.app-shell[data-bloom-visual="premium"] .bv-media-concept-label { position:absolute; inset-inline-start:8px; bottom:8px; max-width:calc(100% - 16px); padding:4px 8px; border-radius:8px; background:#FFFEFA; color:#173E32; font:600 12px/1.4 system-ui,sans-serif; }
.app-shell[data-bloom-visual="premium"] .bv-editorial-hero:has(.bv-media)::after { content:none !important; }
@media (max-width:767px) { .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="progress-corner"], .app-shell[data-bloom-visual="premium"] .bv-media[data-bv-slot="profile-corner"] { display:none; } }
@media (forced-colors:active) { .app-shell[data-bloom-visual="premium"] .bv-media img { display:none; } .app-shell[data-bloom-visual="premium"] .bv-media-concept-label { position:static; background:Canvas; color:CanvasText; border:1px solid CanvasText; } }
@media (prefers-reduced-transparency:reduce) { .app-shell[data-bloom-visual="premium"] .bv-media { backdrop-filter:none; -webkit-backdrop-filter:none; } }
@media (prefers-reduced-motion:reduce) { .app-shell[data-bloom-visual="premium"] .bv-media, .app-shell[data-bloom-visual="premium"] .bv-media img { animation:none !important; transition:none !important; } }
```
**Paint rule:** no separate photo gradient is required because every title, CTA, source, error and value remains on a stable opaque surface distinct from the raster. No blur/glass over scientific content. If art/pseudo layering conflicts with app CSS, hide the pseudo-element, not the actual message. Verify real browser dark/light/Athlete contrast, the 320px case and 200% zoom; these numbers are production instructions, **not a claim of visual PASS**.

### D5. Exact loading, source and accessibility contract
- Use app-specific `raster.src` `/images/editorial/heroes/bloom-today-meadow.webp` (or `cutouts/...`) and the `@2x.webp` partner. Source PNG remains version-controlled under the same directory; do not point `<img>` to a ZIP or to a Shared Library URL.
- `srcSet="... 1x, ...@2x.webp 2x"`; reserve correct 12:5 (hero) or 1:1 (cutout) ratio; use real intrinsic width and height. Avoid mismatched mobile crop that hides the only meaningful subject.
- Priority/eager only for the actual above-fold LCP media; others `loading="lazy"`. Handle 404/error via an `onError` state that switches to verified SVG, and test offline and failed WebP requests.
- All decorative raster media uses `alt=""` and `aria-hidden="true"`; conceptual render always has adjacent visible text **Illustrative, not your data**. Accessible content and status do not rely on image visibility.
- Browser must verify PNG original and WebP response hashes and HTTP statuses; local manifest checks and SHA-256 alone do not establish deployment. Original 13 PNGs and all 26 WebPs included in delivery; in lightweight ZIP PNG originals are absent.

### D6. Designer acceptance and remaining unknowns
- Designer spec: **complete**. Asset export: **complete**. Alpha channel: programmatically checked for seven cutouts. Original PNG SHA per manifest: verified. Full-resolution visual/crop/edge quality: **not yet independently passed**.
- Commercial terms, generator model/date and exact original prompts: **unknown or unverified** in the supplied archive. Architect/owner must confirm before external release; do not fabricate metadata. This is an explicit licensing/provenance release gate, not a reason to suspend other R4 coding.
- Real app: 320/390/768/1440 widths, 200% zoom, forced-colors, dark, Athlete, image-failure 404, collision and contrast PASS require actual previews. Record browser/fixture/SHA and screenshot evidence; no inferred acceptance.
- No intermediate owner GO/NO-GO. Internal Today calibration is fine; continue all seven views and reserve owner final review before main.