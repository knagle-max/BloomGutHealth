# Meal-save recovery increment

Scope: ARC-UT-03, UT-103 and MKT-INT-003. Extends the working capture/journal flow; original brand assets and clinical interpretation stay unchanged.

The meal form retains its entered description, selected products, date, portion and symptoms after an unsuccessful response. Its error state explains that a lost response can follow a successful save, offers an explicit retry, and links to the journal in a separate tab. Details remain in page memory only; no health draft or image is written to browser storage. Closing/reloading the page does not restore this attempt.

Each submitted payload receives a random save reference. Retrying identical details on the same open page reuses that reference; an intentional entry after success receives a new one. Changing and submitting details creates a new attempt, so the error state directs people to check the journal before editing an uncertain save.

The server scopes references to the authenticated account, hashes the validated request, and uses the existing meal primary key for cross-instance concurrency. A matching retry returns the saved record before analysis/provider work and without using another analysis allowance. Reusing the reference with different details returns 409. Concurrent first requests can both reach analysis, but the database stores one meal. Corrections preserve the original save receipt; a delayed retry returns the corrected record and cannot overwrite it. No migration or additional health-data copy is required. Clients that omit the reference keep their existing behavior. Deleting a meal also deletes its receipt; this is not a permanent tombstone or an offline queue.

Validation: TypeScript passed; all 144 Node tests passed; production build passed. The new Express/PGlite test covers a committed save followed by retry, concurrent duplicate writes, account separation, malformed keys, conflicting payloads, corrections and legacy requests. The Chromium synthetic runner aborts the first response after its simulated commit, verifies retained input/date and identical retry payload/reference, then confirms that a separate intentional save receives a different reference. Existing onboarding, unit review, photo permission, keyboard and responsive checks also passed. Browser providers are mocked; physical devices and independent specialist acceptance remain outstanding.

Publication target: existing `enhance/bloom-experience` Render review service. Final deployed commit/status is verified separately; this document does not confer release or specialist approval.
