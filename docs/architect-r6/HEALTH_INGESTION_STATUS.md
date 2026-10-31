# V0.5 external health ingestion — implementation boundary

Historical contract-only snapshot. Later code adds encrypted source storage, account-scoped inspection/export/revocation/deletion routes and Progress observations, with no native connector activation. See [current reconciliation](../architecture/V05_IMPLEMENTATION_STATUS.md) and `server/health-source-{storage,routes}.ts` for the present boundary. The contract-only statements below apply to the original increment.

Updated 2026-10-18. Branch: `enhance/bloom-experience`.

## What is implemented
- `shared/health-ingestion.ts`: strict type/units/offset dates, per-source record identity and explicit source revisions.
- `shared/health-reconciliation.ts`: per-provider, per-metric consent gate; revocation; bounded all-or-nothing validation; exact replay recognition; same-revision conflict rejection and batch source reconciliation.
- Tests: `tests/health-ingestion.test.ts`, `tests/health-reconciliation.test.ts`.

These are **pure contracts**; no route calls them, no health device is connected, no observation is written to the database, and there is no native HealthKit/Health Connect permission dialog. A web browser alone cannot read Apple Health directly.

## Required next vertical slice
1. Approve iOS/native integration strategy, access permissions, and data processors with Product Owner, Architect, Security, and Legal. Do not activate fictional 'connected' cards.
2. Design an encrypted account-owned observation store, explicit consent ledger and scoped retention/revocation/deletion. Persist only accepted required fields, with bounded bulk operations and transaction-safe source-version compare-and-swap.
3. Add authenticated, CSRF-protected connector ingestion and import-status endpoints; deny cross-account access; verify native client/token provenance; do not trust a provider string in posted JSON.
4. Build source-specific incremental cursor handling, provider deletions, late/backfilled corrections, time zone/interval semantics and duplicate readings across Apple Watch/iPhone. Daily steps from overlapping providers must not be summed by default.
5. Offer source priorities, measurement provenance and manual override, plus user-facing disconnect and delete flows. Never reinterpret wearables as medical diagnoses or energy expenditure as measured food intake.
6. Run synthetic replay/race/failure, real-device permission denial/revocation, reinstall, sync outage, DST/travel, encryption/erasure and accessibility tests. Independent specialist sign-off and actual CI results still required.

Source interpretation: Architect revision 6 explicitly treats Apple Health/Health Connect/native-platform work as conditional and not delivered; this contract does not change that status.
