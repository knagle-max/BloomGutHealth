# Bloom — Finished Scientific Artwork Interface Compositions (design v3)
2026-10-30 · Editable source references for User Testing and Architect review **when the user requests that review**.

Six layout studies: microbe, molecule and bloodwork at 390px mobile or 1160px desktop, with both light and dark samples. The artwork slots show simple icon placeholders; production React must load **approved** subject assets through the gated registry, not automatically include pending designs. These are static layout studies, not functioning or accessibility-tested application screenshots.

## Responsive behavior contract
- 320–390px: one-column stack; long taxon names wrap to two lines, no clipped percentages or unit values; icons 36–40px, targets >=44px; hero portrait 160–200px with visible Illustration label
- 1160px+: two-column master/detail in real React, one source-linked view, no duplicate lab trend engine; source context and focus restore
- Mobile and desktop: current original report name, observation dates and lab unit always sourced from canonical data; no fictitious personal chemistry
- Dark/light: use semantic colour variables; information and provenance in text; keyboard/screen-reader fallbacks; reduced motion
- No unlicensed micrograph toggle, no unreviewed structures, no visual health scores for taxa or labs

## Explicit next verification gates
Chemical structures in ../structures are manually authored connectivity diagrams with documented atom/bond edges. Molecular identity metadata does **not** certify that SVG geometry is an exact PubChem projection; independent qualified chemistry review and automated graph tests are pending. Aromatic indole and stereospecific glucose are deferred. All organism shapes and pathway arrows remain subject to expert scientific review. Legal chain-of-title and third-party media clearance are outstanding. User Testing / Architect intentionally not asked to review yet at owner's request.
