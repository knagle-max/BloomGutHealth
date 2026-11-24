# BLOOM — CHIEF ARCHITECT HANDOFF
## Premium Visual System Production Packages BVA-0091–BVA-0095 and Anatomical Reconciliation BVA-0087–BVA-0089

**Date:** 2026-11-23  
**Recipient:** Chief Architect & Integration Lead  
**Origin:** Product Owner / Branding & UX design direction, consolidated from owner-supplied specifications  
**Status:** **PROPOSED FOR ARCHITECT RECONCILIATION — NOT REGISTERED, NOT IMPLEMENTED, NOT A RELEASE APPROVAL**  
**Repository:** `knagle-max/BloomGutHealth`  
**Reference baseline supplied by owner:** `f7a36542b4d0faf6a8da93f6dbd3b521debb9901`  
**Suggested publication location:** design documentation only; no modifications to Codex's active task queue or existing BVA/GI entries.

---

## 1. Decision requested / executive direction

Reconcile and, after source-verified ID allocation, register **five parent design-production packages** BVA-0091 through BVA-0095. These formalize a calm, credible, premium, editorial visual system with high information clarity and scientific honesty. They are **reusable presentation contracts**, not a directive to generate large quantities of decorative images, rebuild data engines, or redesign working application flows.

The guiding interaction hierarchy is **Explore → Understand → Verify**: display the useful observation or action first, explain relevance second, and allow deliberate source/assumption verification third. Do not use it to imply that an unknown or merely inferred finding has been verified.

**Architect is requested to:** (1) locate and verify the authoritative BVA design asset registry and relevant worklist at the specified baseline and current head; (2) confirm or allocate the proposed IDs without collision; (3) deduplicate requirements and reuse existing R4/M1/scientific artwork; (4) record owners, interfaces, prerequisites, phases and acceptance; (5) commission child designs only after a concrete screen-level source/runtime need is demonstrated; and (6) separately commission a verified BVA-0087–0089 anatomical crosswalk.

**No change authorized here:** GI-01–GI-10 execution priorities, Codex's live execution queue, published biological/clinical rules, database schemas, patient observations, existing BVA-0087–0090 review posture, asset rights or production activation. No owner approval of paid acquisition is implied.

## 2. Evidence and verification posture (do not overclaim)

### Reviewed repo evidence

- `design/bloom/asset-manifest.json`: historical design source manifest (196 listed source files including 124 SVG, 10 PNG and supporting documents/code; **not** 196 individually required runtime illustrations).
- `shared/data/scientific-visual-assets.json`: scientific registry `scientific-visuals-2026-11-05.5` with 20 organism entries (portrait + thumbnail each), 10 bloodwork category drawings, 14 molecular structures, 16 pathway drawings and one separate generic symbol.
- `docs/verification/R4_UI_INTEGRATION_20261108.md`: historical engineering report of R4 CSS, 87 SVG assets, 13 PNG files and 26 WebP variants and seven-view integration. This is not independent final visual/physical-device approval.
- `docs/verification/R4_M1_IMPLEMENTATION_20261108.md`: historical media and interaction integration report, including responsive matrices and live-source constraints. The document records a separate 32-image anatomy branch not merged at its review time.
- `design/bloom/VERIFICATION.md` and `docs/operations/ASSET_RUNTIME_AUDIT.md`: source-vs-runtime inventory and limits; do not confuse asset presence with user-visible acceptance.
- `docs/architecture/PREMIUM_R4_M1_MOBILE_MEDIA_BUILD_CONTRACT.md`: source-of-truth constraints for mobile and desktop as co-equal deliverables, visual correctness, contrast, state semantics and approved art placements.

### Verification performed / unresolved

