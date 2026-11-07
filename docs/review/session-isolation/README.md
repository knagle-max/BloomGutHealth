# XSEC-UT-03 session withdrawal

The signed server session remains authoritative. After successful login/signup/logout, AuthProvider sends only a fixed session-change notification over a visit-scoped BroadcastChannel. Unsupported channels use a random nonce-only localStorage event; no account IDs, credentials, drafts, report values or other health data are broadcast or persisted. A notification cannot select a user or authenticate: the receiving tab synchronously withdraws its user/private DOM, clears queries and notices, cancels query reads, invalidates old auth reads, and asks `/api/auth/me` again. Failed reads leave private content withdrawn.

Pagehide performs the same synchronous withdrawal before a potential history snapshot. Persisted pageshow rechecks the real session. Protected page identity keys and loading state dispose old drafts. Ordinary visibility changes are not used to erase an unfinished draft. When both browser coordination APIs are unavailable, existing actor-request rejection and manual reload remain necessary.

Owned response readers (JSON/text/blob/arrayBuffer/formData/bytes) now recheck the captured identity generation after body completion, including cloned responses. Raw409 status/headers/body contracts stay available to receipt handlers; a late body cannot apply old-account data after an identity change. Guarded private downloads additionally check before creating the file.

PDF cancellation now explicitly settles pending document/page/text operations against the cancellation signal, cancels the active text reader and disposes its native worker. This includes a stalled worker that never returns a document setup receipt. It avoids leaving the decoder operation pending after the outer file deadline/replacement returns.

Evidence:
-Actual AuthProvider two-tab browser fixture passes BroadcastChannel and storage-only modes. A held server recheck proves prior draft, cached data and private notice are gone before another identity is adopted; matching-owner requests, failed recheck, logout and persisted lifecycle withdrawal/recheck are covered.
-Lifecycle events are injected PageTransitionEvents, not a claim of physical-device/browser BFCache acceptance.
-Existing actual App/production guard/encrypted PGlite stale-lab/import/delete/private-export journey and delayed-bootstrap explicit-login regression pass.
-PDF App/native-worker/encrypted-store journey passes in dev and built production: a stalled GetDocRequest is cancelled by replacement; direct decoder cancellation settles; workers terminate; normal source review/zero/threshold/date/limits remain intact.
-Transport test holds a cloned409 response body across account change; JSON/text readers reject with static account-change error.
-Full434-test run passed433 and failed one source-crosswalk hash check after edits; source inventory refreshed and the failed check plus affected transport/download/PDF tests pass (9 focused). Separate account/security/transport9 pass. Types/build pass; exact published CI will run the final full suite.

This engineering increment does not close all ID01/XSEC-UT-03 independent acceptance criteria, enable restricted features, or change server authorization, cookies, production credentials or account data.
