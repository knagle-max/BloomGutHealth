# Current Profile revision contract

Scope: canonical current sex, age, height, weight and activity inputs for one authenticated account. This is a source-value revision, not a monotonic event version, dated measurement or audit history. Unrelated dietary preferences are excluded so their refresh cannot manufacture a demographic conflict.

`GET /api/profile` retains its private owner response and adds `profileRevision`, a SHA-256 digest of account ID and the five exact saved inputs. Password is excluded. Reads/writes are no-store. No schema or credential changes.

A quoted single `If-Match: "<64 lowercase hex>"` binds a save to the reviewed source. Wildcards, multiple values and malformed/unquoted headers return400. The storage helper selects the account row FOR UPDATE inside a transaction, compares the current revision, and updates only after a match. A mismatch returns409 without applying the draft; transaction failures roll back. Existing authentication, active-account and owner guards remain.

The current web Profile pins the revision from its adopted source, preserves dirty drafts, and does not silently upgrade that revision after another client writes. A409 refreshes linked sources while retaining unsaved fields; explicit Load latest replaces the draft before another versioned save. This also resets measurement hydration when saved measurements themselves did not change. A malformed returned revision blocks Save. Known save adopts refreshed values after completion; ambiguous503 never claims success and keeps its draft.

## Compatibility boundary

The header remains optional for pre-existing clients. Their old scalar-update behavior is unchanged and is intentionally tested. A legacy unversioned writer can still overwrite a versioned write after it commits. A server without the new read contract is also treated as legacy by the web app. Therefore this is atomic conflict protection for versioned current web saves, not proof of universal Profile/settings CAS or a completed whole-account concurrency gate.

Follow-up: inventory every writer and supported client/version, establish a staged requirement for versioned writes, and independently address Experience/settings conflicts. Never describe optional revision handling as a security authorization boundary; owner/session checks apply regardless of header.

## Verification and backout

Tests use isolated synthetic PostgreSQL/PGlite rows and actual authenticated/owner-scoped handlers. They check two competing same-source saves produce one winner, stale/other-account/malformed revisions fail safely, nulls remain null, passwords stay withheld and the explicit legacy path remains. The rendered two-tab journey uses the actual Profile routes/helper/SQL; stale submit preserves dirty fields and explicit latest review permits a new bound save. Invalid source revision denies Save. Isolated production CI includes real Neon concurrent requests; claim it only after that exact CI succeeds.

No live health/account data was read or changed by this work. No migration is needed. Keep the revision-aware reader/server comparison when backing out presentation changes; returning to an unaware server removes the versioned-write guarantee. Retain the compatibility limitation in release status until mandatory versioned writes and remaining settings boundaries are actually verified.