- The supplied reference commit was accepted by GitHub's comparison endpoint. At the time checked, `enhance/bloom-experience` was reported **12 commits ahead** of that baseline, with no commits behind. This is a point-in-time comparison, not a fixed guarantee about subsequent changes.
- GitHub default-branch indexed code search did **not** return BVA-0087, BVA-0091 or BVA-0095. **Absence from a code search does not prove ID availability** across all branches, an external registry or the authoritative asset ledger.
- The owner references **49 prototype paths, 41 provisional region IDs, 47 canonical regions and 320×820 reference figures**. Their primary mapping files were **not directly inspected** for this handoff. Treat all four numbers as owner-supplied reconciliation targets pending source verification, not independently certified counts or mappings.
- Existing reports identify 32 anatomical PNGs on a separate design branch. Confirm exact bytes and relevance before commissioning replacement anatomy.
- This handoff records requirements and sources; **no current deployed app screenshots were independently audited** in its preparation.

### Source precedence

1. Most recent explicit Product Owner constraints and current architecture decisions.
2. Authoritative design asset registry and canonical anatomical schema after retrieval and version pinning.
3. Original R4/M1 designer sources, manifests and exact asset binaries.
4. Current deployed application data contracts and visible UI at an immutable SHA.
5. Historical handoffs as explanatory context, not automatic evidence of unresolved defects.

Any disagreement must be recorded as a decision, not guessed away or resolved by adding a duplicate source of truth.

---

## 3. Governance and registration protocol

**Proposed IDs:** BVA-0091, BVA-0092, BVA-0093, BVA-0094, BVA-0095. These are **reservation candidates only** until the Architect verifies both the authoritative registry at the cited baseline and the latest actual branch/worklist. If occupied, preserve every original ID and allocate the next collision-free identifiers with a cross-reference back to this handoff. Do not overwrite records.

**Parent-first:** register only five parent packages after approval. Child entries require: (a) named live route/viewport/state; (b) current screenshot at immutable app SHA; (c) existing SVG/R4/M1/anatomy design-asset search; (d) a particular user-comprehension/hierarchy problem; (e) editable source deliverable and intended runtime component/slot; (f) scientific and provenance restrictions; (g) build/device acceptance method. Speculative illustrations do not enter production merely to achieve a quota.

**No parallel registry:** reuse the existing canonical asset inventory and evidence/entity systems; attach supplemental crosswalk metadata rather than create an independent artwork truth database. Proposed parent records may link out to documented implementation contracts where the current registry cannot store them.

**Status model:** `PROPOSED → ID_VERIFIED → ARCHITECT_RECONCILED → CHILD_SCOPE_AUTHORIZED → SOURCE_DELIVERED → IMPLEMENTED → ENGINEERING_TESTED → INDEPENDENT_DESIGN_REVIEW → ACCEPTED` (with `DEFERRED`, `SUPERSEDED` or `WITHDRAWN` where applicable). Do not use asset file presence, CI pass or a source mockup as shorthand for visual acceptance.

**Ownership:** Branding & UX = visual system, source drawings, content hierarchy and design fidelity. Chief Architect = source-of-truth reconciliation, deduplication, sequencing and contract decisions. Codex/Developer = implementation, integration, QA and code/deployment evidence. Biology/Chemistry = scientific/anatomical/chemical content where relevant. Security/Legal = only their actual domain gates. User Testing = comprehension/accessibility acceptance. None may imply another team's review was completed.

**Non-blocking execution:** BVA-0087–0090 retain their own gates. GI-01–GI-10 and the current Codex queue are **not re-sequenced or paused** by this documentation. Approved core experience changes and real safety/data defects continue normally. No paid assets, licensed art or external-review services without separate owner authorization.

---

## 4. Parent production specifications

### BVA-0091 — Unified Data Visualization Kit

