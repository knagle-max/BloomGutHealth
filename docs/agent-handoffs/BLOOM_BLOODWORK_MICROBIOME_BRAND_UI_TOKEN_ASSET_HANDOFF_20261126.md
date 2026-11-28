# Bloom — Bloodwork & Microbiome Brand UI / Design Token Layer
## Shared Branding handoff; asset reuse and narrowly scoped design deliverables

**ID:** BRAND-BIO-20261126-R1 · **Date:** 2026-11-26 · **Disposition:** APPROVE PROPOSED UX DIRECTION FOR VISUAL EXPLORATION; NO UNAUTHORIZED PRODUCT REDESIGN, NEW MEDICAL CLAIM, OR ART RECOMMISSION.
**Source handoff reviewed verbatim:** Shared Library `/Bloom gut health/Agent Handoffs/Bloom_Brand_Bloodwork_Microbiome_UX_Handoff_2026-11-26.md` (ID `UX-BIO-BRAND-20261126-R1`, 363 lines). The UX author reviewed older `main` source at `fb8b24ae...` and explicitly did not inspect current deployed builds. **Brand code comparison:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience` current source for `BloodworkAtlas`, `LabExplorer`, `LabTrend`, `LabMarkerEducation`, `Microbiome`, `MicrobiomeEditorial`, `MicrobialProfile`, `OrganismPortrait`, current `bloom-visual-scoped.css` and BVA registry. No actual browser, device, deployed app or private-account screenshot inspection was performed in this handoff.
**Owner standing design standard:** [Brand visual hierarchy & design tokens](BLOOM_STANDING_BRAND_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md), [full component specification](../../design/visual-system/STANDING_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md). UX owns flows, ordering, tab architecture and CTA placement; Brand specifies visual implementation; Architect reconciles latest authoritative behavior; Biology reviews scientific meaning; Codex implements only active authorized queue tasks.

## 1. Creative direction and preservation verdict

**Bloodwork:** "A personal biomarker encyclopedia." Carefully controlled numeric hierarchy, real dates/units, precision, elegant compact history; editorial medical natural history rather than sterile hospital dashboard.

**Microbiome:** "A personal biological ecosystem explorer." Rich approved macro-organism and natural-history art, portrait-led discoverability and generous scientific-name typography; report-specific evidence always clearly separate from general research.

Both must remain the SAME premium Bloom application: quiet botanical forest/sage/porcelain in Everyday, deep navy/precision blue in Athlete; independent light/dark presentation. Distinct personality without a separate palette or decorative second hero.

**KEEP unchanged unless an actual defect is reproduced:** canonical report/source/correction flows, approved Bloodwork and Biology art, lab marker names and original panel headings, source-interval meaning, lab chart data plots and accessible table, R3 marker order, organism portraits/neutral fallback, microorganism mapping logic, source-specific report data and taxonomy, scientific dossier sections, 190-catalogue design work, evidence caveats and accessibility behaviors. Avoid new data stores, category taxonomies or implied "healthy" classification.

**Important code finding:** `LabExplorer` already renders `LabMarkerEducation` alongside `LabTrend`, `MicrobialProfile` already provides `OrganismPortrait` and report/research disclosure, and `MicrobiomeEditorial` already supplies an approved art-led hero and selected-report summary. These are not blank areas and are NOT invitations to regenerate art. Actual current rendered ordering and readability still require browser verification.

## 2. Design assets: what is actually needed

Use **BIO-UI** IDs for editable UI/component design work, not new permanent BVA image IDs. Reuse original `UX-BIO-01..10` as acceptance requirements and `BIOUX-T01..16` tests.

| ID | Priority | Design package and required states | Reuse / artwork decision | What designer must deliver |
|---|---|---|---|---|
| **BIO-UI01** | P0 | Bloodwork Overview: populated, empty, partial, source warning, 0–2 actually eligible changes, category-first discovery | **Reuse** existing BVA-0009, category assets BVA-0010..0014, BVA-0029..0031, BVA-0036; no new banner | 390/1440 Figma/equivalent first-fold boards, category entry rows, source context, 320/768 adaptation and token table |
| **BIO-UI02** | P0 | Bloodwork Markers/category list: browse, search, long names, ambiguous source, no results, list-selected | **Reuse** existing LabCategoryArt/Icon, `LabExplorer`; no new category image | Compact marker row, search/filter sheet, desktop selected state, keyboard/return spec |
| **BIO-UI03** | P0 | Marker Detail: single, history, incompatible method, no interval, withdrawn/sourced correction, selected observation | **Reuse** `LabTrend`, `LabMarkerEducation`, CHART-A01–08 and B01–B03 designs. **R3 order must remain: latest → chart → default-visible What is it? → Why does it matter?** | Editable detail boards, precise result/value/units/date typography, scientifically honest legend/reference/source states |
| **BIO-UI04** | P1 | Bloodwork Reports: import/review, long original file label, selected source, correction, retry, deleted | **Reuse** existing source managers and icon system | One report-row/sheet component family, no shadow import dashboard |
| **BIO-UI05** | P0 | Microbiome Overview: numeric, qualitative-only, empty, report changed, real provider assessment | **Reuse** BVA-0051 approved microbiome hero, BVA-0017 category backdrop and `MicrobiomeEditorial`; do not make new artwork | Compact selected-report identity/organism CTA, art crop, honest count/coverage variants |
| **BIO-UI06** | P0 | Organisms catalogue: organism name wrapping, bacteria/archaea, numeric/qualitative, zero results, selected row, image fallback | **Reuse** existing `OrganismPortrait`, BVA-0037..0047, approved 0091..0096 sources pending scientific/runtime gates | Portrait-led 44–72px row set, 36–56px image use, report-only filter, list focus/selection and source qualifier |
| **BIO-UI07** | P0 | Individual organism profile: report-listed, source-only, unreviewed, research-only, no art, source detail, long names | **Reuse** `MicrobialProfile`, `OrganismPrimer`, and approved organism visuals. No new organism species portrait justified without taxonomy review | 390/1440 complete composition, selected-profile state, responsive portrait/name, concise "Meet this organism"/research and source disclosure |
| **BIO-UI08** | P1 | Functional research view: reviewed group, insufficient evidence, selected molecule/organism, source-linked relationship | **Reuse** existing Explore/functional-microbiome and CHART-C04/C06, not a fictitious activity graphic | Functional list/linked entity and evidence key; neutral unavailable state |
| **BIO-UI09** | P1 | Microbiome Reports/provider food: report versions, source-reported assessments, dietary categories, compare error | **Reuse** existing `MicrobiomeReportManagement`, source tables and approved style | Report selection/management and source-attributed assessment visuals |
| **BIO-UI10** | P0 | Cross-screen token/component specification and acceptance board | **Reuse** current brand palette, CHART base/source-inspection visuals, icons and input/dialog primitives | Four-theme tokens, typography, spacing, states, responsive and accessibility matrix; no new standalone graphic |

### Narrow artwork gaps — only commission if actual screen needs prove it

- **BVA-0026 — no laboratory records empty state:** Briefed, no source path in latest BVA registry. **Conditional P1.** Preferred: reuse `BVA-0009` as subtle vignette or a line-based empty document/vial plus an actual Add bloodwork button; if current no-data UI is already legible, **no new image**. If new: premium muted glass sample vial and botanical paper, 4:3 editorial framing, no pretend test values, original editable/rights source, optimized WebP and alternate small mobile crop. Keep art secondary to CTA.
- **BVA-0048 — 'What is LDL?' education thumbnail:** Briefed, no source path. **Conditional P1 only for LDL detail** where the live image slot exists in `LabMarkerEducation`. Preferred anatomically/scientifically reviewed LDL lipoprotein **conceptual** particle, gently spherical lipid/protein structure on warm neutral background, legible at **88px**. No false molecular exactness or claim it is personal imaging. Transparent PNG/WebP or SVG depending approved style; text remains live HTML.
- **BVA-0049 — 'Why it matters?' LDL thumbnail:** Briefed, no source path. **Conditional P1**, paired with BVA-0048; refined arterial cross-section with scientifically correct depiction and no suggestion that user's LDL caused an obstruction. Match previous treatment, ~88px layout, clean crop/alt.
- **BVA-0050 — LDL artery atmospheric artwork:** Briefed. **P2 defer** unless the owner expressly requests new editorial visual. The R3 small-detail view gains more from two thumbnails than another large banner.
- **BVA-0053..0077 — species-specific candidate portraits:** **Do not commission in bulk.** Existing broad morphology illustrations and 0091–0096 visually approved sources (scientific approval pending) can serve conceptual visual roles. Reconcile each identity and source before assigning a species-specific asset. BVA-0097..0101 are unmapped optional artworks, not a user-report visual obligation.
- **CHART series:** Chart designer deliverables have source packages in the Library; **import, review and integrate**, rather than recommissioning 30 chart families. `LabTrend` remains the runtime chart and must preserve source-method/interval/correction semantics. Novel chart visuals are conditional on the underlying information actually being measured.

### Library status and neighbouring handoffs
A new consolidated **EMP-UI01–09** owner-approved directional package is in `/Bloom gut health/Agent Handoffs/`, with UI01–04 visual boards approved and UI05–09 partly specification-only. Do **not** double-commission or redraft anatomy. This is separate Exercise/Muscle/Pain scope; its visual semantics should align with the existing global token system but not expand the Bloodwork/Microbiome asset list.

## 3. UI Visual & Design Token Specification — source-grounded roles

**Current source:** `client/src/styles/bloom-visual-scoped.css` defines the premium visual roles below under the opt-in shell; `client/src/brand.css` carries existing controls, focus and 44px minimum; `client/src/visual-materials.css` already supplies restrained material depth. Use actual existing CSS variables, not a second free-standing palette. Values are SOURCE TOKENS, not newly approved changes.

| Role | Everyday Light | Everyday Dark | Athlete Light | Athlete Dark |
|---|---|---|---|---|
| Canvas `--bv-canvas` | `#F8F9F3` | `#101C17` | `#F8F9F3` | `#0F1B2E` |
| Paper `--bv-paper` | `#F5F3EB` | `#192B24` | `#F5F3EB` | `#17263E` |
| Porcelain/elevated `--bv-porcelain` | `#FFFEFA` | `#22382E` | `#FFFEFA` | `#182B45` |
| Strong ink `--bv-forest-strong` | `#102B25` | `#FFFFFF` | `#0F1B2E` | `#FFFFFF` |
| Primary ink `--bv-forest` | `#173E32` | `#EFF6EE` | `#0F1B2E` | `#F1F6FF` |
| Accent `--bv-brand` | `#246B50` | `#A6DEBA` | `hsl(var(--primary))` (app-resolved) | `#81BEFF` |
| Secondary ink | `--bv-secondary`, usually `#52685C` | `#CADACF` | verify computed cascade (light) | `#C3D4E9` |
| Quiet border | `--bv-line` | `--bv-line` | `--bv-line` | `--bv-line` |
| Focus | `--bv-focus` | `--bv-focus` | `--bv-focus` | `--bv-focus` |

