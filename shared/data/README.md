# Planning food snapshot

`planning-foods.json` contains 27 deliberately selected FoodData Central **SR Legacy** records retrieved on 2026-10-17 through USDA's public exploration API. Each record preserves its FDC ID, official description, data type, retrieval date and source URL. Nutrient values are per 100 g of edible food in the specified preparation. Numeric zeros come from the source; absent nutrients are omitted and remain unknown in calculations.

The snapshot supports offline calculation for the named preparations. It is not a comprehensive food database, a measurement of the user's product, or a resistant-starch/polyphenol assay. Cooked and dry weights are not interchangeable. Planning shopping lists report prepared edible quantities, not guessed raw purchase weights. No seasoning, salt or oil is silently added.

Sources and conventions:
- https://fdc.nal.usda.gov/api-guide/
- https://fdc.nal.usda.gov/data-documentation.html

Refresh with a private USDA key using `node --import tsx scripts/refresh-planning-foods.mjs`. Review every source identity and the resulting diff. The refresh script refuses missing records, changed descriptions or missing macronutrients, and does not automatically expand the reviewed catalogue. Broader user meal lookups use the separately configured USDA provider.
