# Bloom Science Explorer — source-linked user experience
Status: design candidate, not a functioning implementation or scientific rule approval.
Canonical navigation: Biology → Explore research → organism/molecule → mechanism → food evidence → personal relevance → sources.
Preserve canonical assay-specific imported records; do not create a second knowledge graph, second literature ingestion engine or parallel advice pipeline.

## First view
1. Entity title, canonical identity and original sample label when relevant.
2. Plain-language summary in two sentences, including research context.
3. Five questions, each with a reachable detail section: What does it do? Why does it matter? What influences it? What research supports it? What do my results establish?
4. One compact, persistent 'research education — not a measurement of your personal biology' statement, not dense disclaimer blocks.
5. Sources and limitations accessible within one action.

## Critical separation
- Species detection ≠ enterotoxigenic strain detection ≠ bft gene confirmation ≠ BFT protein/activity detection ≠ measured host response.
- Mechanism in cell experiments ≠ clinical outcome or proven food therapy.
- Species abundance intervention ≠ direct BFT blockade.
- Group comparison finding ≠ guaranteed individual response.
- Claim label must enumerate evidence type: mechanistic, animal, observational human, randomized human trial; show studied dose/time and outcome verbatim in data contract.
- New research ingestion status: candidate → reviewed evidence → approved educational claim. Personalized advice needs an independent stricter gate.
- Never badge whole species 'harmful' or 'beneficial'; context and strain specificity matter.

## Source-linked BFT worked example
Species: Bacteroides fragilis.
Strain: enterotoxigenic strains where supported, not inferred from species-level testing.
Mechanism: BFT binds CLDN4 receptor, promotes cleavage of E-cadherin in epithelial experimental systems.
Human dietary comparison: 56.7 g almonds/day for eight weeks, college-freshman randomized study, decreased B. fragilis relative abundance versus graham-cracker group; did not test BFT inhibition or toxin-positive strains.
Question: 'Can almonds block BFT?' Answer: not established in humans.
Sources: https://doi.org/10.1038/s41586-026-10375-0 ; https://pubmed.ncbi.nlm.nih.gov/31528836/

## UI route states
No report: general education visible; personal data panel says 'No matching measurement available', not organism absent.
Species-only report: 'Species reported'; strain/gene/toxin status 'not tested / cannot determine from this report'.
Gene-specific result: requires exact identifier and test method; don't infer expression/activity.
Low-quality unresolved taxon: explicit unresolved identity and source record link.
Publication unreviewed: 'Research awaiting review'; no actionable diet suggestion.
Conflicting research: show adjacent evidence entries with contexts and 'why results differ' when established.
Source unavailable or withdrawn: show title, citation and withdrawal status; block active claims.
Allergen/exclusion: hide unsafe food suggestions; general evidence can be read with explanatory restriction.
Offline: previously cached reviewed education with freshness; no silent new claims.

## Feature preservation
Existing Biology source report, assay resolution, date, biomarker trends, molecule explorer, pathways, citations and lab corrections remain accessible. Avoid hiding source detail more than one action away. Source explanation is not overwritten by artwork.
