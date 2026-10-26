# Optional lab report identity — reader rollout

`Lab.sourceReport` is optional source metadata within the existing encrypted record payload:

- `importId`: UUID identifying a Bloom import action. It is not a laboratory-issued report ID, an authorization credential or proof of deduplication.
- `reportIdentifier` and `specimenIdentifier`: optional exact user-entered strings, each at most200 characters; no trimming, inferred taxonomy or clinical verification.

The strict reader rejects unknown metadata keys and malformed identifiers. Legacy records retain absent metadata rather than inheriting another row's context. This metadata does not change nutrient/clinical calculation, comparability, unit confirmation, access control or consent. Record ownership continues to govern access; coincident UUIDs in different accounts confer no relationship or access.

Current read paths preserve identity through encrypted save/reload, unit-confirmation supersession, account export, latest-result details and longitudinal source details. Original row/section/value/unit metadata remains independent. There is no schema migration, second importer/store or normal web writer in this stage.

Publish and verify this aware reader before a normal writer emits metadata. Once metadata is written, any backout must retain the reader; rolling back to an older strict lab schema can discard or reject newer context. Future writer work must keep an import reference across retries/correction-only drafts and distinguish new imports, printed report identifiers, specimens and possible reimports. A generated import UUID alone must never be presented as complete panel identity or duplicate detection.

Local verification includes strict/legacy shape, exact whitespace, changed specimen separation, encrypted API/account isolation, unit confirmation, owned export roundtrip and rendered latest/history/legacy/zero/source-date/mobile checks. Real-Neon smoke adds the same source identity to its existing synthetic lab and asserts export parity without new rows. Exact release evidence is recorded in DEVELOPMENT_LOG.md.

## Ordinary writer and source-history view

After the aware reader is verified, QuickLabEntry writes one importId for the current report-entry action. It retains that reference across previews, uncertain-save retries and correction-only passes. Start another import creates a fresh reference and clears printed identifiers. Nonblank report/specimen fields retain exact supplied text; no collection time, specimen type, lab-issued identity or source grouping is inferred from a UUID.

LabSourceHistory derives from existing active labHistory and pendingLabs. Exact import/report/specimen tuples group source rows; inconsistent identifiers split rather than misattribute them. Original rowOrder controls ordering where recorded. Arbitrary reported headings remain source labels. Old rows without metadata remain unlinked, with no date-based panel inference. Pending units show original numbers/units and remain excluded from clinical interpretation. Existing delete and refresh paths remain canonical.

This stage does not detect independently reimported files, verify provider identifiers, support new unknown analytes or claim complete panel identity acceptance. Those remain explicit backlog items. See docs/review/lab-source-history-20261026 for visible evidence.
