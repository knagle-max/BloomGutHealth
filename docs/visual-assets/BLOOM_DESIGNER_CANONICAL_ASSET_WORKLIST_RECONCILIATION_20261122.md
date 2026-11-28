# Bloom — Designer production worklist, audit of canonical visual asset registry

**Architect source-document review: 2026-11-22.** Canonical machine-readable source: [visual-asset-registry.json](visual-asset-registry.json). **101 permanent BVA IDs (some multi-image/design families), not 101 new images to generate.** All 77 previously registered items were reviewed at the level of registry metadata and linked handoff documents. BVA-0078..0086 were included for discoverability without implementing or generating any assets.

**Authority:** `AGENTS.md` and `NEXT_ACTIONS.md` remain sole task selectors. Current single Codex assignment is GI-01..GI-10 baseline; no asset design, implementation, external provider, paid source or deployment is authorized by this catalog alone. This document is a designer worklist for when asset work is eligible, **not a second execution queue**.

## Required workflow per item

1. Open the canonical asset ID and its full `productionBriefV2` / `designerDeliverables`, original source package and existing component mapping. Confirm **actual checkout bytes and SHA**; registry file paths or ZIP mentions are not proof of integration.
2. Decide **reuse / approved-source transfer / conditional revision / new source required / defer** *before* generating. Check current designer/owner decisions, rights, scientific accuracy and responsive variant availability. Never regenerate already-approved source just to improve a screenshot.
3. When eligible to produce, deliver exact source-format originals (editable SVG when specified, source PNG plus optimized WebPs for photography), own licensing and source hashes, manifest, crop/contrast, light/dark/Everyday/Athlete, meaningful alt text and neutral fallback. No baked-in data/clinical values; any anatomical image needs proper human anatomy review.
4. Separate lifecycle events: brief → source delivered → design reviewed → science/rights review → integration → actual-browser QA → hosted/consumer verification. Never promote one on the strength of another.

## Audit summary

| Disposition | Count | Designer interpretation |
| --- | ---: | --- |
| A. Design / source gaps — assess or produce only if needed | 11 | Inspect exact brief and source availability, produce only when needed/eligible |
| B. Approved source replacement — transfer/integrate, DO NOT regenerate | 7 | Existing owner-approved ZIP source; transfer/import, no redesign |
| C. Delivered original source / reuse review | 2 | Source, license, reuse, QA and deployment state checks; no automatic generation |
| D. Existing reusable/prototype artwork — review, not redraw | 4 | Source, license, reuse, QA and deployment state checks; no automatic generation |
| E. Existing source slot requiring QA / rights | 5 | Source, license, reuse, QA and deployment state checks; no automatic generation |
| F. Previously integrated — reverify instead of producing again | 30 | Source, license, reuse, QA and deployment state checks; no automatic generation |
| G. Conditional species portrait requests — science/taxonomy first | 25 | Not an automatic commission, taxonomic justification required |
| H. Owner-approved anatomy visual source — integration gated | 2 | Exact 28-file hybrid raster+SVG design package verified, not imported or integrated; canonical mapping/scientific/a11y/rights gates pending |
| I. Recently received symptom and nutrition design source kits | 4 | BVA-0087..0090 present as source prototypes, not integrated/production validated |
| J. Owner-approved morphology source receipt / optional source styles | 11 | Six required style families received, five additional optional unmapped image families |
| **Total indexed** | **101** | **Not a count of missing images** |

## Per-ID designer worklist

Each row is a permanent registry requirement; the canonical JSON contains the full original prompt, restrictions, source relation and review evidence. Existing statuses remain historical claims until current checkout verification.

### A. Design / source gaps — assess or produce only if needed

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0015 | Meal suggestion photograph | Identified | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0016 | Food nutrient journal accent | Identified | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0022 | Athlete exercise technique study | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0026 | No lab records empty state | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0027 | No activity recorded state | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0028 | Source-import education | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0048 | What is LDL cholesterol? educational thumbnail | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0049 | Why does it matter? educational thumbnail | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0050 | LDL editorial arterial atmosphere | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0052 | Activity Log editorial page hero | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |
| BVA-0081 | Onboarding six goal SVG glyphs — unfulfilled separate request | Briefed | Review brief, existing assets, source/license and approved priority before creating artwork |

