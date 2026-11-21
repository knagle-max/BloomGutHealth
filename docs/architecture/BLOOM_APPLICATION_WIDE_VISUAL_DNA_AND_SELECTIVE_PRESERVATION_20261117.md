# Bloom — Application-Wide Visual DNA & Selective Preservation

**Owner clarification:** November 17, 2026  
**Architect decision:** APPROVED — canonical cross-application visual direction and quality gate  
**Implementation owner:** Codex, under `AGENTS.md` and `NEXT_ACTIONS.md`  
**Status:** Architecture/quality requirements approved; not proof of implemented page redesigns or reference-comparison acceptance  
**Companion decisions:** [Cross-page preservation and additive assets](BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md), [adaptive mobile/desktop](BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md), [Bloodwork visual fidelity correction](BLOOM_BLOODWORK_EDITORIAL_VISUAL_FIDELITY_CORRECTION_20261116.md), [Bloodwork expanded marker details](BLOOM_BLOODWORK_MARKER_DETAIL_EDITORIAL_ARCHITECT_DECISION_20261116.md).

## Canonical owner-provided visual fixture (2026-11-17)

The exact approved LDL mockup must be available to Codex as **real image pixels**, not merely described in a handoff. Target path `docs/design-references/bloodwork/approved-ldl-editorial-reference.png`, with [reference manifest](../design-references/bloodwork/README.md). Codex must verify binary delivery before treating side-by-side visual evaluation as completed; an unavailable reference is `NOT_TESTED`, never an assumed visual PASS. Future owner-provided layout images must likewise be committed under stable `docs/design-references/<feature>/` paths (or an equivalently Codex-readable approved file location), directly linked in decisions and subjected to visual comparison. Reference images are design guidance, not copied runtime artwork.

## 1. Binding owner direction and conflict resolution

**One consistent visual language, many purpose-built experiences.** Biology, Microbiome and especially the approved LDL Bloodwork editorial reference define the premium Bloom visual DNA. The owner-supplied LDL mockup is the **quality and craft benchmark**, not the existing partially implemented Ferritin/Bloodwork screen. It is **not** a universal page blueprint. Today, Food, Activity, Explore, Progress, Athlete and future experiences should clearly belong to the same visual world while using compositions and interactions appropriate to their different jobs.

This November 17 owner directive **clarifies/supersedes the earlier broad interpretation that mobile Biology, Bloodwork and Microbiome layout composition is frozen**. Their **valuable original artwork, charts, biological visuals, source workflows and established visual identities remain protected**; their *presentation layer*—typography, hierarchy, spacing, disclosure, position, layout, responsive composition and interaction framing—**may be improved** wherever actual rendered UX falls short of the approved visual quality. Do not redesign those pages needlessly, rework correct workflows solely for novelty, or change their science. Explicit owner feedback on a specific surface still defines scope and priority. Preserve parent/category selectors when a specific handoff says so. Existing targeted Bloodwork reference-range functional fixes remain intact.

The October/November existing asset preservation rule protects **approved source media, visual semantics, component functionality and scientific logic**, not any deficient placement or green-background/card layout. **A finished illustration is not permission to leave an unfinished layout.** For other pages, Codex has substantial freedom to reorder/recompose page and interaction surfaces, but **not** to introduce a competing brand or duplicate design system.

### Decision precedence for visual work

1. Current, explicit owner reference and scope (including this global quality benchmark and narrower page-specific requirements).
2. Canonical asset, design token and semantic/source protection; applicable mode identity.
3. Reusable editorial design DNA below.
4. Purpose-specific UX, mobile/tablet/desktop input and information needs.
5. Existing code/composition as a starting implementation, **not** guaranteed visual acceptance.

Do not construe this as blanket permission for an app-wide rewrite or a new P0 project. Apply incrementally when a page is touched under `NEXT_ACTIONS.md`. No extra owner signoff gate for routine implementation; genuine image rights/scientific/legal approvals still apply.

## 2. Shared visual DNA — design-system contract

