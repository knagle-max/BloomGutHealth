# Bloom — Periodic Release Identity | REL-A01–REL-A06

**Owner design direction provided 2026-11-21 — DESIGN HANDOFF / INCREMENTAL ASSET PRODUCTION**
**For:** Visual Designer successors, Chief Architect, Codex, UX/Accessibility, Release Engineering.
**Branch:** `enhance/bloom-experience`.
**Status:** System concept proposed by owner; REL-A01 first review candidate forthcoming; **no runtime assets integrated**, no release readiness or public launch claimed.
**Authoritative operating queue:** `AGENTS.md` and `NEXT_ACTIONS.md`; this file is an art-direction/implementation-input contract, not a new parallel Codex task queue.

## 0. IMPORTANT — version-to-element convention conflict (must reconcile BEFORE engineering)

This new owner-supplied proposal says **major-version mapping**: 0.x = Project Genesis; 1.x = Hydrogen; 2.x = Helium; 3.x = Lithium; 4.x = Beryllium; 5.x = Boron; 6.x = Carbon; 1.1.0 and 1.2.0 retain Hydrogen. Element tile belongs to *major public releases* only. A pre-release build, including a 1.0 release candidate, remains Genesis until genuinely authorized.

**CURRENT prior Architect-approved policy contradicts this**: `docs/architecture/BLOOM_PRODUCT_RELEASE_NAMING_20261121.md` and `shared/product-release.ts` currently use a **minor-line mapping**: 1.0 Hydrogen, **1.1 Helium, 1.2 Lithium**; patch retains minor line. Current product identity is `0.6.0 · Project Genesis`. The root npm package version is NOT the Bloom public release version.

**Required Architect decision:** Confirm that this *later owner-provided major-only request* supersedes the earlier minor-line policy, or explicitly request clarification if deemed ambiguous. Do NOT silently change `shared/product-release.ts`, version metadata, user-facing release name or tests as an art import. No draft depiction of `Bloom 1.0.0 — Hydrogen` indicates that Hydrogen has actually shipped. If approved, replace the version mapping and associated tests in a separate authorized scoped integration pass, preserving Genesis for prereleases and owner-authorized launch gating. An element's name is a codename, never a clinical/scientific measurement or ingredient claim.

## 1. Identity thesis

Bloom's **botanical human-science brand remains primary**; a periodic-table tile is a **small, recognizable release signature** limited to About, Settings, release notes, update dialogs and launch communications. Premium, restrained, editorial, precise. Avoid software badges, excessive ornament, orbital electron animations, glowing particles and medical/scientific claims. Do NOT scatter tiles across everyday dashboards.

**Concept A:** flagship full composition: authentic periodic tile (top-left atomic number, large centred symbol, small name beneath) + live `Bloom 1.0.0`, `Hydrogen Release` and optional expressive launch headline. Launch-only tagline *“The beginning of something extraordinary.”* **Do not show tagline repeatedly in About/Settings**; compact functional text there should include true release date and a working release-notes link when available.

**Concept B:** compact lockup derived from EXACT SAME tile component, NOT redesigned iconography; short label `Bloom · Hydrogen` and `Version 1.0.0`.

**Genesis:** all 0.x development eras have typographic `Bloom 0.6.0 · Project Genesis` or `Bloom 0.6.0 · Genesis` as approved by release owners, discreet `Pre-release development build`, **NO atomic tile**. Pre-release 1.0 suffixes also Genesis.

## 2. Six asset briefs and dependencies

