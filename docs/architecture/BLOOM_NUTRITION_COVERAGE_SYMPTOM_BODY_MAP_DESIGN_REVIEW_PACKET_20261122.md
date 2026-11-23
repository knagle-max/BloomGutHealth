# Bloom — Nutrition Coverage & Symptom Body Map: Design Review Packet
**Date:** 2026-11-22 | **Status:** DESIGN REVIEW SPECIFICATION, NOT CODING HANDOFF OR IMPLEMENTATION PROOF  
**Repository:** `knagle-max/BloomGutHealth` · `enhance/bloom-experience`  
**Execution gate:** The GI-01–GI-10 canonical-input/scientific gap baseline and current `AGENTS.md`/`NEXT_ACTIONS.md` remain controlling. Publishing this document does **not** authorize Codex work, new app routes, production data changes, asset generation, or queue reprioritization.

## Purpose, scope and precedence
Two connected tools for Explore → Understand → Verify:
1. **Interactive Nutrition Coverage Map**: known recorded nutrient amounts, source-value availability, eating-diary reporting completeness, applicable reference comparisons, and direct evidence drilldown. No parallel nutrient registry or biological adequacy score.
2. **Interactive Symptom Body Map**: region selection, account-owned symptom entries and grouped history, front/back original 320 × 820 anatomical base, but **distinct symptom-locus overlays** rather than Athlete muscle contours. No diagnosis, inferred injury or unmeasured inflammation map.

This packet resolves the owner's updated five refinements; the JSON region/geometry design artifact is [canonical manifest](../visual-assets/BLOOM_SYMPTOM_CANONICAL_REGION_AND_GEOMETRY_DESIGN_MANIFEST_20261122.json); the **sole visual asset registry** remains [visual-asset-registry.json](../visual-assets/visual-asset-registry.json).

Review current code at execution HEAD: `shared/nutrient-coverage.ts` currently returns source-arithmetic subtotals with `adequacyAssessment:false` and separate source classes/forms; `shared/nutrient-source-snapshot.ts` v1 is USDA generic only. Do **not** claim these already compute trustworthy diary completeness or personal reference comparisons. Reuse canonical food, supplement, date, nutrient definition and private source contracts. Confirm current symptom data/episode contract *before* proposing any schema extension; `shared/experience.ts` alone does not establish a dedicated symptom episode store.

## 1. Nutrition Coverage — four orthogonal dimensions
**Source completeness**: per nutrient, food/label/source-class-applicable evaluable recorded entries and attributable sources; `full` if every evaluable entry has compatible reported amount, `partial` if some do, `insufficient` if comparison cannot be supported by actual source coverage/compatibility. Item counts are descriptive, **not percentages of consumed nutrient mass**. Do not silently count generic supplement lack-of-declaration as a missing food nutrient. Preserve unknown form/unit/source and known zero separately.

**Diary completeness**: `reported_complete` only by explicit credible user declaration or a preexisting reviewed completion contract; `reported_partial` if user reported an omitted meal/time window; otherwise `unknown`. No entries ≠ fasting ≠ zero intake ≠ confirmed symptom-free day. User-declared complete is a recorded claim, not independent proof of complete diet.

**Reference kind and applicability**: `rda`/`ai`/`custom` intake comparisons are distinct from `ul` safety boundary and `none`. Do not treat RDA, AI or UL as interchangeable; comparisons require correct age/life-stage, measurement/chemical form, basis, source scope, time basis and permission. For bioactives lacking qualified targets use `none`; quantities may still be shown if source-qualified.

**Qualified comparison**:
| State | Gate | What Bloom may say | Must not imply |
| --- | --- | --- | --- |
| `recorded_reference_met` | Known compatible amount ≥ applicable RDA/AI/custom target; source qualification supports values | “Known recorded amount reaches [specified reference].” | Nutrient status is adequate, full daily diet was captured or a clinical recommendation was made |
| `recorded_below_reference` | Known compatible amount < applicable RDA/AI/custom; sufficient meaningful source qualification | “Known recorded amount is below [reference]; partial records may omit more.” | Actual total intake below target if missing/unlogged |
| `recorded_below_ul` | All included sources/forms compatible with applicable UL; known amount below bound, with clear partial exposure limitation | “Recorded applicable amount below UL.” | Person is within safe exposure range; entire diet/supplement exposure checked |
| `recorded_above_ul` | Source-qualified applicable amount > UL | “Recorded applicable amount exceeds UL; review potential exposure concern.” | Confirmed toxicity, deficiency or diagnosis |
| `not_qualified` | Source insufficient, no applicable reference, unknown form/source basis, incompatible target or unresolved population context | “Comparison unavailable; here is what is recorded.” | False 0, fake low percentage or qualified limit assessment |