- **Priority:** P0 for design-production planning; not automatically a new application release blocker.
- **Purpose:** one high-craft information-visualization grammar across nutrition coverage, laboratories, biological observations, movement, goals, bounded comparisons and future timelines.
- **Build on:** BVA-0089's owner-described bounded concentric-ring/marker/badge grammar and BVA-0090's owner-described nutrient availability vs reporting-completeness and provenance distinctions. Verify their exact original contracts before copying components.
- **Deliverables:** tokenized chart grammar; reusable labels/units/legends; markers and ring conventions; time-window and sample-size qualifiers; benchmark/reference treatments; unknown/zero/estimated/imported signifiers; responsive patterns and source drill-down affordances. Allow existing chart libraries as rendering infrastructure so long as resulting UI follows the custom Bloom system.
- **Boundaries:** no invented composite health/readiness/longevity scores; no client-side nutritional, medical or biomarker computation hidden inside vector assets; no apparent intake target or %DV for compounds without an applicable validated reference; no causal inference from visual comparison; no decorative animation that obstructs data.
- **Acceptance:** actual named screens crosswalk to underlying measured/entered/imported/modelled/reference/unknown contracts; state meanings available without color alone; date range, units, source and denominator visible or easily disclosed; 320/390/768/1440 CSS px, light/dark, Everyday/Athlete as applicable, 200% zoom, keyboard/VoiceOver/focus and forced-color checks; no clipped label/legend or false precision. Charts must remain understandable when data is missing, sparse, incompatible or withdrawn.
- **Child gate:** demonstrate source/runtime gap before drawing each chart family. No blanket mandate to replace working R4 charts.

### BVA-0092 — Editorial State Kit

- **Priority:** P0 design-production.
- **Purpose:** stable calm UI in non-ideal conditions: `first-use empty`, `recorded zero`, `partial`, `loading`, `stale`, `unavailable`, `error`, `retry`, `unconfirmed save`, `confirmed save`, `permission revoked`, and `source incompatible` where real.
- **Deliverables:** content-aware skeletons matching actual NutrientCoverageRow, ReportingDayStrip and 320×820 figure container if those exact components exist at the current head; quiet typographic states; optional small monochrome/stipple SVG spot art where source-tested need exists; copy/state guidance and accessibility status text.
- **Boundaries:** no default cartoon/celebration/harsh error wall; no interpreting absence of logged observations as observed zero; no source failure masquerading as genuinely empty; no unconfirmed persistence success; no illustration where text/spacing alone is clearer.
- **Acceptance:** skeletons are tied to current container dimensions and semantic focus/reading order; screen reader announces meaningful state transition without duplicate noisy alerts; rehydration and retry do not unexpectedly displace an action; measure Cumulative Layout Shift with **target CLS ≤0.1** under defined controlled loading cases, excluding documented user-initiated expansions and only as one measure of layout stability. Test 320/390/768/1440, 200% text zoom, all supported themes, slow/failed response, reduced motion and focus retention. Document measured CLS/method and exceptions rather than claim literal zero shift.
- **Child gate:** list each concrete route, data source and non-happy-path state, then reuse existing art or produce a bounded spot treatment.

### BVA-0093 — Micro-Iconography Kit

- **Priority:** P1.
- **Purpose:** coherent, optical stroke-matched dense UI vocabulary at nominal 16, 20 and 24px.
- **Deliverables:** use map and unique glyphs only where unmet: epistemic Explore/Understand/Verify cues; imported/recorded/estimated/unknown/explicit-zero/source-under-review statuses; food, symptoms, supplementation, sleep, exercise, labs; anatomical front/back/lateral orientation; event-type markers. Include icon construction grid, stroke/corner/rasterization rules and accessible-label semantics.
- **Dependencies:** compare the existing R4 87-SVG pack, navigation symbols, current category icons, M1 artwork, and anatomical controls; do not redraw satisfactory glyphs merely for a new kit.
- **Boundaries:** visual verified-check symbol must not imply scientific or clinical validation of the data if it only denotes successful import; no color-only encoding; no replacement of working accessible compact nav icons by default; do not generate oversized feature tiles without screen need.
- **Acceptance:** optical balance at 16/20/24px, contrast/tap target through containing control, actual list/table/timeline context, 320 and 1440 plus intermediate breakpoints, 200% zoom, all supported themes, VoiceOver label or `aria-hidden` where adjacent text conveys the meaning. Record an icon-to-component reuse/need crosswalk.

### BVA-0094 — Biological Event Timeline Kit

