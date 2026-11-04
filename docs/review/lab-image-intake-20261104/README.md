# Local report-image review — 2026-11-04

Eight unannotated source-component captures:320/390 CSS-pixel viewports, actual application light/dark themes. Before pins only QuickLabEntry.tsx to3ceb4c9; App, handlers, styles, synthetic report and API fixture are current in both. The same synthetic PNG is requested after an ALT9/prior-date draft. Before has only the text-file path and rejects the image, preserving that draft; after uses the new image action and shows the editable transcription with date deliberately empty. These different outcomes demonstrate the feature; they are not identical final data states. Before's unsupported selection is programmatically supplied to its file input, not a physical picker interaction.

Visible callouts:

1. The optional report-image disclosure adds local PNG/JPEG reading and a visible decimal/unit/column review warning.
2. Original-image comparison is keyboard-focusable and internally scrollable; full-resolution source stays available beside the editable transcription without widening the page.
3. Zero,3.20 and the raw threshold/reference remain editable; date/context are deliberately cleared for source review. File limits move behind a separate disclosure while review caution stays visible.

Captures are tall component crops, not physical-phone screenshots. They show the expanded image/comparison state; the image path is collapsed by default. No automatic save or date inference. The canonical preview/provisional-unit/source-only/save workflow remains required. Clinical accuracy, physical phone/Safari, VoiceOver, hosted authenticated acceptance and independent Design review remain pending.

Reproduce with scripts/qa/lab-image-intake-journey.mjs: BLOOM_IMAGE_REF=3ceb4c9 for before; BLOOM_IMAGE_CAPTURE=1 for after; set BLOOM_REVIEW_OUTPUT to a fresh directory and the documented local Playwright/Chromium environment. Full journey without capture flags additionally verifies actual model PNG/JPEG, encrypted save, timeout/cancel/replacement/unmount/account withdrawal and worker cleanup. BLOOM_IMAGE_PRODUCTION=1 uses the production build.
