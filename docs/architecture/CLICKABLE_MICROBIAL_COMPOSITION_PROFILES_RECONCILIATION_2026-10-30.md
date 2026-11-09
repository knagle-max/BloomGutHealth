# Bloom — Clickable Microbial Composition Profiles: Architect reconciliation
Date 2026-10-30 | Status: approved with scientific conditions, P1 interactive feature / P0 scientific-data integrity when surfaced | No implementation/independent acceptance claimed.

## Source handoffs and precedence
- User Testing `Bloom_User_Testing_Clickable_Bacteria_Scientific_Profiles_2026-10-30.md` (UT-TAXON-2801–2808).
- Biology `Bloom_Biology_Organism_Profile_Review_2026-10-30.md` (BIO-TAXON-2901–2905).
- Branding `Bloom_Microbial_Profiles_Branding_UX_Handoff_2026-10-30.md` (MKT-TAXON-3001–3007).
- Binding original design source **already verified on separate branch** `design/microbial-profiles-2026-10-30` under `design/bloom/microbial-profiles/2026-10-30/`: `ARCHITECT_HANDOFF.md`, `UX_CONTRACT.md`, `microbial-profile-sheet.svg`. **Not yet present at expected paths on `enhance/bloom-experience` at Architect review**. No Library transfer blocker: fetch GitHub design branch and commit original sources to dev branch.
- Existing source `client/src/pages/Microbiome.tsx`, `shared/report-explanations.ts`, `client/src/components/ImportedReportDetails.tsx` has composition table and some organism education. Inspect latest code; reuse rather than create parallel taxon database or duplicate biological registry.

## Product and UX acceptance
**Approve:** My Biology → Microbiome → **Microbial composition & change** (includes archaea, not only bacteria). Full taxon row clickable with exact original species/genus spelling, relative percentage (or Not reported), sample/report/date/source/method; mobile in-context bottom sheet / desktop side pane. Preserve sorted list, date/report selection, compare and scroll on close; focus trap/restore, keyboard Escape/back, screen readers, 320px, 200% zoom, dark/light and reduced motion. Follow original `UX_CONTRACT.md` and SVG, no independent redesign.

Opened sheet begins with **separate reported observation** (exact source abundance, taxonomic resolution, method, report date, synthetic/fixture flag) and contains:
1. What this organism is
2. What research has found
3. Nutrients & molecules (substrate → studied transformation → potential products)
4. Diet studies
5. Your report: what it does and doesn't show
6. Studies & limitations (progressive disclosure)
The UX contract calls these five research/context disclosures plus an introductory organism section; use its exact hierarchy. Each cited claim identifies studied population, method, species/strain resolution, evidence type (human intervention, observational, lab, animal, insufficient), contradictory/null findings and limitation when known. **Never assign permanent beneficial/harmful organism-wide labels.** A single species can have different claim-level effects and evidence contexts.

## Scientific / safety invariants
Personal detected organism abundance does NOT measure metabolic gene expression, butyrate/methane/toxin concentration, pathogen virulence, user infection, disease risk or personal optimal %. No automatically suggested antibiotic, eradication, disease-specific treatment or taxon abundance target. `Escherichia coli` / `Klebsiella pneumoniae` detections do not prove virulent strains; `Methanobrevibacter smithii` is archaeal and detection is not diagnosis of intestinal methanogen overgrowth. Assay 16S vs shotgun, taxonomic/strain resolution and QC must restrict each personalized overlay; no supported specific claim → explain `Reviewed research profile not yet available` and keep original reported observation. Do not generate placeholder science or declare all twenty full profiles curated. Retractions invalidate affected explanation/version, not immutable user report; synthetic and incompatible cross-date data visibly qualified. Preserve account isolation.

## Taxon coverage acceptance fixture
Match existing user-testing fixture of 20 exact organism names: Blautia wexlerae, Escherichia coli, Prevotella copri, Anaerostipes hadrus, Desulfovibrio piger, Eubacterium rectale, Ruminococcus bromii, Alistipes putredinis, Bacteroides vulgatus, Bacteroides uniformis, Bilophila wadsworthia, Klebsiella pneumoniae, Bifidobacterium longum, Roseburia intestinalis, Akkermansia muciniphila, Collinsella aerofaciens, Lactobacillus rhamnosus, Methanobrevibacter smithii, Bifidobacterium adolescentis, Faecalibacterium prausnitzii. **20/20 clickable identity/observation coverage**, but only curated science where individually reviewed; honest unavailable state otherwise.

## Implementation sequence and signoff
1. **Codex asset transfer now (bounded):** fetch `design/microbial-profiles-2026-10-30`, copy exact three design files into `enhance/bloom-experience` at their existing paths, verify bytes/commit and update canonical asset manifest as appropriate. GitHub source branch removes Library access dependency.
2. Audit existing composition table and organism explanation catalogue, implement in-context accessible sheet/reuse existing linked evidence, verify data provenance and source-state behaviour. Do not build a new generalized evidence ingestion engine first.
3. Test 20 identity links; accurate percent/date/sample/assay; unknown profile; archaea, virulence strain guard; conflicting methods/dates; privacy; responsive keyboard/reader close. Functional smoke on Render and screenshots compared to original SVG.
4. Biology approves individual new claims; Branding reviews actual rendered screen; User Testing independently checks comprehension. Mark implemented/tested/deployed/accepted separately. No claims of full twenty curated profiles or clinical clearance.

**Priority:** After owner-urgent usable flagship UI / normal Food and Exercise interactions; implement as the Microbiome slice of the **full approved UI/branding programme**, not new speculative ML expansion. Existing P0 source-integrity or unsafe exposed microbiome claims remain immediate fixes.