- **Priority:** P1, feature-dependent; visual contract not a new biological-events datastore.
- **Purpose:** shared, exploratory multi-lane interface for meals, symptoms, activity, supplements, sleep and dated biomarkers, without false continuity or causal suggestion.
- **Deliverables:** lane spacing, point-event and duration-span graphics, exact vs approximate event time, observation time vs entry time, source badges, overlapping event treatment, filtering, unrecorded intervals, sampled-vs-unsampled evidence, keyboard and screen-reader sequential text equivalent, explicit event selection and detail affordances.
- **Dependencies:** BVA-0091 chart/state grammar, BVA-0092 missing/partial handling and BVA-0093 glyphs. Bridge anatomical symptom events only through source-verified BVA-0087–0089 canonical mappings.
- **Boundaries:** timestamp adjacency does not mean causation; no calculated correlation/confidence/readiness metric in art; no inventing event durations; blank interval does not mean symptom-free; no storing/converting timestamps or creating new event business rules in SVG/CSS.
- **Acceptance:** render exact/approximate/window/entered-at time distinctions with textual labels; keyboard lane navigation and time-ordered accessible alternative; no overlap in 320px scrolling/zoomed inspection, 1440px overview and 200% zoom; preserves local time-zone/precision from canonical source; filter semantics do not hide missingness; synthetic scenarios test overlapping episodes, missing days, contradictory time metadata, retracted/edited source and events sharing canonical regions.
- **Child gate:** verify actual Timeline surface exists or is an approved in-scope feature. If not, retain as an architecture-ready design package without creating speculative production assets.

### BVA-0095 — Typography, Surface & Onboarding Kit

- **Priority:** P1.
- **Purpose:** lock typography, data alignment, surface elevation and first-run expectations into one restrained premium visual foundation.
- **Internal sequence:** **Phase A** typography/surface/app-shell tokens first, **Phase B** concise onboarding compositions second. These are coordinated parts of one parent but independently accepted deliverables.
- **Deliverables A:** tabular numeral treatment for values/rates/counts and 0–10 reports; units/numbers kept together; denominator/date/precision display; line-height/wrapping and long-label rules; neutral borders, matte surfaces, shallow elevation, focus rings, Everyday/Athlete light/dark palettes and existing icon/wordmark/app-shell alignment.
- **Deliverables B:** approximately 2–3 demand-justified conceptual explanations and a short first-use flow explaining records, unknowns, source references and Explore → Understand → Verify. Reuse existing R4/M1 botanical imagery and existing logo/app icon/wordmarks unless specific defects are reproduced.
- **Boundaries:** no streak flames, confetti, game rewards, glowing organ effects, universal artificial 'health score', or art on every section. No entire new UI theme or duplicate token system. No claims that external research has personally verified a user's result.
- **Acceptance:** tabular numeric alignment when values change, label-unit no-wrap where feasible, compositional hierarchy and accessible keyboard/screen-reader headings; 320/390/768/1440, light/dark and Athlete variants, 200% zoom, long locale/units and reduced-motion. Onboarding remains usable if skipped and does not obscure the real privacy/source status. Final Phase B cannot settle on styles that contradict incomplete Phase A tokens.

### Bounded future considerations (not registered children)

- Large feature/category tiles: only with evidenced per-screen gap, not a speculative 8–12-item quota.
- Biology explainers: only after verifying the existing 16 pathway assets, 14 structures and 32-image anatomy branch; per-study evidence and model limits remain explicit.
- Exercise movement illustrations: **P2**, selective initial coverage only after actual Athlete screen need and source/library audit; no blanket 100+-exercise collection.
- Motion treatments: only for useful feedback, subdued and optional with `prefers-reduced-motion` alternative; may be satisfied by component behavior rather than new asset files.

---

## 5. BVA-0087–BVA-0089 anatomical reconciliation bridge (separate workstream)

### Scope and prohibitions

The owner-described baseline consists of **49 vector paths, 41 provisional IDs, 47 canonical anatomical region IDs, and 320×820 source figures**. The Architect must **retrieve the actual authoritative prototype files and canonical 47-region schema before calculating or asserting mappings**. Preserve original design geometry and side/view meaning. Do not resolve by name-similarity alone and do not change existing patient/source observations as part of visual mapping.

