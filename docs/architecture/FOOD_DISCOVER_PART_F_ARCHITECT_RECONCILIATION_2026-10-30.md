# Bloom — Architect reconciliation: Food Discover / Part F
Date: 2026-10-30 | Decision: CONDITIONALLY APPROVED, AFTER core Food usability; specification only, not implemented or scientifically released.

## Sources reviewed
- `Bloom_User_Testing_Part_F_Positive_Discovery_Engagement_2026-10-30.md`, UT-DISC-3601–3607.
- `Bloom_Biology_Food_Discovery_Part_F_Review_2026-10-30.md`, BIO-DISC-3701–3707.
- Branding original GitHub design branch `design/biology-visuals-2026-10-30`, `design/bloom/food-discovery/v1/DEVELOPER_PICKUP.md`, v1 React/CSS references, v1 4 garden SVG stages and 12 food icon SVGs; v2 `README.md` and `ASSET_MANIFEST.json`.
- v2 `Bloom_Food_Discovery_Production_Assets_v2.zip` is present in shared Bloom Library, but the design GitHub branch **does not contain its image bytes**. Manifest says `image_files_packaged_locally_not_uploaded_to_git`. Do not claim image import/visual QA or wire unverified asset paths.
- Superseding cross-cutting intent: Bloom research-informed personal wellness, not disease direction; existing Feature Preservation Gate and Food → Today priority.

## Approved product shape and precise boundaries
One optional **Food Discover / Explore** area, not five Today cards, mandatory goals, or a new gamification system. Scientific context and credible positive exploration, no shame or health grades. Existing Food journal and source/ingredient data remain canonical; no new nutrient/import/food-science processing pipeline just for this experience. Works without uploaded omics, AI, wearables or devices. No automatic food purchase, compulsory weekly streak or aggressive push notifications.

- **UT-DISC-3601 P1** weekly distinct **verified culinary plant-food identity** count over an explicitly specified calendar/rolling week, user's timezone and historical weeks. Food quantity/nutrient amounts are separate. Repeat oat forms or brands map to one oat, verified wheat bread/pasta to one wheat, lentils and chickpeas separately. Count only confirmed ingredient presence, never infer soup constituents or interpret branded product 'flavor' as ingredient. Original source and user corrections traceable. Do not make 30 a validated personal health target; show plain `X identified distinct foods this week`, not a microbial-diversity or health score.
- **BIO-DISC-3701/3702 P0** implement a small **versioned canonical culinary identity map**, robust alias and recipe ingredient verification, uncertainty handling, source traceability and retractions on edit/delete/reimport. Unknown recipe additions are not confirmed plant counts; unknown does not mean zero nutrition. Do not use food product count or USDA FDC IDs as taxonomic identities.
- **BIO-DISC-3703 P1** explicit herb/spice/trace, seed, grain, coffee/cocoa, oil, isolate/supplement, fermented food and cultivar policy. **Mushrooms are fungi**, show separate fungal category or label overall metric `plant and fungal foods`. No inflation by minute seasoning traces.
- **UT-DISC-3602 P1 optional** Gut Garden maps only tally/variety to abstract growth stages and says so. No actual microbiome change, bacterial growth, disease prevention, weight or metabolic outcome inferred; count also in text, reduced motion and no-image fallback. Stages are celebratory art, **not clinical thresholds**.
- **UT-DISC-3603 P1** Food of the Week: readable description, contextual nutrition/research, practical preparation/recipe, direct user-led swap/skip. **Allergens, exclusions, disliked items as applicable are hard filters** (not food suggestion overrides); no safety guarantee where cross-contact unknown. Use source-linked claim-level evidence, no personalized metabolite production or deficiency promises. User controls selection, no intrusive resurfacing.
- **UT-DISC-3604 P2** Myth or Fact: short optional versioned reviewed claims with source, population, study type, limitations, contradictory findings, review date and correction/withdrawal. `It depends` valid; not diagnostic/clinical advice or auto-generated LLM scientific approval.
- **UT-DISC-3605 P1** Weekly Focus: at most one gentle theme based on explicitly selected goals and *verified* logged food opportunities, not hidden medical interpretation or nutrient deficiency inferred from incomplete food totals. Dismissal and substitution, no user data override.
- **UT-DISC-3606/3607 P0** optionality, accessibility, privacy, feature-preservation and performance: no calorie restriction, fasting, weight change, punitive streaks, repeated missed-day warnings or unnecessary notifications. Keep Food logging, ingredient correction, macro/micro partials, recipe and original source intact.

## Artwork delivery decision
- v1 icons/garden/source components on GitHub design branch are **reference-only**, not deployed or licensed/scientifically accepted merely because committed.
- v2 native higher-detail raster source is specified as 4 garden stages PNG + WebP, 32 food identities with PNG/WebP/alpha-masked variants, 2 original sheets, README and SHA-256 inventory (source `v2/README.md`). Original archive has **not** been imported into GitHub according to current v2 manifest; no matching images appear under `v2/assets/` in retrieved design tree. Import from genuine ZIP bytes via a Git client/Codex with local file access; preserve originals and filenames, check alpha halos and stage misalignment, update manifest hashes. Do not render broken paths. **No artwork import authorized by this specification alone** and no app deploy claim.
- v2 food **art IDs are not botanical identity**. Source manifest tags mushroom as fungus and mixed grains/oil/rosemary-lemon as composite/processed; ingredient verification still required.

## Minimum test fixtures
1. Oats twice, apple once → 2; oatmeal + oat flour → 1; wheat toast + wheat pasta → 1 if verified; lentils + chickpeas → 2.
2. Unknown vegetable soup → 0 additional **confirmed** plant identities (not claiming meal contains no vegetables). Confirmed onion/tomato ingredients → 2.
3. Mushroom counted separately as fungus unless broader metric transparently named; rosemary trace governed by explicit policy; flavoring alone no identity.
4. Edits/deletion/reimport, multiple brands, timezone/week rollover and original recorded sources rederive counts deterministically.
5. Food suggestion never surfaces exclusions/allergens; user can dismiss; absent nutrients aren't a diagnosis; no fabricated personal gut improvement.
6. No omics report, offline images, reduced motion, 320px, zoom, screen reader, dark mode all retain real textual value.
7. Journal performance, source editing, macros/micros and Food→Today data remain fully usable before/after.

## Development sequence and release
**P0 current priority:** fix outstanding Food entry/search/review accuracy and feature preservation; establish existing ingredient source identity correctness. **P1:** curated identity map and a minimal Discover view with count and optional one idea, then visual garden and food-of-week/weekly focus when verified and safe. **P2:** science content/myth cards once reviewed. Source-lab claim and intended-use governance still applies to recommendations.
Developer inspects existing Discover UI and ingredient registry, stages original v2 artwork when binary access available, adds bounded tests, verifies actual render and screenshots, reports exact SHA and deployment state; does not open another redundant research cycle or new provider subscription.
**Status:** Architect handoffs consolidated, no claims of code shipped, scientific content approved or v2 binary imported.
