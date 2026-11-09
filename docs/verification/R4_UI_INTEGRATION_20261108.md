# R4 UI integration — 2026-11-08

The supplied final Designer and Branding packages now drive the seven main views. The original archives are recorded in [the import receipt](../../design/visual-system/R4_IMPORT_VERIFICATION_20261108.json); originals remain byte-identical. This is engineering evidence, not independent Design approval or a declaration that every v0.5 backlog item is finished.

Implemented:

- One exact canonical R4 stylesheet, imported once. Cascade layers preserve legacy layout while allowing the authored palette/type rules to win without specificity escalation. The previous provisional decorative skin is inactive in premium mode.
- Exact original `bloomCopy.ts`; approved headline/introduction copy in Today, Food, Biology, Explore, Progress, Athlete and Profile. Dynamic actions, recorded facts, source dates, unknown values and save receipts retain their existing owners.
- All 87 original SVGs copied byte-identically to registered public paths; original navigation icons now used in sidebar, drawer and bottom navigation, with existing text labels and destinations. Three Everyday/five Athlete destinations preserved.
- All 13 original PNGs preserved. Twenty-six source-linked WebP derivatives provide two sizes without cropping, retouching or upscaling. Two decorative cutouts occupy desktop introduction slots; hidden at narrow widths and in forced colors, absent from active food capture/review. No conceptual microbiology raster is presented as a personal observation.
- Existing component and portal HSL tokens derive from the exact authored palette, including navy Athlete in both themes. Source CSS and optional historical art examples are unchanged; missing example URLs are never activated.
- Progress retains converted read-only measurements and links to the sole shared unit editor in Profile. No duplicate settings mutation controls.
- Runtime asset browser check PASS: served original asset bytes match local fingerprints and exactly one correctly labeled wordmark is visible across six routes/two modes/both themes. Athlete uses the original light wordmark on its always-navy header, including light theme.
- Shared dialog/drawer close targets are 44px with title clearance. Native keyboard close/focus restoration and separate compact-set completion/edit targets retained.

Local evidence (synthetic fixtures or isolated encrypted SQL; no production data):

- TypeScript and production build PASS. Build verifies original/public/built artwork hashes, copy/CSS identity, original PNG metadata and derivative source bindings.
- Seven-route responsive matrix: 56 cases, four widths (320/390/768/1440), two themes, 200% root text, unchanged semantic action order, exact authored canvas/type, intended text/action color contrast, no document overflow. Native menu keyboard close/Escape/focus restoration and 44px close targets PASS.
- Actual App/API/encrypted SQL food review/save/reload, source deletion retry, immutable history, explicit zero/unknown values and owner isolation PASS.
- Actual genetic-source view/confirmation/activation/deactivation/stale rejection, delete with lost-response retry, keyboard focus and owner isolation PASS.
- Profile/units regression PASS: failed save retains values, conversions preserve canonical amounts, incomplete drafts retain labeled units, Profile/Athlete reference values remain independent, dated observations retain source units, Progress links to the sole Profile unit editor. Existing grouped Account/setup disclosures are opened through their native controls.
- Compact Athlete sets PASS: five source-derived children, separate 44px targets, only sets 1/2 completed, independent set 2 edits/unit changes, stable IDs, add/remove/focus, encrypted save/reload, planned status preserved; five widths and both themes.
- Food chooser PASS: search/manual/recent prominence, barcode retained, drafts survive method switches, capability fallback, unavailable methods absent and no writes. Explore actual App/science/food HTTP PASS: three subject choices, global search, source studies/map, no automatic personal food, context cleared on subject changes, keyboard/44px/320390/dark/200% reflow.
- Biology source-count states PASS: empty/qualitative/pending/mixed, both modes, 320/390, keyboard source navigation and paused-query withdrawal; no writes or clinical promotion.
- Full regression run: 648/649 passed; the sole failure was a stale source-crosswalk fingerprint during integration. Refreshed after source review; focused crosswalk rerun 2/2 PASS. Final CI will provide the immutable-commit full-run result. Source map: 52 IDs / 247 source files; API inventory unchanged.

Commands: `npm run check`; `npm run build`; `npm test`; `node --import tsx --test tests/capability-crosswalk.test.ts`; `BLOOM_R4=1 BLOOM_UI_SHELL_TARGETS=1 node --import tsx scripts/qa/visual-materials-parity.mjs`; the food/source, unit-editor, compact-training and Biology journeys under `scripts/qa`. Browser commands use the configured Playwright/Chromium paths. Screenshots are opt-in; no new gallery is part of this delivery.

Still to establish on the published immutable commit: CI and Render status, final integrated owner review, physical-device/VoiceOver and independent specialist acceptance. No such approval is claimed here. Main is unchanged. v0.6 remains at stash `f0fd36479176b1daa7b8c5525306292b10670d8f`; no v0.6 work was applied. The separate 32-image Anatomy branch is not merged.

Original designer Markdown includes authored hard-break spaces and CSV payloads retain CRLF; these are preserved rather than normalized. Whitespace checks exclude the three original source directories; edited application/scripts/docs pass.