**No mapping assertion is made in this document.** Do not infer that 49 − 41 = 8 duplicates or that all 47 canonical regions must have a graphical path: distinct paths may share IDs, some regions may need several paths, and some source labels may be semantically unmatched.

### Mandatory row schema

| Field | Allowed/required content |
|---|---|
| `prototype_path_id` | Stable exact SVG path or shape identifier; no generated replacement ID in place of original |
| `prototype_source_sha` | Original SVG/figure source fingerprint/immutable ref |
| `provisional_region_id` | Original 41-ID labeling or null if none |
| `canonical_region_id` | Exact 47-schema ID or null and explicit reason |
| `parent_region_id` | Canonical parent or null; do not derive hierarchy from visual containment alone |
| `relationship` | `exact`, `broader_parent`, `narrower_child`, `overlapping`, `unresolved` |
| `mapping_type` | `exact`, `merged`, `split`, `unresolved` (allow separate mapping records for many-to-many) |
| `view` | `front`, `back`, `lateral` with exact left/right/unknown laterality |
| `geometry_ref` | 320×820 base figure name, path and bounds/viewBox, not rescaled replacement coordinates |
| `interaction` | Tap/click, keyboard focus/select, hover indication, accessible name, fallback and badge position |
| `confidence` | `verified` or `requires_reconciliation`, including anatomical reviewer citation |
| `resolution` | `reuse`, `remap`, `revise`, `exclude`; explicit rationale |
| `observation_dedupe_key` | Canonical observed-event identity; multiple paths must not create repeated observation counts |
| `review` | Reviewer, evidence, SHA and date; `NOT_RUN` until performed |

Maintain a separate path-to-region bridge table (potentially one-to-many) while **only one canonical observation identity** remains in the underlying health data. Geometric selection can map multiple polygons to the same region. Conversely a path spanning more than one canonical region must not silently duplicate or over-allocate a symptom; declare manual disambiguation or neutral unresolved treatment. Include left/right and view mismatches as explicit exceptions.

### Reconciliation execution

1. Retrieve and pin all original BVA-0087–0089 source drawings, prototype path IDs, figure dimensions, original provisionals and canonical 47-region schema.
2. Count independently: total paths, unique provisional IDs, exact canonical IDs, side/view distributions, unmatched labels, multiply mapped regions, orphan canonical regions. Record SHA and source paths.
3. Populate one row per path-to-target relationship, including explicit unresolved rows. Never overwrite a provisional string with a guessed canonical ID.
4. Record duplicate path groups, parent/child relationships, lateral orientation and counts. Test geometry overlay without resizing base 320×820 figures or disturbing BVA-0089 ring/marker placements.
5. Verify event selection, visual highlight/focus, non-overlapping badges, text-only fallbacks, account observation identity and zero duplicate counts across paths/views.
6. Obtain independent anatomy/UX review when required. Deliver the editable crosswalk + exception log + exact-source test evidence to Architect; Codex implements only reconciled scope when appropriately queued.

### Acceptance scenarios

- Same canonical region selectable through multiple path fragments remains **one** observation target.
- A split/multi-region path does not replicate observations or assume which region applies without unambiguous source evidence.
- Front/back/lateral and left/right are honored; ambiguous laterality is displayed honestly.
- Unknown/unmapped path remains accessible using a neutral treatment; no silently fabricated clinical region.
- Hover/focus/readability and ring/marker behavior survive at 320px, 1440px, 200% zoom, light/dark, keyboard and screen reader, with a text alternative for interactive shapes.
- Original SVG/PNG hashes and 320×820 geometry remain unchanged unless a subsequent explicitly versioned asset revision is approved.

---

## 6. Crosswalk and nonduplication audit

Before authorizing child assets, compare these actual source families: R4 87-SVG master; M1 13 PNG/26 WebP derivative register; prior 13 public brand files and existing empty-journal asset; 20 organism portrait/thumb pairs; 10 bloodwork category scientific icons and separately delivered raster candidates; 14 molecular drawings; 16 pathway drawings; 32 anatomy PNGs on the separate design branch; current Today/Food/Progress/Explore/Gut/Athlete/Profile components and CSS tokens.

