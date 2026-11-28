# Bloom scientific portrait library — Branding & UX approval record
**Date:** 2026-11-04 | **Role:** Branding & UX | **Source:** `design/bloom/scientific-iconography/2026-10-30/library-v4/`
**Decision: CONDITIONAL APPROVAL OF VISUAL LANGUAGE ONLY — NO PRODUCTION ENABLEMENT.**

## Scope actually reviewed
- Read v4 handoff, v4 manifest, representative full organism SVG sources (Akkermansia, E. coli, M. smithii) and organism-profile integrated screen markup; examined all 20 exact-name Biology concept dispositions from `Bloom_Biology_v4_Exact_Asset_Scientific_Decisions_2026-10-30.md`.
- Audited 20 v4 organism registry entries by exact Git blob SHA. Reviewed source file organization and existing 16 integrated screen variants and 16 wireframe design studies from manifest; **did not render every asset on a device or perform image-level inspection of all 16 screens**.
- Existing Legal and User Testing specialist handoffs consulted, but their provisional findings are **not** transformed into sign-offs.

## Branding disposition
**Conditional direction pass:** Palette (deep evergreen, muted scientific colour, pale ivory), typographic hierarchy, coherent portrait framing, original vector-art sourcing and non-diagnostic labels generally fit Bloom. Representative illustrations are preferable to generic emoji in *reviewed educational* contexts, once release-gated.

**Revisions required before UX acceptance:**
1. **Legibility:** Portrait contains caption ~11–12.5 SVG units in a 560-unit canvas. When rendered at 136px in the sample mobile layout, this is effectively ~2.7–3.0px high: **not readable**. The scientific illustration/identity statement must be rendered as separate accessible DOM text, never only embedded inside a shrunken SVG. Avoid title text baked into tiny thumbnails.
2. **Perceived specificity:** Portraits use similar 7-cell arrangements with colour/shape variation, which visually exaggerates species distinctness despite non-diagnostic caveat. Explicitly label "Representative scientific illustration" and display taxon source/assay rank outside art; never present as captured specimen, measured organism count, or unique species fingerprint.
3. **Five generic-only taxa:** Alistipes putredinis, Bacteroides uniformis, Bilophila wadsworthia, Desulfovibrio piger and Segatella/Prevotella copri must be presented as **generic microbial illustration**, not species-authentic portraits.
4. **Taxonomic terms:** M. smithii is **Archaea**; source/renamed labels must preserve original report name. No universal beneficial/harmful colour coding; no pathotype implication for E. coli or K. pneumoniae.
5. **Static screen disclosure:** The integrated SVGs are design compositions and cannot prove breakpoints, zoom, focus, image-failure states or colour contrast. Embedded SVG labels may be tiny, and reused nested gradient IDs should be checked when composing multiple portrait elements.
6. **Accessibility/empty states:** Native DOM alt/text equivalent, neutral fallback, no fabricated micrograph tab, no disabled misleading controls, and no image required for source citation or diagnosis safeguards.
7. **Visual quality:** Existing v4 portraits are cohesive educational vector motifs but *not* verified scientific plates or microscopy. Do not market them as photo-realistic species-identifying portraits.
8. **Molecules:** Chemistry concept approval is **not** an independent geometry sign-off. Verify acid/anion charge, hydroxyl and N+/O− at display sizes before replacing any molecule fallback.

## Distinct approvals / workflow
1. Biology: v4 specialist concept record says **15 plausible representative concepts, five generic only**. This is not qualified species-portrait microscopy sign-off; 14 molecular drawings remain chemistry-validation pending.
2. Legal: provisional and conditional, no chain-of-title/license evidence for final exact blobs; **not approved for commercial display**.
3. Security: no complete exact-blob SVG and delivery-path audit evidenced in inspected record; **not audited here**.
4. Branding: **conditional visual direction acceptance**, specific corrective requirements above. User Testing: pilot scenarios are specified, **no participant results**.
5. Architect: must reconcile approvals by **exact blob SHA**, not filename or revision-level inheritance; no unreviewed blob may be enabled.
6. Developer: keep neutral fallback; enable only after release registry carries all affirmative gate states. Never copy design directory wholesale into public bundle.

## Concrete acceptance on implemented screens
- 320 CSS px, 200% zoom and screen reader: scientific illustration disclaimer and original report taxon remain readable; must not be text embedded only in art.
- E. coli profile: zero users inferring virulence or disease from portrait alone in formative tests.
- Archaeon profile: users identify archaeon rather than bacterium.
- Species-only assay: users do not infer specific strain, toxin, function or clinical benefit.
- Hide image and/or disable rights: source data and navigation continue; neutral fallbacks.
- Molecule profile: ionization state and evidence distinction readable with and without graphic.
- Contrast checks, focus, keyboard, slow-network loading and dark mode against actual deployed build.
- At least five uncoached participants plus assistive tech sessions, with device, build SHA, asset SHA and quote-level results.

## Sign-off boundary
This record is a **Branding & UX source-review acceptance with conditions**, not a certified Biology, Legal or Security opinion, not completed User Testing and not approval to turn on scientific portraits. `ASSET_DECISIONS.json` identifies exact targets and blockers. The Architect should merge gate statuses from qualified owners and authorize eligible assets only after all checks.