### B. Approved source replacement — transfer/integrate, DO NOT regenerate

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0001 | Today editorial hero | Approved | Verify source package and handoff exact approved bytes; NO redesign |
| BVA-0002 | Food editorial hero | Approved | Verify source package and handoff exact approved bytes; NO redesign |
| BVA-0003 | Biology editorial hero | Approved | Verify source package and handoff exact approved bytes; NO redesign |
| BVA-0004 | Explore editorial hero | Approved | Verify source package and handoff exact approved bytes; NO redesign |
| BVA-0005 | Athlete editorial hero | Approved | Verify source package and handoff exact approved bytes; NO redesign |
| BVA-0025 | Onboarding welcome atmosphere | Approved (design source only) | Verify source package and handoff exact approved bytes; NO redesign |
| BVA-0051 | Microbiome editorial overview hero | Approved (design source only) | Verify source package and handoff exact approved bytes; NO redesign |

### C. Delivered original source / reuse review

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0080 | Onboarding six goal photographs — approved source collection | Approved | Verify attached source package and runtime presence; do not regenerate |
| BVA-0084 | EE-03 conceptual DNA discovery SVG | Approved (design source only) | Verify attached source package and runtime presence; do not regenerate |

### D. Existing reusable/prototype artwork — review, not redraw

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0082 | Release identity visual family — REL-A01..A06 | Briefed | Reconcile design/approval and reuse real source bytes; preserve existing brand identity and UI |
| BVA-0083 | EE-01 interactive 118-element periodic table visual adaptation | Briefed | Reconcile design/approval and reuse real source bytes; preserve existing brand identity and UI |
| BVA-0085 | EE-02 Genesis-to-Hydrogen preview — source reuse | Briefed | Reconcile design/approval and reuse real source bytes; preserve existing brand identity and UI |
| BVA-0086 | EE-05 restrained existing Bloom flower mark flourish | Briefed | Reconcile design/approval and reuse real source bytes; preserve existing brand identity and UI |

### E. Existing source slot requiring QA / rights

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0006 | Progress botanical accent | Identified | Audit existing source and fallback first; create only after genuine gap is confirmed |
| BVA-0007 | Profile botanical accent | Identified | Audit existing source and fallback first; create only after genuine gap is confirmed |
| BVA-0008 | Empty Food journal | Identified | Audit existing source and fallback first; create only after genuine gap is confirmed |
| BVA-0020 | Explore pathway diagram kit | Generated | Audit existing source and fallback first; create only after genuine gap is confirmed |
| BVA-0024 | Coach editorial header | Approved | Audit existing source and fallback first; create only after genuine gap is confirmed |

### F. Previously integrated — reverify instead of producing again

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0009 | Immersive bloodwork landing hero | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0010 | Cardiovascular system thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0011 | Glycaemic system thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0012 | Liver and biliary thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0013 | Iron and blood thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0014 | Bone and micronutrient thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0017 | Microbiome editorial category backdrop | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0018 | Genetic biology editorial accent | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0019 | Explore living atlas scene | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0021 | Progress longitudinal editorial scene | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0023 | Athlete recovery editorial | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0029 | Hormones & thyroid thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0030 | Inflammation & immunity thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0031 | Other / needs identification thumbnail | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0032 | Biology overview — Bloodwork with vial (text-safe) | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0033 | Biology overview — Gut Reports (text-safe) | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0034 | Biology overview — Genetics (text-safe) | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0035 | Biology overview — Measurements (text-safe) | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0036 | Complete blood count category artwork | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0037 | Microbe morphology C01 — Cocci in chains or pairs | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0038 | Microbe morphology C02 — Round or oval cocci | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0039 | Microbe morphology C03 — Short / oval bacterial rods | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0040 | Microbe morphology C04 — Elongated bacterial rods | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0041 | Microbe morphology C05 — Branched / irregular bacterial rods | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0042 | Microbe morphology F01 — Dark yeast-like fungi | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0043 | Microbe morphology F02 — Filamentous fungi | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0044 | Microbe morphology V01 — Rigid rod-shaped plant viruses | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0045 | Microbe morphology V02 — Head-and-tail bacteriophages | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0046 | Microbe morphology V03 — Enveloped spherical virus | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |
| BVA-0047 | Microbe morphology U00 — shape-unverified neutral background | Integrated | Review current source SHA, actual rendered QA, rights and biological accuracy; no regeneration by default |

