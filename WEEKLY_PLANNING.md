# Biology-informed weekly planning

This release adds a source-linked evidence network and a constrained planning engine alongside existing features. It does not implement a clinically validated digital twin or quantitative host–microbial flux model.

## Working flow

1. Confirm adult/non-pregnant health context and save individual preferences and allergies. Custom preference goals are persisted; goals without reviewed mappings do not invent new interventions.
2. Supply energy, protein, fiber range, sodium and saturated-fat constraints; optionally add micronutrient constraints. Starting values in the interface are examples, not individualized requirements.
3. The engine checks explicit USDA composition records across procedural recipes and serving sizes. It applies pattern, time, ingredient-category and free-text filters before searching. Unrecognized allergies block automated plans. Selected high-risk conditions require individualized assessment; this is not comprehensive condition or interaction screening.
4. A bounded beam search builds 1–7 days. Nutrient constraints take priority over variety; a known feasible day can repeat. A failure to find a solution is shown as unmet targets, not proof that no possible diet exists. The server rejects saving incomplete/unmet plans and recalculates on save and swaps.
5. Plans, input context and cited evidence are saved as encrypted account-scoped `plan` records using existing storage. They can be linked to check-ins. Existing precision-input deletion also removes derived weekly plans. No new schema migration is required.
6. Users can inspect ingredients, preparation, nutrient estimates and per-day checks, change a meal or portion, log a planned meal as eaten, and print prepared-quantity shopping lists. Saved snapshots remain historical; rebuild after preferences, source measurements or health context change.

## Biology and evidence

The versioned network connects substrate, organism, microbial pathway and molecule nodes using existing sourced mechanisms. Host variants have separate sourced host-pathway links; no unsupported genotype-to-microbe or genotype-to-metabolite edge is invented. Reported taxonomic matches do not demonstrate strains, genes, activity or absence. Measured metabolites remain separate.

Recent laboratory flags can prioritize compatible food patterns. Genetic context remains secondary and does not dictate nutrient limits or supplements. The catalogue now supports seven reviewed GRCh37 markers: MTHFR rs1801133, MCM6/LCT rs4988235, FADS1 rs174547, TCF7L2 rs7903146, PNPLA3 rs738409, TM6SF2 rs58542926 and GCKR rs1260326. Coordinates and the supported forward-strand allele pair were checked against genome references. This is not whole-genome or polygenic interpretation. Other alleles/builds fail validation.

## AI and live providers

With explicit consent, `OPENAI_API_KEY` plus `OPENAI_SCIENCE_MODEL` enables new recipe ingredient proposals from the sourced catalogue. The AI chooses food IDs, amounts, meal type and preparation style; the application supplies cooking instructions, computes nutrition, checks ingredients and validates the whole plan. It receives food preferences, exclusions and recipe instructions, not genetic calls or bloodwork. Output validation cannot guarantee that a novel combination tastes good.

Without provider credentials this release uses structured recipes and exact prepared-food snapshot matches. General food descriptions still need confirmation and broader live lookups (`USDA_FDC_API_KEY`). No live provider success is claimed by the configuration-status endpoint. The existing optional Python service is unchanged and is not a validated metabolic simulator.

## Explicit remaining work

- Broader food identities, household-measure resolution, nutrient requirements and clinically reviewed food/supplement interaction coverage.
- Real functional metagenomic/assay integration and validated quantitative microbial/host models.
- Harmonized research cohort datasets and external/prospective validation showing additional benefit over simpler diet-and-lab baselines.
- Prospective response learning with explicit consent and safeguards against confounding.
- Verified live AI/USDA calls with privately configured credentials; no keys are included in source.

The release is a functioning integrated planning foundation, not completion of clinical validation or every stage of the precision-nutrition roadmap.
