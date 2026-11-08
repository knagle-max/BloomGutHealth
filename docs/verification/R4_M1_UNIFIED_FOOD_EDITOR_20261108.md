# R4/M1 canonical Food composer — engineering checkpoint

Branch: `enhance/bloom-experience`. Original source: `docs/design/r4-m1/Bloom_User_Testing_Food_Capture_Edit_Unification_Handoff_2026-11-07.md`. This checkpoint is implementation evidence, not RC approval or completion of unrestricted natural-language interpretation.

One immediate “What did you eat?” composer now serves creation, Journal Edit, source reuse and ingredient correction. Optional enabled capture methods follow it in one disclosure. Journal's alternate POST/PUT forms and immediate recalculation editor are removed. Saved details remain readable; corrections reopen the canonical review. Specific row action says “Change amount”; Change food and Remove remain explicit. Confirmed and unreviewed ingredient edits survive adding another selected source. Invalid unfinished rows require completing their fields before adding a source; missing known facts remain unknown.

The additive owned composer GET and reviewed PUT reuse the existing analyzer, source revision and meal row. A row-lock transaction compares the original record revision, preserves original date/type/context unless intentionally changed, and retains one bounded latest-command receipt. Account, target, request and source revision bind that receipt. Exact retry returns the committed record before analysis/budget work. Stale, concurrent, foreign and deleted records cannot be overwritten. The existing driver/schema/infrastructure are unchanged; tests use isolated synthetic PostgreSQL/PGlite only. Legacy PUT remains for older API clients; new UI never calls it.

| Requirement | Bounded disposition |
| --- | --- |
| UT-FOOD-UX-5301 | Immediate editable text verified; independent three-second human task test not run. |
| UT-FOOD-UX-5302 | One canonical composer for new/edit/reuse/correction; actual UI/API/SQL journeys verified. |
| UT-FOOD-UX-5303 | Explicit amount/food/remove controls, canonical draft retention verified. |
| UT-FOOD-UX-5304 | Reviewed-source recomputation, stale preview withdrawal and canonical cache invalidation retained. Full source/partial/zero regression passes; no new nutrition engine. |
| UT-FOOD-UX-5305 | Owned conditional update, latest exact-command replay and concurrent edit tests pass; actual committed503→retry updates one row. |
| UT-FOOD-UX-5306 | Journal Edit loads canonical ingredients; changed text invalidates incompatible saved ingredients; original timestamp including seconds preserved. |
| UT-FOOD-UX-5307 | One final Save meal/Save changes; source/record conflict requires re-review or explicit latest-record reload. |
| UT-FOOD-UX-5308 | 320/390/768/1440, both modes/light-dark, keyboard return and200% text checked. Physical keyboard/device/VoiceOver acceptance not run. |
| UT-FOOD-UX-5309 | Existing premium tokens/art retained; nested capture panels reduced. Independent design judgment pending; owner waived screenshot deliverables. |
| UT-FOOD-UX-5310 | Existing label/generic/manual/source/unknown disclosures retained. No invented additional source data or claims. |
| UT-FOOD-UX-5311 | Saved-template scaling/source retry, optional search/barcode drafts, original date/type/zero context verified. Physical capture/model acceptance remains scoped separately. |
| UT-FOOD-UX-5312 | Engineering navigation/focus checks pass; independent novice/expert comprehension measurement not run. |
| UT-FOOD-UX-5313 | Owned target, deletion and race checks pass; existing aggregate/deletion regressions retained. |
| UT-FOOD-UX-5314 | Retained draft/paused/error/source409/committed503 recovery and partial source behavior retained. |

## Actual validation

- `tests/meal-edit.test.ts` + `meal-review-source.test.ts`:6 PASS, real HTTP and isolated SQL, including concurrent correction and stale receipt after intervening edit.
- Full unit regression:653 tests,652 PASS; one stale source-crosswalk fingerprint failure. Inventory refreshed after source review and its2 focused tests PASS. Do not represent the initial full invocation as green; publication CI is authoritative for the exact committed tree.
- Actual App `unified-meal-editor-journey.mjs`: immediate text; optional search/Back draft retention; Journal Edit; independent portion review; one-row lost-response retry; original time/type/zero context; return focus/reload; description invalidation; two owners; four widths/both modes/themes and200% text.
- Composition variants: corrected and still-dirty150g banana survive adding a selected USDA source, exactly two canonical rows, no consumption write.
- Existing create pre-save journey: no write before review; dirty totals withdrawn; one exact receipt after committed response loss.
- Recent-meal reconciliation journey: canonical Journal edit preserves corrected source facts; Today/Progress agree before/after owned deletion; independent original recipe/history remains. The synthetic original timestamp explicitly matches its declared historical source date. Production DELETE admission is covered separately, not inferred from this local fixture.
- Existing saved-template journey: encrypted source, scaling, correction, source-read failure/retry, owner and immutable template preservation.
- Optional method/capability journey and16 Food/Journal M1 viewport cases pass. Strict TypeScript/build, original media and source inventories checked.

## Reproduced open acceptance defects — continue engineering

F-01's exact description “2 eggs and 2 slices of toast” currently matches a creamed-egg source with290g for the eggs. F-06 “two burgers without buns, chicken skewers and salad” currently picks a Burger King cheeseburger source. These are pre-existing deterministic interpretation/source-selection defects reproduced directly against the actual analyzer; editable confirmation does not make these acceptance cases pass. Do not label Food or v0.5 complete. Next task: correct safe generic/preparation/exclusion matching or abstain where the source cannot honor the description, with independent varied fixtures and actual review/save checks. Do not invent a model, provider or scientific clearance. Other F-case human/physical/visual acceptance remains explicitly unperformed where applicable.

No main merge, production mutation or unrelated v0.6 code. The earlier approval pause is superseded; remaining safe engineering is ACTIVE.