For each proposed child asset capture `parent_id`, `reuse_candidate_id`, `source_path`, `source_sha`, `app_route`, `component`, `screen_state`, `viewport`, `issue_evidence`, `design_deliverable`, `required_review`, `implementation_status`, `acceptance_evidence`, and `decision` (`reuse`/`revise`/`new`/`defer`). No production quota turns optional assets into mandatory ones.

### Minimum visual and interaction evidence

- Identical/specified fixture data, before/after if the surface materially changes, immutable app commit.
- 320, 390, 768, 1440px across supported light/dark Everyday/Athlete states; 200% text zoom.
- Normal, empty, partial, loading, error, offline/stale and revoked where the actual screen supports them.
- Accessible names/alt, focus and tab order, 44px control targets, forced color and prefers-reduced-motion.
- Scientific provenance and uncertainty in text, not color alone; state-specific QA for missing vs zero vs calculated/estimated/imported.
- File hashes and exact bundle/public mapping; rights/licensing and source-owner verification separate from visual acceptance.

---

## 7. Architect decision log / required disposition

| Decision | Requested result | Current disposition |
|---|---|---|
| D1 Registry identity | Locate authoritative BVA registry; check baseline **and** current head, including non-default/design branches; allocate IDs collision-free | `OPEN — SOURCE_NOT_VERIFIED` |
| D2 Package deduplication | Map each BVA-0091–0095 proposal to existing R4/M1/BVA records; designate reuse/new/defer | `OPEN` |
| D3 Priority | Accept P0 design production for 0091/0092 and P1 for 0093–0095, without GI queue interruption | `PROPOSED` |
| D4 Reconciliation | Obtain 49-path, 41-provisional and 47-canonical original sources; publish exact row-by-row crosswalk | `OPEN — PRIMARY_SOURCES_NEEDED` |
| D5 Review gates | Specify Design/Biology/Legal/Security/UT involvement per exact asset, no fictional blanket approval | `OPEN` |
| D6 Child authorization | Require screen-specific source/runtime evidence and a nonduplicative need | `PROPOSED` |
| D7 Handoff to Codex | After reconciliation, supply implementable contracts in already scheduled relevant feature slices; no new global hold | `PROPOSED` |

**Required outcome:** one accepted registry entry per authorized parent; row-level links to existing assets and gaps; a separate canonical anatomy crosswalk and exception register; no asset-generation work based solely on desired file counts. Do not report ID verification or architecture approval until D1/D2 are actually completed.

---

## 8. References and provenance

GitHub repository paths (review in pinned/current branches before execution):

- `design/bloom/asset-manifest.json`
- `shared/data/scientific-visual-assets.json`
- `design/bloom/VERIFICATION.md`
- `docs/operations/ASSET_RUNTIME_AUDIT.md`
- `docs/verification/R4_UI_INTEGRATION_20261108.md`
- `docs/verification/R4_M1_IMPLEMENTATION_20261108.md`
- `docs/architecture/PREMIUM_R4_M1_MOBILE_MEDIA_BUILD_CONTRACT.md`
- `docs/architecture/V06_HANDOFF.md`
- `docs/operations/V06_DEPENDENCY_BACKLOG.md`
- `NEXT_ACTIONS.md` (read for constraints; do **not** modify under this handoff)

Owner-provided conversation requirements (not external-source verification): BVA-0087–0090 visual grammar; GI-01–GI-10 execution precedence; the 49/41/47 anatomical counts and 320×820 figure size; Explore → Understand → Verify direction; BVA-0091–0095 draft specification; CLS target refinement.

### Final instruction

**Architect: reconcile, register and crosswalk; do not redefine working biology, interrupt active engineering, authorize speculative art in bulk, or present unverified source mappings as complete.** After accurate source verification, return collision-free IDs, the accepted parent registry entries, and the exact anatomical mapping exceptions for downstream Design/Codex work.