The UL branch must never use a progress-to-goal bar. Example: a UL for a supplemental magnesium source does **not** apply indiscriminately to magnesium from food; unknown origin/form must not be assumed compatible or safe. The comparison axis must NOT determine the source-coverage axis.

### Qualification nuance
A source-qualified *lower bound* that already exceeds a reference can be described as “known recorded amount reaches the reference” even if other food records have missing nutrients, provided unit, identity and source class are valid. **Never** call it total adequacy. A known amount below a reference with partial coverage is only a partial recorded amount, not evidence of actual low intake. “Full source” means complete among evaluable *logged* items, not a complete diary. A source status like `insufficient` is governed by reviewed semantic rules, not a magic 85% item-count threshold.

### Time windows
- `today`: known recorded values on the local diary calendar day; preserve timezone, event effective date and source revision.
- `7d` / `30d`: show **known recorded period total**, per-day source/diary status strip, and an **average only over explicitly qualifying days**, labeled “n qualifying of 7/30 calendar days”; never divide totals with unlogged days by 7/30 and claim average intake.
- No-entry day: show “no entries recorded / completeness unknown” unless confirmed no intake or explicitly full capture under a reviewed rule. Do not treat an empty day as zero, and do not merge a user-reported “no meal” with source database zero.
- Averages may have sampling bias; no claim of usual intake or biologic adequacy. When too few qualified days exist, withhold comparison and show raw distribution.

### UI presentation
**Explore**: grouped rows for macros/fiber, vitamins, minerals/electrolytes and separately qualified bioactives; today/7d/30d and status filters. Each row displays nutrient name, known recorded amount, one **qualified** reference state, and independent source-coverage text/icon. Non-color semantics (pattern/label). On partial/insufficient data the reference bar is suppressed or qualified based on the explicit rules; the bar denominator always names the actual reference. Use neutral palette rather than alarming red/green deficiency gauges.

**Understand**: nutrient drawer shows source-class subtotals, known amounts, unit/chemical form, applicable reference and vintage, excluded/incompatible rows, number of entries with/without reported nutrient fields, source coverage by day and diary completeness as **separate** callouts.

**Verify**: links into actual meal, ingredient, supplement/label and licensed product source records with ID/revision, original units, recorded grams/dose, source date, reported zero versus null, quality limitations, correction/removal semantics. No invented food-source nutrient values and no fabricated “unlogged dinners” absent explicit user declaration. CNF 2026 may be used only when imported/licensed and its original source identified; do not imply it is already integrated.

**Asset disposition**: no bespoke image required. Use functional accessible SVG/DOM bars, hatching, category text and status tokens in existing Bloom design system. Do not reserve a BVA ID for these ordinary functional UI primitives. Images already generated in conversation are **concepts**, not approved runtime receipt or evidence.

## 2. Symptom Body Map — semantic regions and geometry
Canonical machine-readable taxonomy and separate **null-coordinate** geometry manifest are published at:
`docs/visual-assets/BLOOM_SYMPTOM_CANONICAL_REGION_AND_GEOMETRY_DESIGN_MANIFEST_20261122.json`.