**Caution:** Existing mode/theme CSS selectors and Athlete-light overrides are conditional; final results must be computed in the mounted app, not guessed from this table. Contrast pass is NOT claimed. Never use disease red/green status semantic purely from accent. Gradients and images must not obscure numerical plots or source disclosures.

### Proposed component-local values — reconcile with existing Brand/UX source

| Role | Proposed exact measurement | Notes |
|---|---|---|
| Main page heading | mobile 30px / desktop 34px; weight 600; line-height 1.16; letter spacing −0.02em | Existing editorial serif token/fallback; 1 per screen |
| Section heading | 20px / 600 / 1.25 | Named section only, avoid heading per metadata |
| Row/profile title | 18px / 600 / 1.3 | Taxonomic names may need 2+ lines |
| Source label/meta | 13px / 500 / 1.45 | Always visible when scientifically material |
| Main body/inputs | 16px / 400 / 1.5 | Existing approved sans stack |
| Small context note | 14px / 400 / 1.5 | No dense low-contrast walls |
| Major numeric result | 30px mobile / 34px desktop; 650; 1.1; tabular-nums | Unit 16–18px, date/source 13–14px adjacent |
| Category row | min 56px mobile / 60px desktop, 12px gap, 12–16px padding | Artwork/icon 32–48px; full row tappable |
| Organism row | min 64px, expands for name / status; 12px padding and 12px gap | Thumbnail 36–56px; no ellipsis of species |
| Search/inputs | 48px tall, 14px radius, 16px text, 12–16px padding | Focus 3px ring/outset per existing `brand.css` |
| Tab/segment | 44px tappable, 12px radius; selected with tonal fill + underline or indicator | Avoid only-color state |
| Filter chip | visible 34–36px, **44px effective target**, fully rounded | Selected icon/check and removable x |
| Primary CTA | min 48px, 14px radius, 16px padding | No second competing filled CTA |
| Workspace surface | 20–24px radius, 16px mobile / 20–24px desktop padding, 1px subtle border | Reuse 26–28px existing shell when already there, no nested doubled cards |
| Detail sheet | 24px exposed radius, porcelain surface, viewport-safe | Keyboard focus return, scroll within where needed |
| Section spacing | 24–32px; row spacing 8–12px | White space over repetitive dividers/borders |
| Animation | 120–180ms subtle opacity/tint where needed; none for reduced motion | No data-generated tweening |

