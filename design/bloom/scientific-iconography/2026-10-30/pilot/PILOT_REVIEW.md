# Bloom — Scientific Iconography Six-Asset Pilot
**Date:** 2026-10-30 | **Design owner:** Branding & UX | **Status:** Editable design source delivered, scientific release pending.
**Parent contract:** ../ARCHITECT_HANDOFF.md, ../UX_CONTRACT.md; Biology's BIO-VISBIO-3301–3306 and Integration INT-VISBIO-2026-01–06.

## Delivered
**Microbes:** 1. `microbe-ecoli.svg`: representative bacterial rods, not strain/pathogenicity. 2. `microbe-faecalibacterium.svg`: conceptual elongated rods, not exact species. 3. `microbe-archaea.svg`: conceptual rounded cells for archaeal discussion; taxon identity, morphology and actual representation require independent review. None are microscopy images, have scale bars, or depict a personal stool specimen.

**Molecules:** `molecule-butyrate.svg`, `molecule-acetate.svg`, `molecule-propionate.svg`: manually arranged simplified 2D connectivity with candidate chemically distinct carboxylate anion representations, corresponding SMILES and cited PubChem CIDs in registry. They are NOT validated precise 3D models; atom positions aren't experimental geometry. The representations intentionally differ from their conjugate acids.

**Art direction:** Premium natural-history palette, editorial typography, botanical hues and soft painterly geometry. Each file is independent editable SVG, no external linked pixels, no scripts, no external fonts, no imported images. Scientific review still required before assigning to canonical named taxon profiles.

## Must-pass Biology and chemistry gates
- Morphology specialist: approve each subject's identifiable shape features or downgrade to generic taxon illustration, with documentary evidence and depicted rank. `microbe-archaea.svg` must NOT be asserted as a taxon-specific micrograph or proof of shape.
- Qualified chemistry reviewer: verify SMILES, 2D bond order/valence/formal ion charge, exact graph-to-vector geometry, formula, protonation and source CIDs; use RDKit structural sanitization or equivalent plus human review. A visual review of graphic alone does not suffice.
- Integrations: NCBI TaxIDs, source taxon naming authority, source rank/assay resolution, PubChem identities, revisions and fallback. P0 gate: never auto-map a generic concept to species-measured micrograph.
- Legal: confirm commercial use and rights; no third-party images embedded in current SVGs, but final publication rights and external micrographs need review.
- UX: 320px and 200% zoom, light/dark contrast, focus and alt text, can users explain not their own sample or inferred metabolite.

## Acceptance after Dev import
Place reusable SVGs behind approved subject/depiction metadata and neutral fallback; do not load automatically by scientific name alone or assert verified micrograph. Render organism list+sheet and molecule card+detail; test absent microbiome, archeal/bacterial naming, all 3 molecules, withdrawn scientific approval, offline and screen reader. Screenshot the actual build. Designer signs off final fidelity only after these reviews.

## Reference chemical identities
- Butyrate (n-butyrate): https://pubchem.ncbi.nlm.nih.gov/compound/104775
- Acetate: https://pubchem.ncbi.nlm.nih.gov/compound/175
- Propionate: https://pubchem.ncbi.nlm.nih.gov/compound/104745

## Ownership
These pilot files do not implement application behavior. Chief Architect approves scope; Developer integrates and tests; Biology, chemistry, Legal and UX supply separate final signoffs.
