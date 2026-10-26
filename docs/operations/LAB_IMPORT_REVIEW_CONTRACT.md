# Atomic laboratory source-match review

`POST /api/precision/labs/import` is an authenticated, account-scoped, no-store initial-import action. Its strict body contains an original supported or source-only payload and a list of `reviewedMatchIds`; an8–128 character idempotency key is mandatory. Date successors and confirmed/forged unit revisions are rejected. Date/unit changes use their dedicated reviewed actions.

The storage adapter explicitly advertises `insertReviewedLab`. If unavailable, the action returns503 without trying the legacy record API. The legacy API retains its existing behavior while the new boundary is verified before ordinary client adoption.

Under the existing owner transaction lock, an exact committed receipt is checked first. Reusing a key for different source facts returns409. Otherwise only owned lab IDs and encrypted lab payloads are loaded, validated and reduced to canonical active unit/date successors. Unclassifiable lab sources fail closed. The existing advisory source-fact comparison includes supported/raw separation, exact raw threshold and unit absence, assay/date/reference context, current-import exclusion and distinct known report/specimen identifiers.

The server compares the actual candidate ID set with the supplied reviewed set. A changed set returns409 `LAB_REIMPORT_REVIEW_REQUIRED` with current owned candidate IDs and performs no insertion. The owner may explicitly review these matches and record a separate result with the same uncommitted source/key. No result is automatically merged, deleted or treated as a proven duplicate. Deleted candidates also require a refreshed review set. Foreign IDs are not review authority and reveal no foreign record.

Receipt replay precedes comparison so a committed response loss cannot create a second record or become stuck behind later matches. The receipt binds source facts and account; acknowledgment metadata may change only for an uncommitted attempt. Same-import receipt recovery is separate from cross-import match review.

The request list has a1000-ID safety bound and rejects duplicates. This bounds review-request size, not the number of reports, markers or retained lab records. Very large candidate groups require a separately reviewed UX rather than truncation or automatic merging.

`tests/lab-import-review.test.ts` uses actual Express/encrypted PGlite to verify simultaneous stale previews, explicit separate insertion, exact receipts/mismatch, owner scope, deleted candidates, missing adapter/no fallback, raw thresholds, same-import handling, active confirmed candidates and legacy compatibility. The isolated Neon smoke verifies the same transaction boundary on the existing CI branch. This server batch does not yet switch the ordinary browser importer; client handling of changed matches must preserve acknowledged rows, frozen source facts and uncertain-response receipts before adoption.
