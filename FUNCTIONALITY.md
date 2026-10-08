# Feature preservation and revised product scope

The PR is an additive enhancement. Original feature areas remain accessible and experimental outputs are labeled in the UI. It does not replace the full app with a small coach.

## Preserved or restored

Accounts and sessions; food descriptions/types; meal CRUD; daily nutrition and targets; monthly/yearly history; microbiome uploads/history/composition; diet-model exploration; molecule estimates and model health categories; personalized legacy tips; adherence and four-week model trends; prototype population comparison; profile and theme navigation. The dashboard again summarizes report diversity, taxa, molecule estimates and recommendations when data exists. No fabricated default score or prior-score improvement is supplied when results are missing.

Original food-effect exploration is restored through source-linked substrate/function explanations for meal ingredients. The old deterministic percentage/health model is available in its own clearly labeled views. This retains exploration capabilities while distinguishing hypotheses from measured values.

## Completed missing connections

Meal date/time, portion context and optional symptoms now persist. Profile information is editable and comes from the signed-in account. Dietary dislikes and category exclusions persist across devices in the database. Meal saves tolerate unavailable nutrition. Manual report entry submits data instead of requiring an unrelated file. CSV/JSON abundance imports store reported taxa and metadata without inventing genes or metabolites. Report composition and cross-report comparison have real data bindings. Original profile mutation enforces ownership. Legacy adherence avoids an unauthenticated localhost self-request.

## Added

15 complete recipe options filtered by selected goals, dislikes, ingredient categories, dietary pattern, sensitivity and cooking time. Optional AI prioritizes eligible recipes and can parse meal descriptions; source-linked biology and nutrient numbers remain database/application-controlled. Recipe descriptions can be handed to the journal, where save is an explicit action.

Meal interpretation connects supported ingredients to resistant-starch, fructan, mixed whole-food fermentation, fermented-food and walnut/urolithin research. Athlete lactate/propionate and centenarian bile-acid pathways remain available as research themes. USDA estimates cover macros and selected vitamins/minerals when food records contain them; absent or partial data is identified. Users can review automatic database matches and refine amounts/preparation by editing their descriptions. Journal-derived symptom observations and approximate recipe adherence are separate from legacy model health trends.

A separate `/demo` experience allows sample meal/pathway exploration, recipe browsing, reported sample composition, research groups and sample progress without writing to the account or calling providers.

## Remaining work toward the robust product vision

- Larger expert-reviewed food/substrate/microbe/molecule knowledge graph with exact study populations, doses, durations, conflicting findings and evidence versions.
- Better food matching, brand/recipe decomposition, portion conversion and an interactive database-match correction workflow. Current matching is automatic and requires review.
- Arbitrary goal expansion and unrestricted novel recipe creation with ingredient-level evidence checks. Current complete meals use an extensible curated catalogue; AI ranks that catalogue.
- Validated taxonomy/function pipelines for raw sequencing; laboratory-specific report adapters, gene/pathway and measured metabolite imports.
- Real harmonized cohort distributions and statistically defensible comparisons. Current numeric cohort profiles remain prototype examples.
- Prospective evaluation of tolerance, recommendations and independent biological outcomes. Food matching and symptom trends do not demonstrate causation.
- Database/provider integration testing in a provisioned environment, migrations, deployment configuration and distributed rate limiting.

These are explicit development gaps, not claims that the entire robust engine is finished. No merge or deployment is performed by updating this draft PR.