| ID | Priority | Deliverable | Acceptance |
| --- | --- | --- | --- |
| **REL-A01** | P0 | Original reusable periodic element tile component. Source template uses semantic `atomicNumber`, `symbol`, `elementName` from verified release registry; example 1/H/Hydrogen. | Authentically placed atomic number top-left; single large central symbol; element name underneath; restrained deep forest green with fine sage line; vector SVG and accessible DOM; configurable theme/size; no baked-in hardcoded Hydrogen in production |
| **REL-A02** | P0 | Full Concept A release identity composition, horizontally on desktop, stacked on mobile. | Reuses A01; live `Bloom 1.0.0` / `Hydrogen Release`; launch tagline optional and launch-only; About uses date and View release notes if true; legible 320/390/768/1440 |
| **REL-A03** | P0 | Compact Concept B signature for About/Settings/update dialogs. | Reuses A01 rather than drawing another tile; minimum 24–32px usable symbol with graceful fallback to text where name too small; no layout overflow |
| **REL-A04** | P0 | Project Genesis (0.x/pre-release) typographic lockup. | No periodic tile; label and pre-release descriptor; same spatial/typographic grammar; don't misrepresent a 1.0.0 prerelease as Hydrogen |
| **REL-A05** | P1 / launch phase | Release announcement artwork: 16:9, 1:1 and vertical. | Original botanical atmospheric design, Bloom wordmark, A01; typography and version remain editable DOM/vector layers; no copy embedded in raster backgrounds; not a routine navigation component |
| **REL-A06** | P0 companion spec, verify with A01 | Four theme states + restrained first-appearance motion. | Everyday Light, Everyday Dark, Athlete Light, Athlete Dark; accessible focus/contrast/reduced-motion; fade 140–220ms only; no particles/orbit motion; reuse actual theme tokens |

**Recommended sequence:** REL-A01 → REL-A06 base tokens/static states → REL-A02 → REL-A03 → REL-A04 → REL-A05 near launch. Present and approve **one actual asset at a time**. At each step mark approved/rejected/design candidate distinctly and update this handoff and source manifest without falsely marking runtime acceptance.

## 3. Geometry, typography and brand materials

**Tile structure:** a reusable rounded-square **periodic-table glyph**, not a card packed with decorative UI. Suggested aspect 1:1, scalable SVG viewBox `0 0 160 160`, visual mass balanced: atomic number at x 17 y 25, large element symbol centred approx x 80 y 90, element name centred x 80 y 129. Deep evergreen inner material; 1px fine sage border, lightly rounded corners (e.g. r 14), no gradients/glow/reflections. Internally reserve enough width for two-character symbols (He, Li, Be). Avoid the common fake table error of centering the atomic number or omitting the name. If atomic mass is not part of requested design, do NOT add it.

**Theme design anchors, not new global token overrides:** Everyday deep forest `#102B25`, ink `#173E32`, brand action `#246B50`, sage `#D9E7D5`, ivory `#F5F3EB`, warm white `#FFFEFA`; Athlete navy `#0F1B2E`, blue surface `#182B45`, pale blue `#81BEFF`, text `#F1F6FF`. Athlete must stay actually blue; theme variants maintain structural parity. Palette must be checked against current runtime tokens (source archived `design-tokens.json` is marked *proposed*). No color-only status claims.

**Requested new typography:** Newsreader for editorial release headings; Plus Jakarta Sans for atomic number/name/details and small labels. **Important current-source caveat:** the older Bloom brand handoff identifies Inter (and an editorial serif fallback), and this asset pass did not verify that Newsreader/Plus Jakarta Sans are bundled and licensed in the app. Treat these as an explicit **new owner typography request**, not already-implemented font assets. Architect to reconcile with current licensed type system. Deliver font-independent SVG outlines only if licensing permits; otherwise retain editable SVG `<text>` and font stacks, with `Georgia` / `Inter` or `system-ui` fallbacks. Do NOT embed or redistribute proprietary font binaries.

**Sizes:** small (48–64px symbol-first), medium (96–128px tile), large (160–192px hero tile). At small size, keep atomic number and element name legible or use a deliberate simplified `symbol + accessible text` variant; no squashed 160px art. CSS/DOM layout must operate at 320/390/768/1440 and 200% zoom. Screen readers should get localized `Hydrogen, atomic number 1, symbol H`, release identity separate; decorative tiles aria-hidden if redundant adjacent live text.

## 4. Dynamic release registry contract