- 47 initial canonical IDs: broad body regions, laterality pairs, fine head/neck/chest and separate shin-vs-calf refinements; `upper_back` is one canonical region accessible from secondary navigation; `diffuse_non_anatomical` is a location **not a symptom type**.
- Region identity is independent of rendering view and observed symptom type. `bilateralPairId` models left/right anchors; a **single bilateral observation** may light both anchors, but retains one source observation/event. Do not count bilateral entries twice. Some symptom regions have front and back anchors; this also never duplicates observations.
- Initial silhouette tap is broad, drilling down to refined locations where useful. No attempt to fit all refined hit targets on screen at 320 SVG units; overlays can use label/list refinements and UI sheet.
- Date/time state: symptom onset/effective occurrence time vs logged time vs approximate/recalled precision and correction revision; episode identity when actually known. A repeated check-in is not automatically a new episode. Distinguish observation count, known episode count and **reported severity distribution**; never average incompatible scales.
- Symptom type remains separate: stiffness, pain, tingling, numbness, weakness, fatigue, nausea and other reports can coexist without flattening into the same lesion or marker.
- History window presets: 7d/30d/90d. Unrecorded ≠ absence of symptoms; sparse recorded observations are labeled as such.

### Default interaction
**Explore**: show front/back on same verified approved hybrid raster-body/vector coordinate system `viewBox="0 0 320 820"`. On existing region in chosen window, open **Understand** history first with prominent “Record symptom”; on no entries, open minimal **record** flow with older-history link where applicable. A diffuse/non-anatomical text pill remains outside SVG.

**Understand**: distinguish observations, identified episodes, actual recorded severity range/distribution and type breakdown; present uncertainty around absence of entries and recall dates. If record counts are known but episode grouping unavailable, display episode count **unknown**, not observation count.

**Verify**: original chronological symptom entries (exact ID, correction, source-provided event/onset versus log timestamp, type, reported scale and notes) in existing authorized account context. Appointment view: source-labeled readable export, not a physician note, diagnosis, assessment or therapeutic plan. Only actual user-recorded data appear.

### Visuals, geometry and accessibility
- BVA-0078/0079 = existing Athlete muscle coverage source IDs. BVA-0087/0088 = original symptom-only front/back hollow halo/zone anchor overlays; BVA-0089 = separate marker/interaction state kit. **Never modify frozen V10.1/V12.1 muscle shapes** to accommodate Symptoms.
- Approved body handoff reports **hybrid raster-body + vector overlay**, not a pure path silhouette; source ZIP verified in review but actual source bytes not yet present in code checkout. Designer must obtain verified source, import body PNG/SVG geometry, and **measure each anchor**. No guessed (x, y), screenshot tracing or unverified client activation.
- Use same native `0 0 320 820` viewBox and preserve original image alignment; shape/locus/target layers independent. Symptom halo = location decoration, count chip = recorded count, severity = independently labeled reported value (optional ring weight); never scale halos into pseudo-inflammation heatmaps or clinical injury.
- Visual path IDs, hit-path IDs and original-anchor manifest must map one-to-one or deliberately multiple views to stable canonical region IDs. Hit areas generous at actual rendered CSS pixels; overlapping shoulder/arm, back/flank, knee/shin targets must be disambiguated by optional refinement list.
- Front/back anatomical **left/right** must be tested against subject orientation, not “screen left”. Inactive Athlete or Symptoms layer **unmounted/inert**, not keyboard-focusable or announced to screen readers; avoid shared inline SVG `defs` ID collisions. Hover, focus-visible, selected, high contrast and reduced motion states; keyboard/voiceover and functional list alternative.
- Prefer SVG with source named layers: `symptom-zones`, `symptom-markers`, `symptom-hit-targets`; render original anatomical base once, with one active interpretation layer. Do not force diffuse symptoms onto anatomical art.

## 3. Designer delivery & QA inventory
| ID | Deliverable | Status |
| --- | --- | --- |
| BVA-0078 / BVA-0079 | Verify existing approved front/back original source; keep Athlete contours stable | Existing artwork identifiers; source integration not certified |
| BVA-0087 | 320 × 820 anterior symptom overlay with measured per-region anchors, decorative halo, distinct interactive hit paths | Briefed, artwork not generated |
| BVA-0088 | 320 × 820 posterior overlay with consistent subject laterality and front/back paired regions | Briefed, artwork not generated |
| BVA-0089 | Locus, count/recency, labeled severity, selected/focus, unknown/diffuse markers and accessible reduced-motion styles | Briefed, artwork not generated |
| Nutrition UI | Source/diary/reference tokens, category row/hatch/bar components | Functional app UI, no custom artwork/extra BVA needed |

