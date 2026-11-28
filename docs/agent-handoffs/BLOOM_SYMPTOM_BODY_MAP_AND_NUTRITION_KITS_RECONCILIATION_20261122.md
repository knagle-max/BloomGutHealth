# Bloom — Architect intake: unified symptom body map and nutrition coverage editable kit

**Date:** 2026-11-22  
**Status:** Source-verified design review; **not** integrated functionality, science approval, source rights certification or a newly selected Codex task.  
**Authority:** `AGENTS.md` / `NEXT_ACTIONS.md`; GI-01..GI-10 genuine baseline and STOP for owner review remain selected.  
**Canonical BVA IDs:** 0087 anterior symptom locations, 0088 posterior locations, 0089 marker/interaction kit, 0090 nutrition coverage UI components. No duplicate registry or new IDs.

## 1. Source receipt (current owner attachments, not in GitHub checkout)

| Source | ZIP SHA-256 / physical receipt |
| --- | --- |
| `Bloom_Unified_Symptom_Body_Map_BVA_0087_0089_Design_Handoff(2).zip` | `14ebcff60ef3900c94f12f7f0121030fa5c21b30dd869b964655f7d3feb901fa`; 2,762,664 bytes, 14 members, ZIP CRC pass. README, QA manifest, front/back provisional regions, two body PNGs, interactive demo and seven preview PNGs. |
| `BVA-0090_Nutrition_Coverage_Editable_Kit(2).zip` | `70a1067344353af386f8193783be0073b30a82b431345f338788c77ab53ef890`; 10,161 bytes, seven members, ZIP CRC pass. Five editable static SVG studies, `tokens.json`, and `BVA-0090-REGISTRY-AND-DESIGN-BRIEF.md`. |

**Source verified independently:** both symptom body raster PNG bytes match the earlier owner-approved anatomy handoff: front SHA-256 `7199ba6bb11129b7cb9826f77c61a2fc24acb935f38b50063628b5cde42feec2`, back `ab5b12c40c4e6936c50e49675c7d78d1c9e2fdf16b61318a73fae0b8e9c11338`. Exact source geometry consistency does **not** prove all provisional regions are scientifically correct or canonically aligned. No original binary asset has been uploaded to GitHub.

## 2. Document reconciliation

Existing current-branch sources examined:
- `docs/architecture/BLOOM_NUTRITION_COVERAGE_SYMPTOM_BODY_MAP_DESIGN_REVIEW_PACKET_20261122.md` — integration/domain design packet and owner Nutrition & Biology-approved-with-clarifications BVA-0090 scientific wording/acceptance addendum.
- `docs/visual-assets/BLOOM_SYMPTOM_CANONICAL_REGION_AND_GEOMETRY_DESIGN_MANIFEST_20261122.json` — 47 canonical **design review** symptom IDs, 77 unmeasured geometry bindings and explicit null anchors. **Not a runtime schema or completed coordinates.**
- `docs/visual-assets/visual-asset-registry.json` — permanent 90 IDs through BVA-0090, with 0087..0090 still briefed prior to attachment source inspection.
- Active `NEXT_ACTIONS.md` — GI-01..10 baseline only, then owner STOP.

These documents have acceptance principles rather than an eligible implementation queue. They must not be silently rewritten because a prototype has different names. In particular, the review packet's early section says nutrition UI needs no extra decorative BVA, while BVA-0090 was subsequently explicitly registered as a **functional editable UI kit**. The later registered UI-kit classification reconciles the wording: no new bespoke hero/image or duplicate nutrition engine.

## 3. BVA-0087 / 0088 / 0089: accepted as *design-prototype sources with amendments*

**Observed archive state:** front provisional JSON has **23** entries, posterior **26** entries (49 per-view hit locations). IDs are unique per view but only **41 unique across views**; eight IDs are shared for intentionally comparable locations. Demo QA manifest reports example single=1+1 markers, multi=6+6, dense=10+10 with one back badge hidden to avoid collision, and clear=0+0; the manifest states headless Chromium and keyboard / visual checks. **We inspected the manifest and source, but did not independently rerun its browser checks.** The demo is deterministic synthetic symptom/marker content and does not connect to personal symptom records, dated episodes or clinical state.

**Critical exact semantic gap:** canonical symptom-region design manifest has **47 named IDs** and **77 view bindings with null coordinates**. The prototype has 41 unique regional IDs; only **21 IDs are exact-name overlaps**. Twenty provisional unique IDs are **not** canonical IDs (e.g. `posterior_head`, `posterior_neck`, `upper_back_left/right`, `lower_back_left/right`, `upper_abdomen`, `lower_abdomen`, `pelvis`, `sacrum`, `posterior_knee_left/right`, `heel_foot_left/right`, `lower_leg_left/right`, `posterior_thigh_left/right`, `hand_left/right`). Conversely important canonical refinements such as `ankle_left/right`, `shin_left/right`, `calf_shin_left/right`, `wrist_hand_left/right`, `elbow_left/right`, `neck_lateral_left/right` and `diffuse_non_anatomical` do not have exact-name SVG keys. Some absent names may be represented by parent/broad zones; that is **not** an authorized silent alias. `diffuse_non_anatomical` must always retain the non-body text/list path.

