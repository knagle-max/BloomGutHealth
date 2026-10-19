# Developer evidence

Local runtime: Node 24.19.0; repository targets Node >=22. The existing cloud workflow uses Node 22 and isolated Neon; this increment does not claim those cloud results before they run.

- TypeScript: passed.
- Node: 143 tests passed, including embedded PostgreSQL encrypted lab confirmation, concurrent requests and two-account rejection.
- Production bundle: passed. Existing Browserslist/PostCSS/chunk-size notices are build tooling notices; no new provider/browser capability is inferred from the build.
- Browser: `scripts/qa/architect-r6-browser.mjs` uses a real Chromium renderer and synthetic intercepted APIs. It tests UI flows; Node tests separately exercise real Express and PostgreSQL storage. No external AI/vendor request occurs in the browser fixtures. Provider and physical-phone acceptance remains separate.
- Visual: `scripts/qa/brand-comparison.mjs` records unchanged baseline and candidate. Same fictional persona, no personal history, no live account cookies/credentials, both modes and themes. Full PNGs/manifests/gallery are delivered in the comparison package. Runtime font networking is blocked consistently; system fallback is the tested font.
- Accessibility: keyboard entry/focus, reduced motion, 320/390/768/1440 reflow, semantic tables and a desktop CSS-zoom-200% surrogate are Developer checks, not full WCAG AA, real screen-reader or native-browser zoom certification.

Run browser tools with an independently installed Playwright module (or `BLOOM_PLAYWRIGHT_MODULE`) and its browser. The controlled runtime can point `BLOOM_CHROMIUM_EXECUTABLE` at its installed Chromium. `BLOOM_CAPTURE_ROOT` selects an immutable baseline checkout and `BLOOM_REVIEW_OUTPUT` selects comparison output. Synthetic tests are not participant research or specialist implementation approval.