| Principle | Concrete UI standard | Failure mode |
|---|---|---|
| Editorial typography | Expressive but restrained serif/sans hierarchy; clear labels; large focal data; subordinate units/metadata; precise line lengths | Same-sized titles and metrics everywhere or oversized clinical headings |
| Botanical/scientific atmosphere | Organic warmth, measured botanical depth, accurate/carefully labelled biological imagery | Generic SaaS gradients, clipart, medical stock-dashboard look |
| Tactile materials | Intentional layered surfaces, light, contrast, depth, restrained glass-like treatment and consistent shadow/border hierarchy | Repetitive flat-bordered rectangles, uniform forest-green panels |
| Integrated imagery | Existing approved science/photo assets anchored to meaning; supportive composition and appropriate art direction/crop | Generic icon substituted for relevant art, decoration dominating core information |
| Information choreography | One clear primary task/result; concise default explanation; secondary context/disclosure and genuine deep science on request | Metadata and provider controls before results; important insight buried in scrolling |
| Spatial composition | Intentional whitespace, rhythm, visual balance, full use of canvas where appropriate | Huge blank vertical gaps or stretched mobile cards on desktop |
| Chart character | Cohesive typographic/visual frame using existing qualified plotting engines and safe range semantics | Reimplemented charts, illegible plot, fake interpolated science |
| Interaction polish | Unified control language, meaningful states, tactile but accessible feedback, focus and motion restraint | Decorative nonfunctional controls, cramped touch, hidden source details |
| Consistent modes | Everyday botanical warmth; **Athlete blue**; future **authorized Coach purple**, all sharing typography/material/component grammar | Treat mode accent as a different product/brand or overwrite its approved palette |

Design principles are **token/component-level requirements**, not invented universal pixel values. Inspect current typography, materials, CSS variables, mode theme tokens and existing editorial components before adding primitives. Preserve intentional brand distinctions and accessible contrast; don't force the LDL palette on Athlete.

## 3. Map to existing code and asset infrastructure

**Source-observed integration targets (read-only repository inspection, branch `enhance/bloom-experience`; Codex must inspect actual HEAD before editing):**
- `client/src/index.css` and existing approved global/theme/component styles: canonical colors, serif/sans, material, typography, spacing and chart primitives. Extract semantic variants only where repeated needs justify them. **Do not replace the theme with a new stylesheet or overwrite mode tokens.**
- `client/src/content/editorial-media.ts`, `client/src/content/visual-asset-ids.ts` (generated from `docs/visual-assets/visual-asset-registry.json`): canonical editorial media slots and stable IDs. Existing `lab-detail-ldl-particle` and `lab-detail-ldl-artery` are *reserved* media, not delivered licensed artwork. Do not edit generated asset IDs directly.
- `client/src/components/EditorialMedia.tsx`: approved raster/SVG/reserved media rendering and fallback semantics.
- `shared/scientific-visuals.ts` and `shared/data/scientific-visual-assets.json`: existing scientific-illustration identity and source restrictions, no competing registry.
- `client/src/components/LabExplorer.tsx`, `LabTrend.tsx`, `LabMarkerEducation.tsx`: Bloodwork category/marker navigation, canonical chart/source controls and reviewed education. Their actual composition can be refined without duplicating science.
- Existing Food, Today, Activity, Progress, Microbiome and Athlete components: inspect one view at a time, identify reusable visual grammar and user journey, preserve its API/data/permissions.

**Reusable visual standards should be recorded as existing-design-system variants** where needed: e.g. editorial page header, focal result/primary action, meaningful media companion, source-aware chart frame, contextual rail, concise interpretation, progressive source/advanced controls and an adaptive feature layout. These are roles/patterns, not one required card or JSX structure.

### Additive asset rule

Reuse completed reviewed artwork and original registry paths/checksums by default. Never regenerate, overwrite, rename, reimport or substitute meaningful existing art to mimic a reference. If new **major/signature** art would materially help an otherwise incomplete composition, add a truthful *requested/reserved* media slot to the appropriate existing canonical registry (subject, role, aspect, rights/review, responsive use, accessible fallback) without fabricating source file bytes, SHA or delivery. Codex may create small contextual icons or restrained, semantically correct vector/CSS motifs when no suitable existing small asset serves the purpose; register standalone media where applicable. Scientific concepts require reviewed identity and disclaimers where necessary; no made-up clinical illustration.

## 4. Distinct experiences within the same family

