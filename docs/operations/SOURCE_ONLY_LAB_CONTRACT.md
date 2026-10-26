# Unmapped laboratory source records — reader stage

The existing encrypted `lab` record kind accepts either the unchanged supported Lab schema or a strict source-only payload. No database migration, second importer or clinical marker registration is introduced.

A source-only payload requires `sourceOnly:true`, exact reported analyte/value/unit strings (unit may be null), source date/lab/method/fasting context and original sourceInput. Optional sourceReport identity and reported reference-interval text are retained. The original value/unit must exactly match sourceInput; no numeric coercion, guessed unit, canonical range, clinical flag or unitReview is allowed. Unknown keys, forged supported-marker fields and clinical metadata are rejected.

The account report exposes these records separately as `sourceOnlyLabs`. They are excluded from supported labs, latest results, pending-unit confirmation, trends, normalization, clinical flags, ranking and recommendations. The supported-marker confirmation endpoint returns409; owner isolation, encryption, idempotent laboratory receipts and raw account export remain the same. Named assays may be recorded as source-only without becoming supported clinical markers.

Reader/schema rollout must be verified before a normal writer emits this payload. This stage adds no ordinary web writer or source-only UI yet. An eventual reader backout must preserve source-only support once written. Future mapping must be explicit and reviewed; never infer an assay, unit or medical meaning from a name/magnitude.

Verification covers strict/forged shapes, exact threshold strings and missing units,0/1/2/6/8 dates×92 synthetic analytes with all other report outputs unchanged, encrypted authenticated API/receipt replay/unit rejection/account isolation/export. Counts are fixtures, not fixed product caps; existing per-import resource limits still apply. Isolated real-Neon smoke adds one synthetic source-only row and verifies report/export without clinical promotion. Actual clinical, source-pack and unknown-row writer acceptance remain separate.