**Conceptual—not new runtime source until architect reconciles conflict:**
```ts
type ReleaseIdentity = {
  version: string;
  publicRelease: boolean;
  codename: string | null;
  element: null | { atomicNumber: number; symbol: string; name: string };
  releasedAt?: string | null;
  releaseNotesUrl?: string | null;
};
```
Follow existing authoritative `shared/product-release.ts`; don't ship a duplicate release source, hardcode `1.0.0` in the React component, or advance release identity automatically from npm CI/package version. Element mapping should be deterministic, reviewed, testable; minor/patch behavior must follow final Architect-confirmed version policy. Factual released date/link only if present.

## 5. Production workflow (reproducible)

1. Read `AGENTS.md`, `design/visual-system/SPECIALIST_HANDOFF.md`, this file, current theme tokens, `docs/architecture/BLOOM_PRODUCT_RELEASE_NAMING_20261121.md`, and `shared/product-release.ts`; record any conflicts.
2. For REL-A01 design an **editable vector/DOM component** (do **not** substitute image-generation raster; it would not satisfy data binding/editability). Use a 160×160 viewBox SVG source template, CSS custom properties for themes and semantic props for the component. Preserve typography as editable text. Produce a preview/example showing all four themes and small/medium/large states, not hardcoded into master.
3. Subject quality gate: atomic number TOP LEFT, correct centred symbol, proper element name beneath; letterforms balance for 1- and 2-character elements; genuine periodic format; no atom-orbit clipart; compare on 320/390/768/1440 and zoom/focus.
4. User reviews one candidate at a time. Only after explicit owner approval mark `DESIGN_APPROVED`.
5. Produce source SVG, reusable React/CSS/TypeScript implementation contract, preview HTML or screenshots as feasible, `README.md`, SHA-256 manifest and ZIP. Use original fonts only if already available/appropriately licensed. Store exact source files in GitHub or Shared Library `/Bloom gut health/Agent Handoffs/` and verify actual paths.
6. **Architect/Codex** wire to existing release identity only after resolving major/minor conflict; confirm no Hydrogen for unreleased/RC build. Test empty/unknown identity, all four themes, smallest sizes, 200% zoom, screen reader, keyboard and reduced motion. Screenshot real app at exact SHA; don't mark INTEGRATED/VERIFIED from design ZIP.
7. Maintain current version and owner decisions in this handoff, not a separate parallel registry. Asset lifecycle = REQUESTED → DESIGN_CANDIDATE → OWNER_DESIGN_APPROVED → DELIVERED → INTEGRATED → VISUALLY_VERIFIED; science/rights/accessibility remain separate gates.

## 6. Acceptance and per-agent handoff

**Designer:** document geometry, type, exact theme colors, mock appearances, component states, source quality/ownership. Show actual artifact, not generic image search. Maintain A01 as the single geometric master from which all tiles derive.

**Architect:** adjudicate the **major/minor cadence conflict**, typography request, source registry and release guardrails, use one existing About/Settings surface instead of inventing a new nav feature. Preserve existing product-release readiness and gating policies.

**Codex:** implement from editable source and authoritative release registry; no new data service, DB, release automation or artificial readiness. Keep tests and visual QA; preserve existing functional sources/flows.

**UX/Accessibility:** ensure tagline only on launch creative, About concise functional metadata, meaningful release-notes link, no false debut date, keyboard, contrast and zoom, localized labels.

**Non-goals:** no full-table browser, no six independent element images, no investor/clinical claims, no animated chemistry, no presence throughout core product pages, no version change or public launch authorization.

**Immediate next review candidate:** REL-A01 periodic tile, Hydrogen fixture for visualization only; design status **NOT YET APPROVED**.


## 7. Owner approval and asset delivery receipts (2026-11-21)

**REL-A01 — OWNER DESIGN APPROVED (v3).** Owner explicitly approved the visually denser third iteration of the Hydrogen periodic element tile. The approved **reference image** is `assets/REL-A01-approved-representative-v3.jpg` in the approved ZIP. An editable SVG reconstruction and data-driven `createElementTile` JavaScript helper are supplied as implementation source; the reference JPG is the decisive visual benchmark, while the SVG reconstruction remains pending font/pixel/browser fidelity checks.

