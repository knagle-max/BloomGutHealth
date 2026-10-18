# Journal nutrition estimates

Ordinary meal descriptions can use editable portion assumptions without an AI or nutrition API key. The local parser separates comma/and/with/sentence components, recognises a bounded catalogue of common foods and estimates cooked meat per skewer (75 g), eggs, selected cups and generic servings. Explicit valid gram/kilogram weights take precedence. These assumptions are working defaults, not measured or clinically validated portions.

For example, chicken and beef skewers, lemon potatoes and a bag salad with dressing/croutons are separated into food components. Lemon potatoes use separate assumed oil/lemon additions; existing olive oil/lemon components are not added twice. A bag salad defaults to one serving, not a whole bag. Dressing defaults explicitly to a generic Caesar record and must be reviewed for the actual product. Meat cut, cooking method, vegetables, salt, marinades and brands can change the estimate substantially.

Composition comes from the existing 27 planning-food USDA SR Legacy records plus six logging-only records in `shared/data/logging-foods.json`, retrieved directly from the USDA API on 2026-10-18. The added records do not alter the weekly planner's eligible ingredients. Nutrient values are per 100 g scaled by the estimated or entered food weight; no model invents vitamin/mineral values. Every match links to its original FDC record. Missing fields retain partial coverage or unavailable status, including an incomplete vitamin E value in the BBQ example.

Optional AI parsing requires consent and working provider billing/access. When used it can propose labelled portion estimates and ingredients, never nutrient amounts. Provider failure falls back to local parsing. Unsupported foods/compounds/preparations remain unknown; this is a bounded fallback, not universal food coverage. Configured live USDA lookups supplement unmatched ingredients without discarding local matches. Partial food matches are not emitted as complete meal totals.

After saving, review and edit each food name/gram amount or remove an assumed component, then select **Save corrected portions & recalculate**. The journal also provides **Recalculate nutrition** for existing entries. It updates the same encrypted account-owned record and preserves its original time, type and symptom context. Recalculation is explicit; old entries are not silently rewritten.

Daily nutrition totals and dashboard values remain unavailable when a logged meal lacks that nutrient. A real sourced zero remains zero; an empty day remains zero logged intake. Historical monthly/yearly aggregates retain the earlier available-estimates behavior and are not complete intake measurements.

Sources: https://fdc.nal.usda.gov/api-guide/ and per-record URLs in the JSON catalogue.
