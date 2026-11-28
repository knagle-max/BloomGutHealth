# Bloom Comprehensive Scientific Iconography — revised source artwork v2
**Date:** 2026-10-30 | **Art branch:** design/biology-visuals-2026-10-30 | **Not approved for production distribution**

## Actual deliverables
- `organisms/`: twenty editable 560×610px portrait SVGs, updated from Biology's 20-organism correction matrix. Shapes, spacing and naming have been revised; no organism can be identified uniquely by visual appearance. Every asset intentionally retains representative illustration disclaimers.
- `bloodwork/`: ten original compact, subdued functional navigation icons. These are not laboratory status markers and do not encode diagnosis.
- `molecules/`: sixteen **decorative molecular ID cards only** with named compound, reference CID and molecular formula. Central linked-orb motif is **NOT A CHEMICAL STRUCTURE**. Do not use as scientific structure art. Existing pilot anion bond diagrams are elsewhere and await independent chemistry review.
- `pathways/`: sixteen plain-language process diagrams based on Biology's prioritized pathway topic list. These are conceptual UX assets only; actual reaction maps/evidence edges/compartment review remain pending.
- `ORGANISM_REGISTRY.json` and `MOLECULE_PATHWAY_INDEX.json`: draft identity, source labels, review and distribution statuses.

## Improvements over v1
- Taxonomic display renames at illustrated subject layer: Segatella copri, Agathobacter rectalis, Phocaeicola vulgatus and Lacticaseibacillus rhamnosus. Provider-origin names remain in path aliases and must remain available in actual app imported record context.
- Blautia shortened into coccobacilli, archaeon redrawn to oval cells, Klebsiella plumper short rods, Bifidobacterium/Collinsella majority rods rather than all forked, Ruminococcus varied cocci, Akkermansia uneven oval grouping and variable rod orientation/length elsewhere.
- No implied strain virulence, patient image or per-taxon measured metabolic production.
- All artwork is native local SVG with no embedded third-party image by design; this statement is not a completed Security scan.

## Scientific, legal and implementation gates
Biology's review was of v1 sources, not these exact v2 SHA files. Revised art still requires individual review. Chemical content needs qualified chemistry structural sign-off; abstract identity cards should not be presented as 2D/3D molecular structures. Legal's commercial clearance is CONDITIONAL pending creator/tool provenance, assignment or licence and full source audit. Original AI-assisted mood boards must not be inferred to be production-cleared assets. No external micrograph is present or approved.
User Testing and Architect review deliberately deferred at owner's request until design refinements are ready. Developer alone integrates approved assets after role approvals; design branch is not an application release.

## Recommended next design/chemistry work
Build source-generated true chemical structure SVGs from reviewed canonical stereospecific SMILES/molfiles (RDKit or similar) with molecule-specific atom/bond graph verification and separately colored/background visual treatment; replace the 16 decorative cards. Reconcile remaining source and license register fields, create 36px compact previews, full responsive profile/detail layouts and evidence-sourced pathway panels. Until these are complete, mark artwork programme **IN PROGRESS**, not comprehensive finished.