| Page | Purpose-specific composition; visual DNA applied without copying LDL |
|---|---|
| Today | One meaningful action in a beautiful but practical focal scene; subordinate Eat/Move/Recover or evidence context, not a wall of metric cards |
| Food | Tactile food/editorial imagery, fast meal task, portion and nutrient context, authentic review/save, source transparency reachable not overwhelming |
| Activity | Quick completion/recording interface, concise history and meaningful motion context; no Athlete complexity forced on ordinary activity |
| Bloodwork | Existing parent navigation preserved where scoped; premium result + truthful existing chart, visible What/Why education, contextual sourced interpretation; admin disclosed |
| Biology | Organism/marker/pathway visual exploration with contextual science and purposeful hierarchy, not a clinical spreadsheet |
| Microbiome | Approved organism artwork and taxonomy remain; approachable summaries, meaningful organism browsing/profiles and source-conscious functions |
| Explore | Discoverable biological atlas/relationship experience, substantial visual focus plus evidence/detail exploration |
| Progress | Beautiful, legible, trustworthy source-faithful trends, comparison and milestone context; appropriate telemetry without false inference |
| Athlete | High-clarity training/fueling/recovery telemetry within approved blue mode and the same editorial material/typographic system |
| Coach (future authorized) | Role-aware workspace with approved purple identity, deliberate participant/context layering and canonical authorization |

**Avoid identical page composition.** An LDL-style single marker result belongs in Bloodwork; a meal editor or biological network may use a very different compositional grammar.

## 5. Mobile, tablet and desktop: purpose-built rather than cloned

Follow [adaptive mobile/desktop architecture](BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md). Use shared science, assets, tokens and state; separate complex responsive compositions only when needed. Phone-driven existing layouts are valuable **starting baselines**, not inviolable when the owner explicitly identifies poor visual execution. At 320/390 provide touch-first focus, coherent typography and no excessive admin burden; tablet 768 deliberately blends browsing/detail; desktop 1024/1440 uses meaningful two-column, contextual and large-science/chart space where useful. Never create separate mobile/desktop backend or cloned feature logic.

Preserve accessible source data and actions, zoom, keyboard, reduced motion, low-transparency/high-contrast, long/localized content and theme modes. Changes should never create duplicate data submission, lose a selected marker or alter chart math.

## 6. Two independent visual acceptance gates (mandatory for meaningful redesign)

**A. Brand coherence:** Does the rendered page genuinely belong to Bloom's approved Biology/Microbiome/Bloodwork/LDL visual universe? Assess editorial typography, tactile layers, botanical/scientific visual art, hierarchy, imagery integration, mode colors and quality. A green generic SaaS card layout fails.

**B. Experience quality:** Does the page's particular purpose receive an excellent mobile and desktop interaction and spatial composition? Assess primary task, density, chart/visual legibility, meaningful desktop use of space, scrolling/disclosure, tablet intent, touch/keyboard and accessibility. A visual clone of the LDL page on Food also fails.

A ≠ B; **both independently pass** in the visual review. Separately verify:
- **Functionality:** existing workflows, correction/selection, source links, loading, retries and event semantics remain correct.
- **Scientific truth:** measured/estimated/unknown, source provenance, comparability, reference applicability and approved claims remain accurate.
- **Asset preservation:** original IDs/bytes and licensed use unchanged unless expressly authorized; fallback and added media truthfully recorded.
- **Privacy/security:** account/purpose isolation, consent, original source data integrity and stale derived results.
- **Accessibility:** mobile/touch, keyboard, 200% zoom, color/contrast, screen reader and reduced motion.

**Evidence:** For significant redesign, compare *actual rendered screenshots* against owner-approved references (LDL for design DNA and page-specific reference where supplied). Capture 320, 390, 768, 1024, 1440 CSS px; both themes/mode variants as relevant, with representative data/loading/empty/error. Record real tested SHA, source asset manifest diff, functional/scientific/security test receipts, and a visual review noting specific discrepancies. Use `PASS / FAIL / NOT_TESTED` for brand and experience **separately**. Functional automated tests or CSS selector presence do not prove visual fidelity. Do not falsely claim exact visual equivalence if reference images aren't available to the QA runner; explicitly record comparison unavailable and use the written standard until references are accessible. No invented visual similarity score.

## 7. Delivery integration and status

This is a **standing design-quality standard applied incrementally to already approved v0.6 and later pages**. The approved LDL reference sets the polish level while letting each feature have its own layout. Current `NEXT_ACTIONS.md` remains the only engineering selector; maintain active source/critical Bloodwork work and Core Food #12/Response #15 priorities. When Codex touches a page, assess it against the two visual gates and incorporate bounded redesign as part of that work. No automatic app-wide rewrite or new visualization platform.

**Current status:** requirements approved, relevant existing source infrastructure located; page-by-page rendered reference comparison, implementation and independent visual acceptance **not established by this documentation**.