**Specific defects/risks:** posterior region JSON lacks the explicit `side` field present in the anterior file; side may sometimes be encoded in name/label but must be normalized to subject-anatomical laterality. Some visible anchors are close to SVG boundaries; exact 320×820 bounds alone do not prove 44 CSS px effective touch targets when scaled to mobile. A densely placed badge is correctly hidden in one supplied example, but visible counts must be available via accessible list/selection, and collision detection should be tested across different real data counts and window states, not only the supplied fixtures. The prototype's broad hit regions are simple circular/elliptic or schematic path zones, and exact geometry/anatomical target validation remains open. Validate stale-source/selection reset, one bilateral event with two view markers, symptom type and dated observation/episode distinction, authorization and fallback when source/overlay missing.

**Approved design direction to preserve:** reusable two approved body PNGs as underlays; independently selectable symptom-only overlay layers and separate focus/selection; concentric marker rings for *explicitly provided* severity (1–3 / 4–6 / 7–10 on a compatible 0–10 recorded scale) versus hollow for unrated; count chip only when actual observation count is known, no count inference from severity; deterministic protected-radius badge placement with count retained accessibly if no geometry fits. No clinical heatmap, diagnosis, inflammation or anatomical disease inference.

**Required before code integration:** designer/source-owner-reviewed one-way `ProvisionalRegionId` ↔ reviewed `CanonicalSymptomRegionId` correspondence with cardinality/rationale, subject left/right, front/back and refined-area UX, a measured source-backed geometry export resolving the **canonical manifest nulls only when reviewed**, account-scoped event IDs and versions, complete VoiceOver/TalkBack and physical touch/zoom tests, separate UI layers (only active hit/ARIA tree), and symptom type/episode/missingness review. Do not alter Athlete muscle overlays BVA-0078/79 or fabricate a new symptom store. **BVA-0087/0088/0089 status: ACCEPT_WITH_AMENDMENTS / SOURCE_DELIVERED_DESIGN_PROTOTYPE_NOT_CANONICALLY_MAPPED.**

## 4. BVA-0090: editable UI kit accepted with scientific clarification gates

The package contains `component-states.svg`, `everyday-desktop.svg`, `everyday-mobile.svg`, `athlete-desktop.svg`, `athlete-mobile.svg` and palette tokens. The five SVGs are **static editable vector illustrations of UI**, not an interactive JS/React component, Figma project, browser-rendered production QA or source-linked nutrient calculation. Examples contain synthetic amounts (e.g. 18 g, 74 mg, 8 mg, 2.1 g) and % bars (e.g. 64%, 82%, 100%). **They are not verified reference targets, usual intake values or user data.**

**Accept the source-native design intent:** independent `ReportingDayStrip` versus `NutrientCoverageRow` and applicable `CoverageBar`, `SourceQualifiedRecord` for non-reference bioactives, and Explore/Understand/Verify detail. Missing, incomplete, explicitly reported zero and nutrient-source-unavailable are different semantics. Source-qualified known subtotal isn't full consumed quantity; diary completeness cannot be inferred from complete nutrient fields. No bar without valid named reference/population/unit/form/basis and qualifying denominator, no fabricated source percentage, no nutritional deficiency diagnosis, no UL as goal.

**Acceptance/quality work still required before visual lock:** line up exactly with owner-approved scientific clarification in review packet §7 (`BVA-0090-SCI-01..06`) and existing NCM-01..12/NUT/FOOD tests; verify labels on all mobile/desktop variants and statuses, noncolor accessibility, focus management for drawer, 320px and screenreader/keyboard, source-availability vs diary-completeness visual separation, lifecycle reference type (UL vs RDA/AI), all loading/error/no reference/partial cases. Distinguish design token proposal from current brand token source. **BVA-0090 status: ACCEPT_WITH_AMENDMENTS / EDITABLE_UI_SOURCE_DELIVERED_NOT_IMPLEMENTED; scientific interpretation APPROVED_WITH_CLARIFICATIONS, not end-to-end consumer validation.**

## 5. Next steps and operational gate

1. **Today only:** preserve exact ZIP SHA, source checks and per-ID design status in the existing registry; link this Architect audit. Never declare a source package absent when available as an attached original, but don't assert it exists in Codex checkout.
2. **Designer eligible later:** BVA-0087/88 canonical crosswalk and source-measured geometry; BVA-0089 accessible collision + count/severity visual states; BVA-0090 source/diary/reference/readable responsive variants and Biology signoff. No duplicate image creation or parallel nutrition/symptom engine.
3. **Codex now:** finish actual-HEAD GI-01..10 source/evidence inventory and executable synthetic baseline, then STOP for owner assessment. This document does not authorize implementation, schema/provider/production migrations, external health data, full acceptance campaign or release.
4. **When newly selected:** verify original ZIP bytes inside Codex workspace, reused current app component/source paths and runtime rights, then implement smallest independently eligible reuse seam and run matching readiness-triggered SYM-01..10, NCM-01..12, BVA-0090-SCI-01..06 and established UX/PRIV/SCI tests. Keep host/device/science/release signoffs separate from synthetic engineering receipts.

**Architect decision: ACCEPT_WITH_AMENDMENTS for all four BVA IDs.** Sources now exist as owner-supplied design work; canonical taxonomy/geometry, live logic, independent accessibility/science and source rights remain unresolved. Existing GI execution priority unchanged.