### G. Conditional species portrait requests — science/taxonomy first

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0053 | Microorganism candidate — Amedibacterium intestinale | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0054 | Microorganism candidate — Adlercreutzia sp. 8CFCBH1 | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0055 | Microorganism candidate — Dysosmobacter welbionis | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0056 | Microorganism candidate — Longibaculum sp. KGMB06250 | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0057 | Microorganism candidate — Massilistercora timonensis | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0058 | Microorganism candidate — Oscillibacter sp. PEA192 | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0059 | Microorganism candidate — Gordonibacter urolithinfaciens | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0060 | Microorganism candidate — Mogibacterium diversum | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0061 | Microorganism candidate — Ruthenibacterium lactatiformans | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0062 | Microorganism candidate — Agathobacter rectalis | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0063 | Microorganism candidate — Eubacterium rectale | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0064 | Microorganism candidate — Mediterraneibacter gnavus | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0065 | Microorganism candidate — Butyricicoccus pullicaecorum | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0066 | Microorganism candidate — Subdoligranulum variabile | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0067 | Microorganism candidate — Dorea longicatena | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0068 | Microorganism candidate — Dorea formicigenerans | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0069 | Microorganism candidate — Oscillibacter valericigenes | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0070 | Microorganism candidate — Phascolarctobacterium succinatutens | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0071 | Microorganism candidate — Phascolarctobacterium faecium | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0072 | Microorganism candidate — Dialister invisus | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0073 | Microorganism candidate — Dialister succinatiphilus | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0074 | Microorganism candidate — Sutterella stercoricanis | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0075 | Microorganism candidate — Bilophila wadsworthia | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0076 | Microorganism candidate — Gordonibacter pamelaeae | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |
| BVA-0077 | Microorganism candidate — Christensenella massiliensis | Briefed | First taxonomy/morphology/science applicability; use C01–U00 fallback unless a separate species image is justified |

### H. Owner-approved anatomy visual source — integration gated

| ID | Asset / family | Existing record | Next designer decision |
| --- | --- | --- | --- |
| BVA-0078 | Anterior anatomy overlay + raster body layer | **Owner-approved visual design** in 28-file staged ZIP; not GitHub checkout | Preserve exact `assets/bloom-neutral-front.svg` and `assets/body-front.png` with verified hashes. No redesign. Later canonical mapping, qualified anatomy, accessibility, rights, source transfer and app QA |
| BVA-0079 | Posterior anatomy overlay + raster body layer | **Owner-approved visual design** in 28-file staged ZIP; not GitHub checkout | Preserve exact `assets/bloom-neutral-back.svg` and `assets/body-back.png` with verified hashes. No redesign. Later canonical mapping, qualified anatomy, accessibility, rights, source transfer and app QA |

[Detailed review with artifact checksums, owner-approved Stages 1–3 source receipt and remaining gates](../agent-handoffs/BLOOM_ANATOMY_V3_AND_MUSCLE_MAP_PROTOTYPE_REVIEW_20261122.md). No source files are yet imported into Bloom GitHub, and the standalone React prototype is not validated application code.

### I. Recently received symptom and nutrition design source kits — integration gated

| ID | Asset / family | Current source status | Designer next action |
| --- | --- | --- | --- |
| BVA-0087 | Anterior symptom map overlay | Owner ZIP includes 23 provisional front locations, verified reused original front PNG, demo and source region JSON | Reconcile with canonical 47-region symptom design manifest; author reviewed view-specific SVG overlay with exact source-aligned anchors, anatomy laterality and accessible list/targets |
| BVA-0088 | Posterior symptom map overlay | Owner ZIP includes 26 provisional rear locations, verified reused original back PNG, demo and source region JSON | Fix missing explicit posterior `side` metadata; crosswalk provisional IDs to canonical, validate geometry, keyboard/touch targets, overlapping regions and paired views |
| BVA-0089 | Marker, halo, count and severity states | Same owner ZIP includes demo, marker behavior, QA description and seven previews; not an isolated production-ready kit | Preserve rated/unrated separation, noninferred counts and deterministic badge fallback; verify screen-reader readouts, severe+count independence, bounds/mobile collisions and focus |
| BVA-0090 | Nutrition coverage functional UI kit | Owner ZIP includes five static editable SVG studies, theme tokens and design brief; scientific interpretation approved with clarifications in review packet | Reconcile source vs diary vs reference states, qualifying day denominators and null/zero/UL rules; produce real accessible component contract only when eligible, no invented food/target amounts |