**Responsive scope:** Default and selected plus empty/loading/error, 390×844 + 1440×900; 320/768 alternate compositions and 200% text; Everyday/Athlete × Light/Dark. No fixed 844px viewport trap. The UX's 536/576px workspace target is conceptual, not a CSS hard height.

### Per-control state matrix

| Element | Default | Hover/focus | Active/selected | Disabled/error/loading |
|---|---|---|---|---|
| Overview/Markers/Reports, Overview/Organisms/Reports | Flat clean tab row | Hover tint; focus ring 3px | Visible underline/ink and selected state, aria tab semantics | Loading preserves active page |
| Category or organism row | Plain content row + quiet divider | Soft tonal wash; keyboard ring | One selected row outline or tonal rail | Unknown source readable, not status-red |
| Search field | Porcelain 1px border | Focus 3px ring, no jump | Query/clear affordance | Retain query on error, retry |
| Chart observation | Exact runtime `LabTrend` plot | Point/focus inspection | Pinned value/date/source with outline | Missing/incompatible no misleading connected line |
| Reference interval | Source-specific verified band | Inspect original source | Selected actual interval, textual interval legend | No band where identity/method insufficient |
| Organism portrait | Existing approved image or U00 fallback | Row focus only | Enlarged image in profile | Broken image falls back to neutral, label unchanged |
| Disclosure or sheet | Hidden until selected | Hover/focus on summary | Source/report detail visible, close return focus | Errors preserve record context and inputs |
| Primary CTA | Accent filled with high-contrast text | Hover tint, 3px focus | Pressed small tonal shift | Disabled accessible; pending spinner/status; no false saved state |

