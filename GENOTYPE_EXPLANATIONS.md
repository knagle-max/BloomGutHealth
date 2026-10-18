# Gene, SNP and genotype explanations

Precision → Genetics → **What your variants mean** now provides searchable explanations for saved genetic entries. Each curated card includes the gene's metabolic role, the specific SNP, a matched result when supported, comparison of the three genotypes formed by the studied allele pair, dietary relevance, evidence/context limits and linked sources. A matching row is highlighted only when strand orientation and the allele pair are supported. No AI provider call is needed.

## Scope and boundaries

The first educational catalogue covers 29 SNPs, including the selected-entry shortcuts. It is distinct from the existing seven-marker diet-ranking catalogue. Adding educational context does not make a marker actionable, add a food-ranking rule, calculate a nutrient dose or create a microbial prediction. MTR/MTRR/CBS/CYP27B1 and other uncertain comparisons explicitly acknowledge limited or inconsistent actionability. Heterozygotes are not automatically labelled halfway between homozygotes; lactase persistence, FUT2 secretor function, APOA2 recessive-model findings and the FADS homozygote-only trial illustrate different comparison limits.

Unknown rsIDs receive an explicit “not curated” card; the submitted gene label is not treated as verified identity. No-calls, unknown orientation and alleles outside the studied pair receive no matched personal comparison. A valid rare allele can be outside the common pair covered by a study; Bloom does not declare it biologically impossible, complement it or substitute another SNP. Comparisons stay educational reference content in these cases.

APOE cards explain the individual protein-position markers only. They do not infer haplotypes, a combined APOE type, Alzheimer risk or a genetic disease diagnosis, even when both markers are present. HFE susceptibility information calls for appropriate confirmation and measured iron assessment rather than a diagnosis or automatic supplement/diet changes. No personal risk percentages or enzyme-activity scores are generated.

## Raw-file and manual inputs

The strict GRCh37 forward-strand raw parser now retains **only the 29 explanation-catalogue SNPs**, after explicit preview and consent. It checks their positions and reported alleles against the checked-in GRCh37 reference snapshot. Other raw-file rows are counted but not retained or uploaded. Dietary findings still require one of the seven diet-reviewed rsIDs and its reviewed allele pair; a rare raw allele outside that pair cannot acquire a diet finding. The manual form prefills all retained raw entries so switching entry methods does not silently drop educational-only SNPs.

Existing saved imports with seven calls continue to work. Older raw files are not retained and cannot be reprocessed automatically; users can optionally re-import or enter selected SNPs to add coverage. Manual entries retain their source/consent/strand protections. No database migration is needed. Explanations are generated from the versioned catalogue when the authenticated no-store report loads; they are not external AI analyses of a user's genome.

## Sources and maintenance

`shared/data/genotype-explanations.json` contains the authored explanations, studied allele pairs, evidence descriptions and primary-study/official-reference links. `genotype-reference.json` preserves the retrieved GRCh37 placements and forward alleles from Ensembl. The wider reference allele set is not equated with the narrower allele pair covered by an explanation. Reference verification is not clinical validation or independent expert certification.

Source additions require checking the exact rsID, genomic versus gene-oriented strand, studied population, inheritance/comparison model, conflicting evidence and clinical actionability. Do not infer personal magnitudes from a population association, or reuse a percentage measured for a multi-variant combination as the effect of one SNP. Never invent an explanation merely because an entry uses a familiar gene name.

Validation includes catalogue/reference consistency, coverage of entry shortcuts, personal-match abstention, dominance/strand mappings, manual/raw compatibility, account-scoped report delivery and raw retention boundaries. Browser checks cover saved-result matching, three-row comparison tables, mismatched-result non-highlighting, search, additional raw-file markers, preservation in the manual editor and mobile layout. Current literature coverage remains bounded; prospective clinical utility has not been established.
