# Bloom Scientific Iconography — Final Design Candidate v4 (review package)
**Status:** DESIGN CANDIDATE, not scientifically or legally approved; not integrated into Bloom runtime.
**Date:** 2026-10-30 | **Canonical branch:** design/biology-visuals-2026-10-30
**Source:** consolidated actual SVG assets from v2 and v3, plus v4 review variants. Original versions retained.

## Delivered
- 20 detailed organism concept portraits, 20 compact standalone thumbs (artist-designed 120-unit assets; no claimed species-diagnostic imagery)
- 14 actual manually composed atom/bond SVGs for chemically identified forms, 2 complex compounds pending (indole, D-glucose); **none has an independent final SVG chemistry signoff**
- 16 conceptual pathway SVGs; illustrated stages, **not** atom-balanced or strain-specific biochemical reaction maps
- 10 restrained clinical lab category icons
- 16 editable interface compositions across four workflows (microbial composition, organism profile, molecule exploration, Biology/Progress) × mobile/desktop × light/dark

## Quality boundaries
This is a consolidated **review-ready design candidate**, not a scientifically complete art production release:
- Biology reviewed previous v1 organism artwork and identified corrections implemented conceptually in v2; it has **not signed final v4 exact blobs**. Review original source nomenclature and links; never infer uniquely species-specific morphology, relative abundance or activity from art.
- Chemistry reference SMILES was validated on *some reference compounds* but final vector graph and atom/bond mapping **has not been automatically matched to verified structures**. In particular complex molecules cannot be displayed as verified chemistry.
- The existing 16 pathway diagrams are legible conceptual flow layouts and not final biologically detailed scenes.
- The 16 screen studies use static placeholders rather than embedding the art assets; they are not actual rendered app screenshots. Responsive, screen reader, zoom, contrast and real-device acceptance **not performed**.
- Legal: source creator, AI tool provenance, rights assignment and commercial distribution clearance remain **conditional**. No third-party micrographs added.
- The registry contains exact Git blob SHA for each design asset as read from the committed branch, not false approval. Review the same SHA after revisions.

## Next gates in dependency order
1. Independent qualified chemistry check against final structures; programmatic RDKit match where appropriate, fix any failures, final SHA handoff.
2. Independent microbial morphology sign-off for any claimed taxon-associated depiction; neutral/generic fallback otherwise. Biology rechecks exact final art.
3. Legal documentation/chain of title for originals/AI-assisted source and per-asset final rights; Security full SVG scan.
4. Developer integrates **only separately approved assets** behind existing evidence and identity map, then supplies actual screenshot/build SHA and safe rendering.
5. User Testing runs scripted accessibility/comprehension cases on real application build; Architect consolidates final release disposition.

## Strict implementation semantics
Do not promote revision-v1/v2 Bio approval to unreviewed v4 SHA. Do not load unapproved images through public CDN. Preserve imported organism labels, original lab units/dates, assay rank, evidence classes and unknown states. Static drawings do not imply individual's metabolite concentrations.
