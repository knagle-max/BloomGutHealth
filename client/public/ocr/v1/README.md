# Local source-image transcription assets

Pinned software: tesseract.js7.0.0, tesseract.js-core7.0.0 and @tesseract.js-data/eng1.0.0 (4.0.0_best_int). Copied package member bytes are unchanged; ASSET_MANIFEST.json records paths, source archive/member, SHA-256, byte counts and dependency licence receipts. Package-lock pins the installed library. No original user report image is stored here.

Only English LSTM recognition is used. All three7.0.0 LSTM core builds are self-hosted (baseline, SIMD, relaxed SIMD); the library selects the supported build. Each wasm.js contains its own WASM payload. Legacy recognition is disabled. The child worker, core and language paths are explicit same-origin URLs. No CDN fallback, persistent Tesseract/IndexedDB cache or external image inference is configured. Assets load on demand; they are not a clinical model or measured physiological data.

Upstream software/core licences: Apache-2.0 (original notices included). The language NPM package declares MIT in the preserved LANGUAGE-PACKAGE.json; its upstream naptha/tessdata repository distributes under Apache-2.0 (LICENSE-TESSDATA included). Other bundled dependency notices are preserved in worker.min.js.LICENSE.txt and third-party/. These are source licence records, not independent Legal/clinical or public-release sign-off.

Sources: https://www.npmjs.com/package/tesseract.js/v/7.0.0 ; https://www.npmjs.com/package/tesseract.js-core/v/7.0.0 ; https://www.npmjs.com/package/@tesseract.js-data/eng/v/1.0.0 ; https://github.com/naptha/tessdata/tree/gh-pages . Replacements must use a new versioned asset directory and updated receipts; do not overwrite v1 with a different model/library release.

The source image remains in browser memory. A component/account-scoped object URL supports original-image comparison and is revoked on replacement, new import or unmount. Only manually reviewed transcription reaches the existing source-text importer. Reading cannot determine a report identity/date, verify a unit, establish assay quality, perform a clinical interpretation or save a result automatically. Blank/invalid/large/slow/cancelled reads preserve the earlier draft.