[Architect source verification and exact blockers](../agent-handoffs/BLOOM_SYMPTOM_BODY_MAP_AND_NUTRITION_KITS_RECONCILIATION_20261122.md). Source files remain owner attachments and are **not confirmed in Codex checkout**. Receipt is not production design certification, implementation or an addition to the active GI queue.


**Later V1.0 canonical reconciliation intake (2026-11-22):** [Architect review and exact ZIP receipt](../agent-handoffs/BLOOM_BVA_0087_0089_RECONCILIATION_V1_ARCHITECT_REVIEW_20261122.md). The owner-shared six-file V1 crosswalk contains 49 visual source rows, 58 **proposed/unapproved** canonical candidate edges, 10 canonical IDs lacking even a candidate, 10 pending decision-register questions and six explicitly conflicting laterality/refinement rows. The 77 canonical anchors remain unmeasured. Review the exact original at `/Bloom/Agent Handoffs/Bloom_BVA_0087_0089_Reconciliation_Architect_Codex_Handoff_v1.zip` or the identically named `/Bloom gut health/Agent Handoffs/` counterpart. This is design review evidence only, not geometry/mapping signoff or Codex authorization.

## Additional approved sources and important gaps

**Approved revisions already delivered, not yet proven installed:** BVA-0001..0005 hero replacements, BVA-0025 onboarding and BVA-0051 microbiome hero. These seven are source-transfer and responsive/integration tasks, **not generation tasks**. The approved six ONB-A01..A06 goal photographs are BVA-0080 (six separate images in one existing delivered source collection); the distinct six goal glyphs BVA-0081 remain an unfulfilled request pending audit of existing ONB-A09 icons. Do not mistake the earlier embedded demo photos for the newer approved files.

**Muscle anatomy:** BVA-0078 and 0079 now have **owner-approved Stage 1–3 consolidated visual masters** in the supplied handoff ZIP, superseding V4 as preferred artwork while preserving V3/V4/V10.1 provenance. These are **two hybrid designs**—editable front/back SVG overlay masters plus corresponding raster body PNGs—not four independent pure-vector anatomy illustrations. They are design-approved only, not imported into the application, anatomically certified or consumer-integrated. The archive is SHA-256 `a6c6485876f7c9720f3adda4ef6bf08f727fead38a88faf432ee20ea30518511`, with 28/28 manifest checks validated; its reported browser smoke tests passed 35/35 but were not independently rerun. They need stable path-to-group IDs, human anatomical verification, source/exercise-taxonomy review and accessible list fallback. Avoid fake muscle activation or recovery claims. Existing BVA-0005/0022/0023 cannot substitute for interactive anatomy. BVA-0022's earlier rejected image is **not** an approved exercise-technique photograph.

**Release and scientific Easter eggs:** BVA-0082 covers REL-A01..06 sources; BVA-0083 EE-01 table prototype; BVA-0084 EE-03 delivered DNA concept; BVA-0085 EE-02 future preview; BVA-0086 EE-05 reuse of canonical Bloom logo. Some design bundles have contradictory approval metadata for REL-A02/03/04; resolve that before asserting approved production. REL-A05 future launch 4:5 rendition is missing, but future-only. Current Genesis is not released Hydrogen. **EE-04 / ASSET-EE-08/09 are expressly deferred indefinitely: no commissions, generated images, taxon research or delivery estimates.** BVA-0053..0077 are separate pre-existing conditional species-portrait requests; scientific/morphology review determines whether any should be commissioned, and they are not a back door to EE-04.

