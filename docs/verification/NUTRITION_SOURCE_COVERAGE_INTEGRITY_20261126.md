# Recorded-meal source coverage integrity

Base `6fff59bb`; authorized source-safe consumer continuation after mounted anatomy/EE-01. Reuse `mealNutritionSummary` and existing daily journal. No new totals, diary completion authority, nutrient reference engine, art or tracker.

A stored macro total previously set `complete=true` even when the same meal's existing nutrient detail explicitly reported partial/unknown coverage. The corrected read model retains the exact stored amount and known-zero values, but respects explicit detail incompleteness. Legacy records without detail keep their existing behavior; source completeness is not whole-diary completeness or nutritional adequacy. Daily and historical readers use this same function.

The existing daily API returns algebraic zero totals for an empty entry array. Food journal now shows “No food intake recorded for today” and explicitly unknown diary completeness instead of a zero-intake progress display. A genuinely recorded zero-value meal still displays its known zero amounts. API totals, existing target configuration, source records, history arithmetic and correction flows are unchanged. The Log a meal action uses existing navigation.

RED regression reproduced the stored-macro coverage error.19 focused nutrition-display/history/catalog tests pass, including partial→complete correction and retained zero amounts. Eight production-built App cases pass at320/390 across Everyday/Athlete and light/dark, with empty versus recorded-zero source states, CSS200 reflow and keyboard entry navigation. The initial failed browser fixture omitted required `mealText`; that failure is retained locally, not counted as an app pass. Fixtures/API responses are synthetic and entirely intercepted; no actual account, database or external provider queried. Types, build/current media parity and reviewed capability crosswalk pass. Physical screen readers/hosted review NOT_TESTED; no Render attempt or protected-environment changes.

This is a narrow integrity prerequisite, not full BVA-0090 component-kit or scientific/clinical acceptance. The newly supplied V4.2 review and its frozen assets were untouched by this patch.