## 4. Screen-by-screen visual direction and no-regression map

**Bloodwork Overview (BIO-UI01):** short latest collection label; at most two real eligible recent changes (not an algorithmic clinical risk ranking); category browser immediately visible. Category icon left, name and actual marker availability/status right, chevron. Do not stack five full bordered cards. Small material source caution remains adjacent when relevant. Artwork supports entry, never pushes it out of fold.

**Markers (BIO-UI02):** compact one-target rows; source-only unknown result selectable; mobile category → markers with Back preserving scroll; desktop category/list/detail only if actual UX Architect authorizes proposed layout. Avoid nested accordions, metadata-first columns and speculative new category groupings.

**Marker detail (BIO-UI03):** source-backed latest result + unit/date; correct method-specific trend and source band; **directly** underneath, "What is it?" and "Why does it matter?" default visible with short editorial summaries. Real source and reference comparison/details through context disclosure; no invented good/bad assessment. Chart styles should be reconciled with existing CHART-A/B sources rather than recreated as one-off ornamental plot.

**Reports (BIO-UI04/BIO-UI09):** dedicated manager using existing import/source/review/delete functions, descriptive dates and source labels; one expanded report at a time, without excessive nested chrome. Authenticated data/consent/ownership unchanged.

**Microbiome Overview (BIO-UI05):** use approved macro scene, source-labelled selected report and dominant Browse organisms action. Qualitative-only report state must not show computed abundance proportions; report switch should not briefly show prior report data. Provider assessments remain attributed and visually separate from Bloom explanations.

