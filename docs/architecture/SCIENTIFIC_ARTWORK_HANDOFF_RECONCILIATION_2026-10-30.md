# Bloom — Architect reconciliation: scientific artwork and iconography
Date 2026-10-30 | Status: Design direction approved; specific named science imagery NOT production-approved.

## Reviewed original handoffs
- Branding `MKT-VISBIO-3201–3210`: `design/biology-visuals-2026-10-30/design/bloom/scientific-iconography/2026-10-30/ARCHITECT_HANDOFF.md` and `UX_CONTRACT.md`.
- Original six-asset pilot `pilot/`: six editable SVGs, `PILOT_ASSET_REGISTER.json`, `PILOT_REVIEW.md`, `DEVELOPER_PICKUP.md`.
- Biology `Bloom_Biology_to_Brand_Scientific_Artwork_Handoff_2026-10-30.md` (BRAND-SCIART-01–07); `Bloom_Biology_Six_Asset_Iconography_Corrections_2026-10-30.md` (BIO-VISBIO-3301–3304 and six-item correction matrix).
- Integrations `Bloom_Integration_Iconography_Pilot_Identity_Mapping_2026-10-30.md` (taxonomy and compound ID/form mapping; do not duplicate existing registries).
- Security/Legal referral `Bloom_Security_Legal_Scientific_Iconography_Review_2026-10-30.md` (Security conditional development pickup, Legal licensing/chain-of-title pending).
- User Testing `Bloom_User_Testing_Scientific_Iconography_Pilot_Acceptance_2026-10-30.md` (UT-SCIART-3001–3016, **test plan only**).
- Latest design branch `revision-v2/SPECIALIST_RECONCILIATION.md`, plus four v2 SVGs `microbe-archaea-oval.svg`, `neutral-organism-icon.svg`, `neutral-molecule-icon.svg`, `butyric-acid-comparison.svg`.
All on `design/biology-visuals-2026-10-30`; available via GitHub and NOT verified integrated into `enhance/bloom-experience` or running Render.

## Design scope and staging
**APPROVE P1 editorial art direction:** Warm ivory, Bloom evergreen, quiet illustrated visual accents, 32–40px thumbnails and 120–220px organism heroes, subtle molecule artwork, simple functional bloodwork section glyphs. This is the visual enhancement to existing clickable microbial profiles, Molecule Journey and Progress explorer, not a separate production product or license to fabricate scientific entities.

**Priority order:** (1) retain and complete usable source-correct clickable organism profiles/bloodwork/food/exercise UI without waiting for illustrations; (2) transfer and register original editable SVG/UX source for development staging; (3) show safe neutral fallbacks; (4) review and selectively enable named organism illustrations and named molecular structures only after individual content, rights, and security gates; (5) optional real micrographs and 3D only when supported and worthwhile. Do not generate expensive iconography framework or large icon library before core workflows work.

## Specific factual corrections
- `microbe-ecoli.svg` NCBI 562: illustrative general rod, not strain/pathogen identification; revise wording as representative only.
- `microbe-faecalibacterium.svg` NCBI 216851: **genus** illustration only, never automatically promote to `F. prausnitzii` species.
- Original `microbe-archaea.svg` spherical group is **not approved for M. smithii**. Revision v2 `microbe-archaea-oval.svg` improves short oval/coccobacillary concept but remains under Biology/morphology and nomenclature review. Preserve original source taxon spelling; review `Methanobrevibacter smithii` / `Methanocatella smithii` alias/version before mapping; `M. intestini` distinct.
- `molecule-butyrate.svg`, `molecule-acetate.svg`, `molecule-propionate.svg`: metadata aligns with anionic structures but exact drawn atom/bond/valence/charge structures require independent qualified chemistry check (including RDKit or equivalent comparison to canonical identifiers). Butyrate CID 104775, acetate CID 175, propionate CID 104745; distinguish butyric acid CID 264, acetic acid 176, propionic acid 1032. New `butyric-acid-comparison.svg` is a revision **candidate**, not chemistry-approved. Conceptual molecular icon never used as a named chemical diagram.
- Only show optional `Micrograph` control when sourced identified taxon/rank, microscopy technique and applicable photographer/institution/redistribution rights are verified; no synthetic faux microscopy or invented magnification.
- Distinguish generic illustration, evidence-supported named-taxonomy illustrative portrait and actual micrograph. No organism detection implies measured metabolic activity, toxin, virulence, clinical diagnosis or species-specific function.

## Distribution and science release gates
Reuse existing canonical user observations, organism profiles, scientific entity/evidence catalogue and asset manifest rather than creating a second asset/biology store. Versioned asset mapping binds exact entity/rank/form, citation, SVG hash, depiction specificity, source licensing, scientific reviewer/date, legal rights, security delivery and withdrawal fallback. A matching taxon string alone never authorizes a specific illustration.
Static assets should be first-party served, without scripts, external SVG href/font/image requests, embedded personal report identifiers or analytics image beacons. Review cache withdrawal and per-account data access. Rights status/chain of title remains a legal question, not established merely by original editable SVG in GitHub.
If any required approval missing: neutral organism/molecule symbol + precise text identity; never hide real source data because art missing. User Testing's 16 cases and 5-person formative plan are **not completed experiments**. Acceptance needs accessible 320px/200% zoom, dark/light, text-only comparison, user comprehension, production screenshot and exact SHA after integration.

## Codex execution instruction
Read `design/bloom/scientific-iconography/2026-10-30/ARCHITECT_HANDOFF.md`, `UX_CONTRACT.md`, `pilot/PILOT_REVIEW.md`, `pilot/PILOT_ASSET_REGISTER.json`, `revision-v2/SPECIALIST_RECONCILIATION.md` on GitHub branch `design/biology-visuals-2026-10-30`. Bring original source into `enhance/bloom-experience` only as staging/referenced design sources, not automatically published named organism/molecule graphics. Audit whether equivalent files already exist before copying; no duplication. Follow reviewed identity/rights/science gates and use generic fallbacks first. Record actual committed SHA/manifest and Render UI/screenshots, not merely source delivery. Resolve true dangerous/misleading live imagery immediately; other artwork remains after the owner's core UI/functionality priority. No approval to buy rights, commission experts or add paid design tooling without explicit owner choice.