- **Persistent approved archive:** `/Bloom gut health/Agent Handoffs/Bloom_REL_A01_Periodic_Tile_Approved_v3_2026-11-21.zip`.
- **Included:** approved Hydrogen JPG, editable SVG reconstruction, reusable dynamic element-tile JS, README, SHA-256 manifest.
- **Design cues confirmed:** compact periodic tile, minimal unused space, large centered serif H, atomic number upper-left, element name below, deep botanical-green ground, fine restrained sage rim, pale warm-ivory type. Avoid roomier v1/v2 treatment.
- **States:** owner approved appearance only; NOT app-integrated, NOT font/pixel QA verified, NOT public-release authorization.

**REL-A02 — DESIGN REVIEW CANDIDATE, NOT APPROVED.** Full Concept A composition is built from the **same REL-A01 editable tile component**, with live DOM version/title/subtitle and optional About metadata, responsive horizontal and vertical compositions, four mode themes, and no fabricated release date or release-notes link.
- **Review archive:** `/Bloom gut health/Agent Handoffs/Bloom_REL_A02_ConceptA_Review_2026-11-21.zip`.
- **Includes:** `index.html`, `style.css`, `preview.js`, shared REL-A01 tile JS/source SVG, flattened **representative** desktop and mobile JPG examples (not screenshots of browser runtime), README, SHA-256 manifest.
- **QA warning:** Browser rendering was blocked in this environment; prototype has NOT been live-browser visually verified. Fallback system fonts differ from requested Newsreader/Plus Jakarta Sans, pending app font/licensing checks.
- **Decision pending:** Owner to approve or refine REL-A02 before final composition integration.

**Supersession:** This section replaces the older “REL-A01 unapproved” status line below. Resolve major-only vs minor-release cadence conflict before changing any release-identity logic.


## 8. REL-A02 owner approval and REL-A03 review delivery

### REL-A02 — owner design APPROVED, archived source delivered
Owner approved the existing **REL-A02 Concept A** responsive full Hydrogen release composition (following REL-A01 v3 approval). The source content is unchanged from the review ZIP. The same source ZIP was re-uploaded under an approved delivery name:
`/Bloom gut health/Agent Handoffs/Bloom_REL_A02_ConceptA_Approved_2026-11-21.zip`.
It contains the HTML/CSS/JavaScript prototype, the shared REL-A01 data-driven SVG tile, and representative desktop/mobile JPGs. **Design approved ≠ app-integrated, browser-tested, font-licensed or public-release-authorized.** The prior receipt in §7 saying A02 'not approved' is historical and superseded by this section.

### REL-A03 — compact release signature DESIGN CANDIDATE
`/Bloom gut health/Agent Handoffs/Bloom_REL_A03_Compact_Review_2026-11-21.zip`.

**Visual grammar:** Derive directly from the approved REL-A01 shared `createElementTile()` renderer. For About/Settings use a compact horizontal row with approximately 122px tile and live `Bloom · Hydrogen` / `Version 1.0.0` text. For update-dialog context use a 60–68px tile adjacent to readable live identity text; the tiny tile's name is not sufficiently readable on its own, so the external text is mandatory. No tagline, invented release date or fake release-notes link. Preview theme switcher covers Everyday Light/Dark, Athlete Light/Dark and uses existing theme colours.

**Contents:** `index.html`, `styles.css`, `preview.js`, same REL-A01-tile-component.js and SVG, desktop/mobile representative JPG previews, README, SHA256 manifest. The JPGs are Pillow-made representative **static mockups**, **not Chromium browser screenshots**: the sandbox blocked browser access to both file:// and localhost. HTML/DOM layout, font fidelity and 320/390/768/1440 live browser testing still pending.

**Status:** `REL-A03: DESIGN_CANDIDATE / OWNER_REVIEW_PENDING`. Hydrogen 1.0.0 remains future *illustrative only*; current app is Genesis. No release-naming policy conflict resolved and no change to `shared/product-release.ts`.

**Next:** Present A03 owner preview and wait for approval/refinement before marking A03 approved or starting A04 Genesis.