**Organism catalogue (BIO-UI06):** portrait (or neutral fallback) as 44–56px art anchor; exact scientific name, rank/provider label and qualifying recorded value/status. Bacteria and archaea correctly distinguished. Search/All/Bacteria/Archaea chips only for supported categories; no visual grading of organisms. "Functions" is a research lens, not a phylum/type.

**Organism profile (BIO-UI07):** portrait and name lead; source status early; short accessible introduction, reviewed "Why researchers study it", supporting research links. Source exact observation is an intentional disclosure, but **reported status is visibly distinguished from research-only content**. On mobile the first fold may require moving portrait beside name rather than large 180px art; do not hide identity.

**Functional explorer (BIO-UI08):** source-reviewed role cards/list with restrained botanical substrate accents, evidence icons from CHART-C06; never color a biological pathway as measured user flux because a microbe appears in a report. Full Explore link/source retained.

## 5. Design/asset production acceptance and ownership

**Designer outputs required, not 10 new pictures:** editable Figma or equivalent vector/component masters for BIO-UI01–10, typography/surface/style matrix, complete 4-theme states, 390/1440 first-fold layouts, 320/768/200% risk views, component spec with exact spacing/contrast/focus, asset-source manifest and readable SVG/PNG references. Deliver a before/after actual-build comparison only if code screenshot evidence exists; otherwise clearly mark designs PROPOSED, not current-app photos.

**No new permanent BVA ID assigned:** BVA-0026/0048/0049/0050 already exist and need reuse/production decision, not duplication. To commission conditional original art, verify intended UI slot, exact source rights, biology review, source hashes and delivery variants first.

**Architect:** reconcile owner R3 precedence, page/route labels and unchanged deep capability, no duplicate engine; single task queue and December deployment hold. **Codex:** source/implementation only after permitted task selection; preserve all working source management. **Biology:** lab range/organism morphology/assay/source research accuracy; **UX:** novice/expert first-action and actual viewport proof; **Security:** report ownership and caches. Do not promote status to implemented/visually verified from this document.

## 6. Shared-folder continuity and priority

This handoff covers the newest Bloodwork/Microbiome UX package in `/Bloom gut health/Agent Handoffs/`. The same folder includes `Bloom_EMP_UI01-09_Architect_Codex_Master_Handoff_2026-11-26.md` (nine owner-approved visual directions; UI01–04 boards delivered, UI05–09 some spec only) and `Bloom_Designer_Standing_Process_And_Successor_Handoff_2026-11-26.md` (responsive designs, state and source manifest requirements). They are complementary, not superseded. The separate [Exercise/Muscle/Pain Brand overlay](BLOOM_EXERCISE_MUSCLE_PAIN_BRAND_UI_TOKEN_LAYER_20261126.md) already exists in this GitHub agent folder; do not reissue or supersede it.

**Recommended visual sequence after Architect selects eligible work:** (1) BIO-UI03 marker R3 first-fold hierarchy using real `LabTrend`; (2) BIO-UI01/02 category and marker discovery; (3) BIO-UI05/06/07 report → organism → profile; (4) BIO-UI04/09 source tabs and BIO-UI08 reviewed functions; (5) four-theme real browser and accessibility QA. Commission BVA-0048/0049 only after the actual LDL education slot proves a graphic gap. **No autonomous work queue advancement or public release from this document.**