Required designer receipts: original and export editable SVG files, verified source-coordinate manifest **with all nulls resolved only from original assets**, source provenance/rights, named element IDs, anatomy/accuracy review, front/back/mobile and desktop snapshots, hit-area noncollision checks and accessible list fallback. **Designer may not claim successful integration** based on a static mockup.

## 4. Review fixtures and acceptance (design-only; later route to existing NUT/FOOD/CAP/UX/PRIV/SCI suites)
| ID | Fixture and expected conclusion |
| --- | --- |
| NCM-01 | 14 logged foods, magnesium values in 11, unknown in three → explicit known amount + source gaps, no misleading adequacy percentage. |
| NCM-02 | All logged foods report nutrient, user did not confirm diary completeness → source full, diary unknown. |
| NCM-03 | Known recorded amount meets target with partial source → “recorded reference met, partial source”; no adequacy claim. |
| NCM-04 | Known recorded below target, diary incomplete → **cannot** call actual total intake low. |
| NCM-05 | No reference for polyphenols/resistant starch → known source-qualified quantity if available, never percent adequacy. |
| NCM-06 | UL applies only to supplemental/form-specific intake → dietary sources excluded from that boundary calculation and disclosed. |
| NCM-07 | Known qualifying amount above UL → qualified potential exposure concern, not automatic toxicity. |
| NCM-08 | Recorded below UL with incomplete/unknown source → not “safe”, uncertainty visible. |
| NCM-09 | Seven calendar days, only three user-confirmed fully logged days → any average explicitly says 3/7 and displays other days, no /7 invented zeros. |
| NCM-10 | Empty day without declaration → no entries recorded, diary unknown; explicit fast/no consumption is a distinct input. |
| NCM-11 | Different chemical forms/units and source mismatches → incompatible records not blended or treated as zero. |
| NCM-12 | Corrected/revoked/private label/food source → derived view invalidated, exact receipt links updated and cross-account access denied. |
| SYM-01 | Front/back `320x820` original source geometry; null anchors remain placeholders until verified authoring files measured. |
| SYM-02 | Left/right shoulder anchors in anterior/posterior reflect anatomical left/right; screen mirroring does not reverse data identity. |
| SYM-03 | One bilateral shoulder observation → highlights two anchors but count increases by **one**. |
| SYM-04 | Three check-ins in a known ongoing episode → 3 observations, 1 episode; unknown episode data does not invent grouping. |
| SYM-05 | 5 mild vs 1 severe record → independent count/severity display, not combined hotspot intensity. |
| SYM-06 | Multiple types at same region remain inspectable by type; diffuse fatigue never mapped to an invented body spot. |
| SYM-07 | Window with zero recorded events ≠ asserted asymptomatic; history outside active window accessible. |
| SYM-08 | Active layer alone receives pointer/keyboard/ARIA; focus and mode switch return sensibly; no SVG `defs` collision. |
| SYM-09 | At 320px and desktop, every broad tap region reachable, adjacent hit targets do not silently steal events, alternative list fully functional. |
| SYM-10 | Onset/recalled event time, logged time, revisions/authorizations survive history and appointment export; no diagnosis or generated medical summary. |

## 5. Open design decisions (do not fill by guess)
1. Actual current symptom schema: identify relevant canonical records and their episode/onset precision; decide whether new episode grouping is **necessary** versus displaying unknown.
2. Nutrient source qualification: when missing report fields prevent any target bar, and whether actual food/source types permit meaningful per-day aggregation. No arbitrary 85% threshold.
3. Verified original approved anatomy source transfer, coordinate map, raster/CSP treatment and SVG assets. Current manifest intentionally keeps all anchors null.
4. User-declared diary-complete control and 7d/30d qualifying-day policy; do not infer completeness from meal count alone.
5. Life-stage/reference selection and UL form-specific rules must come from existing reviewed authorities before surfacing personal advice.

## 6. Publication/execution disclaimer
This is a design-review packet published for Architect/Designer accessibility. It does **not** alter the single canonical visual asset registry, source truth system, product roadmap or GI-01–GI-10 priority. Approved visual registry entries BVA-0087..0089 remain `Briefed`, not generated, reviewed, integrated or validated. A future Codex implementation handoff requires current HEAD inventory, rights/clinical evidence qualification, UX review and owner authorization under the active queue.
