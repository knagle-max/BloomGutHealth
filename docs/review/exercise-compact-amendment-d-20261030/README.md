# Amendment D compact child sets — local review evidence

Binding owner v1.4 text is attached to MKT-EXAI-2813–2815 in the exercise reconciliation. Original v1.4 ZIP/SVG is unavailable in this workspace; no transfer/hash/exact SVG-parity claim. Scientific and source gates retained. Independent Design approval is OPEN.

Before captures pin only ActivityReview.tsx and ActivitySetEditor.tsx at f5f7eb8743503ceec5b147f5e77b402fcc15c1c0, using current App/API/styles. This is a labelled component-source comparison, **not** a clean historical build. After captures use this change. Same synthetic source, date, pending state, viewport and theme for paired 320/390 light/dark captures. Unmarked originals retained. Separate two-completed capture demonstrates explicit user action, not the baseline state.

Visible changes (annotated after390):
1. One exercise parent with count, uniform repetitions and actual load range from its reviewed children.
2. Compact child rows with separate44px completion/edit targets. Pending circles replace verbose expanded fields; edits disclose one child's existing controls.
3. Completion summary reports actual confirmed count; initially0of5, explicitly marking1+2 gives2of5. The two-completed image is intentionally a different interaction state, not a matched before/after.

Verification: exercise-compact-set-journey uses actual App/HTTP handler/encrypted PGlite persistence and real mode settings. Exact source produces Running unknown plus five10rep rows50/50/50/55/55lb. Independent Set2 edit, Set4 correction, keyboard status toggle,44px targets, no overflow320/390 light/dark, original text/stable IDs, save/reload/Everyday/Athlete/2of5 pass. Existing rich capture journey verifies exact retry, per-set unit conversion, planned/cancelled, add/remove/duplicate, blank/invalid amounts, Today/Progress and account isolation; unitless journey verifies saved kg/lb editable defaults and numeric preservation. Unit tests cover parent summary unknown/mixed/zero/load ranges and completion after edits/deletion.

Accessibility: Chromium keyboard Space/Enter, separate buttons, aria-pressed, expanded/controls, labelled full set facts, visible focus CSS and accessibility-tree snapshot are automated evidence. Actual Apple VoiceOver was **not run** (no macOS/iOS/VoiceOver environment); actual VoiceOver acceptance remains OPEN. Screenshots are local synthetic evidence, not authenticated Render/device captures or independent visual approval. Read-only cancelled rows retain the actual Cancelled label; no fabricated skipped/performed state is introduced.

Reproduce: set BLOOM_PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright and BLOOM_CHROMIUM_EXECUTABLE=/usr/bin/chromium, then node --import tsx scripts/qa/exercise-compact-set-journey.mjs. Optional BLOOM_PARSER_SOURCE_REF=f5f7eb8 selects the documented two-component baseline only. Source commit: the implementation commit containing this packet; exact pushed SHA/CI/deployment tracked in NEXT_ACTIONS.

After evidence refreshed following keyboard/new/invalid-child recovery and approved evergreen/semantic-token alignment. Exact compact encrypted journey reverified. Before source pins remain unchanged. Actual original-SVG and independent visual/VoiceOver acceptance remain open.

Theme-evidence correction2026-10-30: earlier exercise captures changed browser color preference without changing the app's saved theme, so those dark-labelled captures did not prove dark mode. This packet is now regenerated through actual app header/mobile-menu theme controls with explicit DOM-theme assertion. Before now pins all three collaborating components (ActivityReview, ActivitySetEditor, TrainingSetsEditor) atf5f7eb8 to keep their exports coherent; remaining current App/API/styles unchanged. Actual completion/source/canonical checks reverified; historical uncorrected dark-labelled packets are not dark acceptance evidence.
