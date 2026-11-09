# Unmapped laboratory source records — reader stage

The existing encrypted `lab` record kind accepts either the unchanged supported Lab schema or a strict source-only payload. No database migration, second importer or clinical marker registration is introduced.

A source-only payload requires `sourceOnly:true`, exact reported analyte/value/unit strings (unit may be null), source date/lab/method/fasting context and original sourceInput. Optional sourceReport identity and reported reference-interval text are retained. The original value/unit must exactly match sourceInput; no numeric coercion, guessed unit, canonical range, clinical flag or unitReview is allowed. Unknown keys, forged supported-marker fields and clinical metadata are rejected.

The account report exposes these records separately as `sourceOnlyLabs`. They are excluded from supported labs, latest results, pending-unit confirmation, trends, normalization, clinical flags, ranking and recommendations. The supported-marker confirmation endpoint returns409; owner isolation, encryption, idempotent laboratory receipts and raw account export remain the same. Named assays may be recorded as source-only without becoming supported clinical markers.

Reader/schema rollout must be verified before a normal writer emits this payload. This stage adds no ordinary web writer or source-only UI yet. An eventual reader backout must preserve source-only support once written. Future mapping must be explicit and reviewed; never infer an assay, unit or medical meaning from a name/magnitude.

Verification covers strict/forged shapes, exact threshold strings and missing units,0/1/2/6/8 dates×92 synthetic analytes with all other report outputs unchanged, encrypted authenticated API/receipt replay/unit rejection/account isolation/export. Counts are fixtures, not fixed product caps; existing per-import resource limits still apply. Isolated real-Neon smoke adds one synthetic source-only row and verifies report/export without clinical promotion. Actual clinical, source-pack and unknown-row writer acceptance remain separate.

## Explicit writer and source display

After the corrected reader is CI/deployment verified, the canonical paste parser offers source-only candidates for rejected explicit2–4 comma/tab columns. Supported parsing and ordinary error disposition are unchanged. Quoted/ambiguous/malformed/oversized rows remain correctable. Users explicitly choose Keep N source-only rows, review original value/unit/section/row and confirm the same receipt-backed save path. Remaining errors stay unsaved; correction-only passes exclude acknowledged raw rows and retain original report positions/import identity.

Canonical source history includes sourceOnlyLabs with the explicit no-interpretation badge, source reference text and missing-unit state. These rows never enter supported normalization or clinical outputs. Raw-only deletion retains existing clinical plans; clinical or unreadable source deletion keeps conservative invalidation. Report/specimen grouping remains source organization, not verified panel identity or automatic file/concurrent deduplication. See docs/review/source-only-labs-20261026 for selective workflow evidence.

## Active supported planning inputs

Canonical reporting and transactional weekly save now share activeLabObservations for supported labs. Pending units and superseded originals are not clinical source IDs; the current confirmed row is. Strict source-only rows remain nonclinical. Unclassifiable stored laboratory payloads deny saving even if an internal request lists their IDs. Context/preferences checks and clinical numeric rules remain unchanged. The isolated Neon smoke covers pending-source save, confirmation and a subsequent save with only the current source.