**Canadian nutrition / restaurant / laboratory:** Their latest handoffs describe source/data/information-first workflows; this source review found no independent mandatory hero/photo requirement. Existing Food, Nutrition, Biology and accessible neutral components should be reused. Avoid inventing restaurant photography, logo rights or microscopy images to fill unspecified screens. New imagery needs a specific justified real-component gap and a permanent BVA ID only then.

**Coach:** BVA-0024 already covers the existing coach editorial identity. Do not automatically commission separate professional-portal hero media while the optional Coach workspace remains gated; inspect actual approved layouts and reuse first.

## Reconciliation corrections and actual design-delivery state — 2026-11-22

The count of **86 distinct requirements/families** and seven designer disposition groups above is confirmed, but neither a row nor a historical `Integrated` lifecycle state is evidence of a currently shipped, rendered component. **All 86 registry `integration.verified` flags remain false at this review.** The disposition totals are classification counts, not completed design counts. No full current-checkout byte or browser QA was performed.

**Explicit owner-approved source corrections:** BVA-0025 onboarding atmosphere, BVA-0051 microbiome overview hero and BVA-0084 EE-03 DNA Discovery previously had stale/noncanonical `Briefed`/`Artwork approved` lifecycle labels. Their registry lifecycle is now `Approved` *for design/source only*; their source ZIPs exist in agent Library, but no approved runtime replacement/import is established. EE-03 authoritative agent package: `/Bloom gut health/Agent Handoffs/Bloom_EE03_DNA_Discovery_Approved_2026-11-21.zip`; approval handoff: [EE-03 owner-approved delivery](EE_03_DNA_DISCOVERY_OWNER_APPROVED_DELIVERY_20261121.md). EE-03 is not equivalent to independently reviewed DNA structural geometry.

**REL-A01..A06 is a mixed-status family, not one unanimous production sign-off:** A01 v3 tile design approved; A02/A03/A04 source files exist but inner-package review/pending fields contradict the outer approved label, so formal approval precedence still needs clarification; A05 launch promo artwork owner-approved but only 16:9, 1:1, 9:16 are delivered (**requested 4:5 missing**); A06 four-theme/motion direction approved, **not accessibility/actual-browser certified**. Existing REL A05 and A06 GitHub handoffs document source locations. No Hydrogen public launch is authorized and the major-only cadence in a design draft does not override current explicitly named release-line version policy.

**Other preserved outstanding work:** BVA-0081 distinct six onboarding goal SVG glyphs, BVA-0078/0079 interactive anterior/posterior anatomically reviewed SVGs, and BVA-0052 suitable Activity Log hero. BVA-0022 previously rejected source is not approved; do not repurpose a wrong-theme microbiome image for Activity Log. ONB-A09 four delivered icons do **not** by themselves prove the separate six-goal glyph request was satisfied. BVA-0053..0077 remain science/taxonomy-conditional, and EE-04 / ASSET-EE-08/09 remain indefinitely deferred.

**Work still needed to claim production readiness:** exact Shared Library/source byte checkout with hashes, current consumer UI bindings, rights and scientific approval where applicable, desktop/mobile crop and four-theme tests, actual browser/assistive technology/200%-zoom checks, CI/hosted deployment receipts. Do not change current execution priority, production routes or runtime binaries simply because this documentation was reconciled.

## What was and was not verified

**Verified at documentation level:** every current canonical registry entry's metadata; seven newer approved hero-source handoff records; six goal-photo source collection plus separate icon request; REL-A01..06/EE-01..05 source statuses; exercise muscle-map delta and new Canadian/restaurant source directions.

**Not verified in this audit:** full `client/public` file-by-file bytes against current Git HEAD, current app visual screenshots/physical-device rendering, independent rights clearance, biological illustration review, ZIP import into Codex workspace, hosted Render deployment or consumer release. Preserve existing receipt status rather than falsely promoting any asset.

**Output expected from the designer when an asset slice is selected:** BVA ID, reuse/generation decision, source SHA and exact file paths, source design files/exports, component placement/crop, design/rights/anatomy status, accessible fallback and next open blocker. Codex integrates only with the current authorized execution queue.

### J. Owner-approved morphology source receipts — 2026-11-23

