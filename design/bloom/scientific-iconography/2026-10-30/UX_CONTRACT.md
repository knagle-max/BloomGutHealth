# Bloom — Scientific Illustration and Iconography UX Contract
**Version 1.0 · 2026-10-30 · Branding & UX**
Linked Architect handoff: ARCHITECT_HANDOFF.md.

### Aesthetic
Premium museum-grade natural-history meets scientific editorial. Warm ivory, restrained Bloom evergreen, finely controlled depth, legible labels and distinct silhouettes only when evidence supports distinct morphology. Small images should behave like quiet visual anchors, not stickers. No faces, neon microbiome scores, pseudo-accurate cell anatomy or unreviewed microscope details.

### Organism row
Left optional 36px visual (illustration or taxon-neutral placeholder); centre taxon full italic scientific name + source observation and date; right disclosure chevron. Source % from actual canonical report only; missing remains “Not reported”. Visual imagery never substitutes for organism taxonomic text or meaning. At 320px preserve readable scientific names rather than shrinking below accessible minimum.

### Organism profile hero
Research sheet uses 160–200px portrait (web/mobile), taxon name and a visible “Scientific illustration — representative morphology only” label; if artwork is generic, say so explicitly. Under hero: “What this organism is / What research has found / Nutrients & molecules / Diet studies / What your report shows / Studies & limitations.” Compare / original source preserved. Link to molecule cards through claim-specific source graph, never equate taxon presence to production.

### Microscopy toggle
Two named choices “Illustration” and “Micrograph” (not “real/AI”) when verified micrograph available. Micrograph opens attribution, technique, scale and actual taxonomic resolution when known. Lacking scientific provenance, don't enable. Always preserve exact organism identity and focus/scroll when toggling.

### Molecule card and expanded view
Small accurate 2D formula or neutral hexagon/bond illustration; name and chemical form. Detail tabs “Structure”, “Role in research”, “How it may be made” and “Evidence”. 3D model only for reviewed compounds and with noninteractive 2D fallback. Label acid/anion forms and stereochemistry where relevant. Do not use 3D atom position as an implied measurement of the individual. Touch rotate is optional; no gratuitous spinning.

### Bloodwork
Use existing clean glyph system for organ/system sections. The chart, dated values and reference provenance remain primary. Icons are navigation and recognition aids, not a traffic-light verdict.

### States, semantics, accessibility
Verified illustration / generic illustration / licensed micrograph / unknown artwork / withheld or withdrawn image / offline fallback. alt: informational images use accurate brief text, decorative thumbnails blank alt and adjacent name read normally. 44px touch targets, keyboard operable and focus returns, 200% reflow, dark/light, reduce-motion, images loaded lazily, no third-party tracking. Record source+license+review date per asset. Never use exact species claim just because model prompt used that species name.

### Review matrix
At least 3 morphology classes, a nonbacterial archaeon, 3 compounds, 320/375/390/1280 viewport, reduced motion, offline, no-data report, changed taxonomy, unlicensed micrograph, no generated false measured molecule. Include actual rendered application screenshot after Developer integration. Editable SVG supplied is structural style guidance, not verified organism or molecular structure.

### Non-goals
No image-generation pipeline inside production, no automatic pathogen/health judgments, no microbiome “good/bad” cartoon cast, no unreviewed chemical diagrams, no public launch claim without independent scientific, licensing and usability checks.