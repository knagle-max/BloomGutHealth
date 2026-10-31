# USDA journal food catalogue

`fndds-2021-2023.json.gz` contains 5,431 food records from the USDA FoodData Central FNDDS 2021–2023 public JSON release (2024-10-31). It retains FDC IDs, descriptions, 21 selected composition fields per 100 g, and household portion descriptions/gram weights. One record without macronutrient composition (human milk) is excluded. Missing nutrient fields are never imputed.

The original download URL, retrieval date, archive SHA-256, compact catalogue SHA-256, record count and nutrient IDs are in `fndds-manifest.json`. Each app food match links to its individual FDC page. USDA data are public domain; source: https://fdc.nal.usda.gov/download-datasets/ .

Rebuild with `python scripts/build-food-catalog.py --input /path/to/download.zip`. The output uses deterministic gzip metadata. The catalogue is read only on the server, from the repository source tree in both development and Render's bundled production process. It is not included in client assets or the weekly planner's ingredient list. Runtime food matching needs no USDA credential or public-demo-key request.

This is generic food composition and household-measure data, not verified brand data or a universal natural-language understanding system. Matches, assumed servings, cooking state and label differences require user review. The constrained lexical retrieval fallback rejects missing meaningful query terms and conflicting preparation/special-product categories; optional AI parsing requires consent and a working provider. Automatic match quality is not independently validated.
