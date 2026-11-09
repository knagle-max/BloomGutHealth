# Unified laboratory entry — UT-RED-205/207/208

Visible workflow changes:
1. One **Add lab results** entry point provides **Paste several** and **Enter one** submodes, replacing parallel entry forms.
2. Both modes retain the same report date, optional collection time, laboratory, method and fasting context. Date-only input keeps the existing noon ordering convention and does not claim a known collection time.
3. Row previews distinguish source units from provisional catalogue suggestions. Missing manual units also enter the existing confirmation queue; neither entry path silently verifies a guess.

| Matched synthetic component crop | Before (`3d754b2`) | After (this commit) |
| --- | --- | --- |
| 375px, light | [Original](before-labs-375-light.png) | [Candidate](after-labs-375-light.png) |
| 1440px, light | [Original](before-labs-1440-light.png) | [Candidate](after-labs-1440-light.png) |

The numbered callouts identify the visible changes. Unmarked originals are retained. Both crops hide floating shell chrome for capture only so it cannot obscure the component; real browser journeys retain the normal shell. Manifests record identical fixture, viewport, timezone, locale and clock, immutable baseline and dirty candidate. Reproduce with `node --import tsx scripts/qa/lab-layout-review.mjs`; optional `BLOOM_CAPTURE_ROOT`, `BLOOM_CAPTURE_STAGE`, `BLOOM_REVIEW_OUTPUT`, `BLOOM_PLAYWRIGHT_MODULE`, `BLOOM_CHROMIUM_EXECUTABLE`.

Recovery behavior: each reviewed row has an account-scoped save reference, preserved while retrying. Already acknowledged rows leave the queue. A response lost after persistence returns the same encrypted database record when retried; reusing a reference for different data fails with 409. Database transactions and the existing per-account lock work across server instances; no schema migration is required. Starting a separate reviewed import intentionally uses new references. Drafts and retry references remain in page memory; keep an uncertain save open and retry there. This does not claim draft persistence across a browser reload.

Unsupported rows can be corrected without reposting acknowledged rows. The existing confirmation action retains original numbers/units and creates its audited confirmation record. Source display preferences do not rewrite laboratory provenance or activate pending measurements.

Validation: TypeScript, 188 Node tests, production build and [synthetic browser outcomes](results.json). API/embedded PostgreSQL checks cover authentication, account isolation, retry after a new storage instance, concurrent retries, changed-payload conflict, manual provenance and encrypted storage. Browser checks simulate a lost committed response, retry the same key/payload, correct only rejected rows, retain source/date/time/assay context, confirm a manual missing unit and check 320–1440px reflow. The broader r6 journey also passed (onboarding, Athlete safety, lab confirmation, photo consent, meal retry, keyboard/reduced motion/zoom). Provider responses are mocked and records synthetic; physical devices, screen-reader and independent specialist acceptance remain open. Remote CI and Render are verified after push.
