# Account intent across tabs

ID01 P0 engineering safeguard. The account in the signed session remains the only server authority. The optional `X-Bloom-Actor` header expresses the account currently shown by the canonical AuthProvider; it cannot select another owner or grant access. A mismatch returns a static no-store409 `ACCOUNT_CONTEXT_CHANGED` before account/storage lookup. Missing sessions remain401. Legacy callers omitting the header remain session-owned.

Publish the compatible reader before the client. Reader5d14b67 reached Render LIVE dep-dbgvlp7b9u1s739dmgng on October28. Do not roll back to a server that ignores this header while keeping the emitting client.

The shared client transport snapshots derived identity and its generation in visit memory, overrides caller-provided actor headers, attaches only to same-origin owned API fetches, and discards late responses after an identity change (including A→B→A). It preserves raw HTTP conflicts for frozen report and lab reimport receipt handlers. Auth bootstrap/credential endpoints and foreign URLs receive no actor header. Session cookies, server authorization, existing same-origin protections and report-specific actor binding remain required.

AuthProvider cancels/clears cached queries before identity adoption, binds transport synchronously before exposing the adopted user, and prevents an older bootstrap response replacing a successful explicit login. Protected pages are keyed by adopted user ID, disposing private drafts when identity changes. A tab unaware of another tab's login keeps its existing draft but requests fail with a reload instruction; it never silently resubmits that draft for the new account.

Evidence:
- `tests/account-context.test.ts`: real production middleware/routes, encrypted PrecisionStorage and two synthetic PGlite owners. Red reproduction201 before guard; mismatch409 before account reads,401 without session, matching and legacy imports, stale destructive request denied, owner-only valid deletion.
- `tests/request-actor.test.ts`: actor override, exact receipt/raw409, header/body/credentials/signal preservation, auth/foreign exclusions, late responses and A→B→A suppression.
- `scripts/qa/account-context-journey.mjs`: actual App and transport, production guard and encrypted PGlite. Stale lab import denied, both owners empty, reload clears draft, matching owner saves clinical zero, session-switch deletion denied with stored other-owner result preserved.
- `scripts/qa/auth-context-race.mjs`: actual AuthProvider/transport with delayed bootstrap and explicit login, private cache cleared, adopted identity and subsequent request owner retained.
- Existing file-intake regression verifies exact source-only rows, lost-acknowledgement retry, explicit source review, and delayed file reads after navigation.

Private account, experience and health-source exports share the guarded download helper. The previous direct health-source download link now uses the owned request path; a generation check after blob loading rejects stale file creation. The synthetic browser additionally exercises a production-guarded test export endpoint, exact downloaded zero-valued source and denial before private reads. `tests/account-download.test.ts` holds the response body across an identity change and verifies no object URL/file is created. Old cached clients without the header retain legacy semantics until reloaded; this is a consistency safeguard for current clients, not a replacement for authorization. Synthetic tests do not establish real-owner hosted acceptance or full ID01 completion.
