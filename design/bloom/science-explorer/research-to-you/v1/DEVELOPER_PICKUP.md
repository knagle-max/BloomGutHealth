# Research-to-You — Developer pickup
Branch: `design/biology-visuals-2026-10-30` | Date: 2026-11-01

## Files
- `prototype.html` — editable self-contained responsive standalone UI. Uses no remote images or JavaScript libraries.
- `COMPONENT_CONTRACTS.json` — states and exact integration expectations.
- `ACCEPTANCE.md` — test tasks and negative science-inference cases.

## Design decisions
Reuse Bloom evergreen/sage/ivory; extend the existing Science Explorer. This is the single five-question story shared by microbiome and host-only biology. Entry from a news URL must resolve canonical original source; the sample entry field intentionally does **not** pretend to perform research lookup.

## P0 user-comprehension invariants
- Host-only liver paper: "microbial involvement not established"; do not render generic microbe recommendations.
- Separate human LDL-related food evidence from mechanistic Ral/CTSA experimental pathway.
- Lab LDL-C is not molecular CTSA assay; source data must include units, dates, analyte and method.
- B. fragilis species presence is not ETBF strain, bft gene expression or active toxin.
- No evidence automatically upgrades personal actions, medical advice or new food suggestions.
- Unreviewed, corrected and withdrawn papers are handled by the canonical existing evidence lifecycle.
- Full paper figures/text may not be reused without rights; all visual diagrams here are original text/path constructs.

## Developer scope
Wire to existing v0.6 versioned source registry, evidence graph, Biology observations and recommendation gates. Do not create a second ingestion service, graph or food engine. Integrate with previously committed Science Explorer and What’s Changed screens; avoid duplicating nav. Test 320px, 200% zoom, screen reader/keyboard, dark mode, offline, and source failure. The sample publications and phrasing must be independently approved by Biology before appearing as live factual recommendations.

No live app tests or deployed functionality claimed.
