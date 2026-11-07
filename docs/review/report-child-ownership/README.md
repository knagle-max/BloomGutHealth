# ID01 active report child writes

Composition and analysis inserts now require an explicit signed-session owner. An INSERT…SELECT filters the parent sample by owner+ID inside the insert statement; no matching parent means no child row and a static failure. This adds no separate parent lookup or per-row round trip. Generated IDs/timestamps, JSON, source zero, null confidence/explainability and optional cohort metadata retain normal storage semantics. Values are bound SQL parameters.

Local descriptive analysis and legacy report import pass session owner. Canonical receipt import keeps its existing owner/account-lock transaction and bulk child batching, while its internal adapters verify both owner and parent ID before accepting a pending row, analysis insert or status update. A message, caller-provided header or source document never establishes ownership.

Verification:13 focused real PGlite/report/API/receipt/rollback/demo/startup tests PASS; types/build/source inventory checks PASS. Foreign and absent-owner child writes fail without insertion; each allowed/denied insert makes exactly one logged SQL statement; quoted source names/JSON, zero, nullable metadata and optional arrays survive. Actual report App/HTTP/PostgreSQL paste/file/date/owned source/malformed200 exact-retry/no-duplicate/320px browser regression now uses the production child and parent helpers and passes. Existing canonical receipt bulk imports and child-failure rollback pass.

An initial type check required explicit aliases on Drizzle computed selection fields; aliases were added and the final type check/actual SQL tests pass. No transaction, owner check or schema validation was weakened. No schema migration, real-data mutation or restricted-output activation occurs.

Remaining: audit inactive legacy derived-record storage and non-HTTP/background boundaries separately, retain incident-disabled output filtering and independent exact-build security acceptance. This scoped engineering proof does not close all ID01 or v0.5.
