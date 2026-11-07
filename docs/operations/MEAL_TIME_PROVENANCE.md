# Recorded meal time zone

FOOD-01 uses the existing mealContext JSON and loggedAt timestamp. New ordinary food entries capture the browser device time-zone identifier beside the UTC eatenAt instant. The input labels the device zone; this is not detected residence, restaurant location or a provider fact. Missing zone support remains null. No geolocation, IP lookup, new table, source credentials or historical data rewrite.

The schema accepts recognized bounded identifiers and rejects invalid ones before analysis/writes. Optional absence preserves legacy clients. An ingredient-only correction retains the existing context. A legacy correction that supplies context without a timeZone retains a known source zone only if the recorded instant is unchanged; a changed instant cannot inherit an unconfirmed old zone. Explicit null clears it. The existing private save receipt is preserved.

Saved meal details and journal context format a known recording zone explicitly, even when the viewer later uses another zone. Older unknown zones are not inferred. Daily grouping/history calendar semantics and the existing browser-local date entry interpretation are unchanged; this slice does not claim a new historical travel or ambiguous DST occurrence editor.

Evidence:6 focused timing/review/save tests pass, including invalid zone400, reviewed confirmation, original instant, legacy unknowns and correction rules. Actual App/HTTP/PostgreSQL save→correct→reload journey captures America/Regina, switches the viewer to UTC and verifies the original zone remains visible without extra meals or nutrient changes. Types/build/source checks pass. Exact commit CI/Render publication is recorded in DEVELOPMENT_LOG.md.