The [Architect package inspection and crosswalk](../agent-handoffs/BLOOM_MORPHOLOGY_APPROVED_ARTWORK_V2_AND_BVA_0091_0096_REVIEW_20261123.md) verified both original source ZIPs: `Bloom_BVA_0091_0096_Approved_Morphology_Artwork_v1(1).zip` (13 original PNGs + 13 portrait and 13 thumbnail WebPs, all 39 hashes/dimensions valid) and `Bloom_Bacterial_Morphology_Approved_Set_v2(1).zip` (six identical selected primaries + five truly new optional images). **18 unique originals total across both packages.** The six required style families are delivered; five additional visual families have **zero assignments in the current provisional 190-organism crosswalk**.

| Canonical BVA | Style / asset | Source state | Designer next step |
| --- | --- | --- | --- |
| BVA-0091 | C06 curved/sigmoid rods | 2 original + WebP variants delivered, owner-approved | Reuse M01/M02; primary v2 image = M02; no regeneration; Biology mapping/rights/app QA pending |
| BVA-0092 | F03 budding yeasts | 4 original + WebP variants delivered, owner-approved | Reuse Y01–Y04; primary v2 = Y04; biology/rights/app QA pending |
| BVA-0093 | A01 methanogenic archaea broad forms | 4 original + WebP variants delivered, owner-approved | Reuse A01–A04; primary v2 = A04; specialist review especially for irregular/lobed forms; no specimen claim |
| BVA-0094 | P01 vacuolated intestinal protist | Original PNG + optimized WebPs delivered, owner-approved | Reuse approved P01; Biology/source rights review before catalog identity mapping |
| BVA-0095 | P02 amoeboid intestinal protist | Original PNG + optimized WebPs delivered, owner-approved | Reuse approved P02; Biology/source rights review before catalog identity mapping |
| BVA-0096 | P03 flagellated pear-shaped intestinal protist | Original PNG + optimized WebPs delivered, owner-approved | Reuse approved P03; specialist verify flagella morphology for eventual taxa |
| BVA-0097 | C07 helical/spiral bacteria | One owner-approved original PNG in broader v2 ZIP; **zero assigned taxa** | Keep optional, don't auto-map or deploy; need approved source evidence and later optimized exports |
| BVA-0098 | C08 thin spirochetes | One owner-approved original PNG in broader v2 ZIP; **zero assigned taxa** | Keep optional, don't auto-map or deploy; overlap C06/C07 scientifically review |
| BVA-0099 | C09 segmented filamentous bacteria | One owner-approved original PNG in broader v2 ZIP; **zero assigned taxa** | Keep optional, don't auto-map or deploy; specialist morphology review |
| BVA-0100 | C10 pleomorphic bacteria | One owner-approved original PNG in broader v2 ZIP; **zero assigned taxa** | Keep optional, don't auto-map or deploy; no evidence of one species from mixed pictured forms |
| BVA-0101 | C11 fusiform/spindle-shaped bacteria | One owner-approved original PNG in broader v2 ZIP; **zero assigned taxa** | Keep optional, don't auto-map or deploy; specialist morphology review |

**Source manifest alias correction:** the broader v2 ZIP calls the last five `BVA-C07` to `BVA-C11`. Those are source aliases only, **not valid permanent numeric BVA IDs**. The registry retains C07–C11 as style identifiers and uses BVA-0097..0101 as permanent BVA IDs. **These are source-approval states, not scientific review, runtime integration or an exercise of the currently deferred EE-04.**

**2026-11-23 tracking-rule and missing-ID audit:** [Codex placeholder registration + source-backed asset-gap review](../agent-handoffs/BLOOM_ASSET_PLACEHOLDER_TRACKING_AND_REGISTRY_GAP_AUDIT_20261123.md). In future authorized UI changes, each newly necessary persistent independent artwork placeholder must be registered in the same change as a new permanent BVA or mapped to an existing BVA. Do not treat loading skeletons, standard icons, source derivatives or mere planned variants as new asset families. This targeted audit found **no independently confirmed new unregistered art family** among reviewed media slots/handoffs; it is not a full repository or running-app crawl. BVA-0081 goal glyphs and REL-A05 4:5 variant remain already-indexed outstanding requests.
