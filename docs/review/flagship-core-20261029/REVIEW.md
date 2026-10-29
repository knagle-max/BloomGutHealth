# Flagship core usability — phase1 review packet

Authority: MKT-FLAG-UX-2026-10-26-A1, original `design/bloom/flagship/2026-10-26/contracts/UX_BLUEPRINT.md` and `IMPLEMENTATION_CONTRACT.md`, owner/architectbf0cc56 and subsequent2b7f7c3. Original archive transfer8933079 is complete. This is a working Food→Today slice using existing components/stores, not full-app fidelity or launch approval. Later contracted surfaces remain in the approved programme; new feature expansion is paused.

## Changes to inspect

- Everyday primary navigation: Today / My biology / Progress. Explore and existing tools remain in navigation; routes/data are retained. Header and Today lead to the neutral Add Food chooser, without starting the camera.
- Today: original palette's evergreen editorial hero, one dominant Add food action even after logging, existing contextual guidance as secondary action. Compact overview uses the same journal summary for real energy/protein/carbs/fat, preserving partial/unknown/zero. No fake ring or inferred target; empty/read-error states withdraw numbers.
- Review: scanable source/food rows, compact Food/Amount or Servings, explicit Change food, Remove, Add, source notes, original ingredient identities and current source calculations. Invalidated review cannot save; pending/unknown outcome retains work. The bound remains20 source-supported entries, not a fixed row count.
- Confirmation: only after canonical acknowledgement; focused persistent status before the next-entry chooser, current canonical summary (including known partial contributions), reviewed food snapshot and explicitly labelled original description, View Today / journal / Add another meal. Original description is retained without presenting it as the corrected ingredient list. Redundant toast no longer obscures the confirmation.
- Mobile menu exposes the existing theme preference at320px. Portal theme colours change together; screenshot capture waits for the actual close animation rather than capturing a closing dialog over the review.

## Engineering evidence

`scripts/qa/flagship-core-journey.mjs` runs actual React App, source analysis/review/confirm HTTP handlers and PostgreSQL through injected PGlite. Five-food fixture: change a100g generic ingredient to a private source at2.5label servings without mass reset; change banana to150g; remove/add another row; explicit review then save. Source numbers are controlled synthetic inputs, not package verification, dietary advice or predicted biology. No external provider is called.

Assertions: zero pre-confirm rows, exact body/key/revision recovery after a committed save's reply is lost, one journal row, five canonical ingredients, unchanged ownership, identical saved/Today/journal/Progress source totals, stale totals withdrawn after read failure, keyboard-capable controls and no horizontal overflow. Separate tiny-positive/partial saved-overview and indexed replacement regressions preserve old behavior. Full Node suite451/451 passes; final source type/build and exact pushed CI/Render are tracked in NEXT_ACTIONS.md.

Original baseline is a clean pinned9ea2295a3948e88733dd48eccaf767a9f9c6b130 worktree. The fixture checks API backend source against the selected ref and removes only its own temporary checkout/cache. `before/verification.json` records source, viewport checks and canonical values. Final `after/` is clean pinned runtime79f99180484cb74f20b9366dacd2346253ae51a1; both receipts have identical canonical totals, one row, five ingredients and zero browser errors. Selective numbered first-use/review annotations accompany unmarked originals. Exploratory candidate images were removed.

Exact runtime79f9918: Actions40805415246 SUCCESS,451/451 tests, production build and isolated-Neon persistence including post-delete daily/monthly/yearly totals and coverage PASS. Renderdep-dbhap67b9u1s739lg820 LIVE at the same full SHA; public startup serving10000 and USDA Branded status=ok/returned20. This verifies deployment, not authenticated hosted screenshots or independent Design acceptance.

Matrix:320/375/390/430/1280, first use and populated review, light/dark; plus chooser, uncertain save, confirmed save, recorded Today, journal, Progress and read failure. These are **local synthetic App/API/SQL screenshots**, not hosted Render or independent device acceptance. See before/after folders and verification receipts. Inspect actual images rather than relying only on a green script.

## Recorded differences / review required

- No concept-image values, food photography, simulated physiology or generated illustration is used. Existing approved Bloom assets and installed/system fonts are retained.
- Source chips use “Your label”, “Selected source”, “Estimated match”, “Needs review” or “Draft”, because a selected/private record cannot truthfully be called “Label verified”.
- Compact native row disclosures show current food/portion/source, open existing amount and source controls, and retain per-row drafts. Rows needing review and new rows open automatically; a source change returns focus to the same item rather than jumping to the summary. No modal/data engine is introduced. Assess density/touch operation against the blueprint.
- Today date changes remain available through the existing journal controls rather than a new date/store implementation. The full Athlete/Biology/Progress/profile surface programme is not closed by this phase1 snapshot.
- Source notes and unknowns remain discoverable; no safety, permission or licensing gate changed. No full WCAG/screen-reader/200percent/physical-camera/fidelity approval is claimed.

Branding & UX: review this actual build's hierarchy, source/state wording, palette/typography, row density, focus, light/dark and widths, and record targeted changes or exact-build acceptance. Independent testing and scientific/privacy/legal review remain separate. No external message or approval is inferred from this packet.

## Owner walkthrough on the existing review service

After the exact source deployment is LIVE, open https://bloomguthealth.onrender.com using your existing account (do not recreate Tester1). Today → Add food → Describe what I ate → enter five foods with amounts → Review meal → change an amount/source or add/remove a row → Update meal review → Save meal → View Today → Food journal / Progress. Use actual available records or your own package label; the synthetic private label in engineering screenshots exists only in the fixture. Unknown source values remain unavailable. A failed acknowledgement offers retry of the same reviewed entry rather than another new save.

Direct authenticated Render screenshots are not established by local evidence. Earlier hosted access was proxy403; current Render status/commit/build can be verified through the connector. Obtain authorized hosted mobile/desktop captures when available, retaining exact SHA and source/state context.
