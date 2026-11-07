# Food Review macro discrepancy audit — 2026-10-26

Architect §41–43 / ARC-REVIEW-01 and owner clarification: investigate literal overview zero despite nonzero detail. Do not attribute it to missing nutrients or treat illustrative644kcal/portions as actual source values.

## Confirmed controlled defect

Actual local food analysis, canonical planner HTTP save and PostgreSQL persistence for `0.5 g almonds` produce:

| Field | Persisted canonical amount | Prior overview | Detailed source |
| --- | --- | --- | --- |
| Protein |0.11g|0g|nonzero|
| Carbohydrate |0.11g|0g|nonzero|
| Fat |0.26g|absent on AddFood confirmation;0g journal badge|nonzero|

The API/SQL values are correct in this controlled case. `Math.round`/`toFixed(0)` in overview/journal/Today and different detail precision caused false displayed zero. New shared display formatting keeps positive sub-unit values positive, preserves actual zero, and keeps null/nonfinite/negative unavailable. No stored food/source amount, macro conversion or nutrient sum changes. AddFood confirmation includes the missing fat metric. Detail and overview use the same precision helper; energy-unit conversion remains independent.

`meal-macro-parity-journey.mjs` verifies actual food/HTTP/PostgreSQL save→same-ID correction→reloaded journal and one row; before fails0vs0.11, after passes. Corrected expectations come from actual persisted values, not illustrative portions or precomputed fake macros. Unit tests cover tiny positive values, true zero and unknowns.

## Actual owner case remains open

For the reported text `Sweet potato, ground beef with taco seasoning, avacado, shredded cheese and salsa`, a local-only current analyzer audit returns partial known nutrient contributions and null complete totals, rather than literal persisted zeros. This is neither the authenticated hosted meal nor proof that the owner saw missing values. No portion,644kcal total, source match or root cause is inferred for the owner case. Current authenticated meal ID, original source/DTO snapshot and deployed version were not available in this environment; no real session was minted or health record edited.

The confirmed fractional-display defect is fixed; the captured owner incident requires independent hosted reproduction and same-ID field tracing. Remaining contracts: complete/partial/null/truezero, source/correction replacement identity, typo/preparation/market, aggregation/export and independent device/Design/Biology acceptance. Full review-layout redesign is separate; original new editable Food Review assets have not yet been retrieved/versioned here. Current public AddFood readiness stays based on actual three working methods; a handoff's historical five-route wording does not activate unfinished image/menu providers.
