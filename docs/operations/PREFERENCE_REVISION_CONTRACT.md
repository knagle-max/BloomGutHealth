# Saved preference source revisions

GET /api/preferences keeps its existing strict canonical JSON body. It adds a strong ETag and X-Bloom-Preferences-Revision header derived from account ID and the actual stored JSONB source, including absence. The named header distinguishes this contract from older Express-generated weak ETags.

The current web's shared preferences adapter captures the header in the existing query cache. The editor and optional Everyday setup pin the adopted revision and send a quoted If-Match. Metadata is stripped before strict preference JSON is sent. All three web readers use the same adapter; malformed revisions and failed/paused refreshes withhold current values. No second preferences store is introduced.

Versioned PUT validates the header and compares the stored source under a users-row lock inside a transaction. A mismatch returns409 without applying the draft. A versioned request never falls back to an unaware storage adapter. Old requests without a header retain their existing scalar update behavior. Old readers receive unchanged JSON and can ignore headers.

Compatibility remains scoped: unversioned writers, including the older Profile preferences field, can still overwrite after a versioned commit. Mandatory versioning and remaining Experience/settings concurrency remain open. This is not universal CAS, allergy certification, or clinical clearance.

Local verification:350 tests, types/build, API92+13/source124 checks; actual handlers/PGlite competing writes, strict JSON and ownership; two rendered tabs preserve another exclusion and retain stale dirty selection; versioned first-goal setup preserves exclusions/actor guard; committed503 recovery refreshes sources; malformed headers withdraw summary values. Isolated real-Neon concurrent preference requests are included in CI but must be claimed only after the matching run succeeds.

No schema or credential changes. Keep the revision-aware server/adapter when reversing presentation changes. An older server remains legacy-compatible but does not provide versioned preference protection.
