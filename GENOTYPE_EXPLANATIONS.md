# Gene, SNP and genotype explanations

Precision → Genetics → **What your variants mean** now provides searchable explanations for saved genetic entries. Each curated card leads with a plain-language topic and gene role, a matched everyday takeaway, and what the user can do next. Food examples, supplement considerations and explanations of useful health measurements are separate sections. Three-genotype comparisons and scientific/source detail remain available in expandable sections. Search also matches topics such as vitamin D. A matching row is highlighted only when strand orientation and the allele pair are supported. No AI provider call is needed.

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

## Plain-language practical guidance (2026-10-18)

All 29 educational markers now include a topic, three source-bounded result takeaways and actions, plus food options, conditional supplement guidance and follow-up context. The action field is exposed only for a confirmed supported genotype. Unknown orientation, missing calls and unsupported allele pairs show no matched action; any food information is explicitly general. Unknown rsIDs have no invented food or supplement advice.

Established directions are stated in everyday terms (for example, less efficient folate processing, likely adult lactose digestion, or higher average iron-overload susceptibility). Population associations are labelled tendencies rather than measured personal efficiency. Mixed outcomes such as TM6SF2 liver fat versus circulating lipids and GCKR glucose versus triglycerides are explained as trade-offs. Uncertain MTR/MTRR/CBS/CYP27B1 markers explicitly do not imply a special nutrient requirement. A favourable marker never guarantees an adequate nutrient level.

Each card distinguishes general food guidance from a demonstrated genotype effect. Examples include folate-rich beans/greens, lactose-free or lower-lactose alternatives, fortified foods and algae-derived omega-3 options. Vitamin D guidance describes food/supplement intake options, appropriate use of a 25-hydroxyvitamin D test, and the difference between a blood-level association and proven malabsorption. It does not prescribe extra unprotected sun exposure or active vitamin D. Iron and retinol decisions require actual need/context; no genotype-derived dose is provided. APOE remains individual-marker context only, with no type or dementia-risk assignment.

The added nutrition references are NIH Office of Dietary Supplements, CDC, NIDDK and NHLBI guidance; the original exact-marker study and forward-reference links remain. This is sourced educational software content, not independent clinical review. Food ideas do not override allergies, preferences, existing prescriptions or individual medical care. No changes to planner rankings, nutrient targets, database schema or stored genotype consent are made by this copy update.
