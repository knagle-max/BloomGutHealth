# Saved preference source revisions

GET /api/preferences keeps its existing strict canonical JSON body. It adds a strong ETag and X-Bloom-Preferences-Revision header derived from account ID and the actual stored JSONB source, including absence. The named header distinguishes this contract from older Express-generated weak ETags.

The shared web adapter captures the header in the existing query cache. The editor and optional Everyday setup pin the adopted revision and strip metadata before sending strict preference JSON. All three web readers use this adapter; malformed revisions and unavailable refreshes withhold current values. No second preference store is introduced.

Versioned PUT validates the quoted If-Match header and compares the stored source under a users-row lock inside a transaction. Mismatch returns409 without applying the draft. A missing version-aware storage adapter returns503 rather than silently downgrading. Old requests without a header retain their scalar update behavior; old readers can ignore headers and receive unchanged JSON.

Compatibility remains scoped: unversioned writers, including the older Profile preferences field, can overwrite after a versioned commit. Mandatory versioning and Experience/settings concurrency remain open. This is not universal CAS, allergy certification, or clinical clearance.

Local verification:350 tests, types/build, API92+13/source124; actual handlers/PGlite competing writes and strict JSON; two rendered tabs retain another exclusion and stale dirty selection; versioned first-goal setup preserves exclusions and actor guard; committed503 recovery refreshes sources; malformed headers withdraw summary values. Isolated real-Neon concurrent preference requests are included in CI; only claim them after the matching run succeeds.

No schema/credential changes. Keep the revision-aware server and adapter when reversing presentation changes. An older server remains legacy-compatible but cannot provide this versioned protection.
