# R4/M1 Biology — supplied registry integration and runtime verification

Integrated Architect branch checkpoint `22e72a8f0338ce6fc96f78c37ea6963711d83d6c` (10 commits after f5e), including its draft-display policy, two original registry copies, specialist audit, typed resolver and UI changes. Terminal Git credentials are unavailable; the connected GitHub transport is used for an expected-head-checked development-branch publication. Original changed files were reconstructed against f5e and matched their GitHub blob IDs; remote base tree is `25fc19053448b0f46b07fcc9e9e720cbe381f827`. No main operation or contributor reset.

## Runtime content

The original supplied registry remains unchanged at its two committed paths. Git blob identity is `8b21c7c330a076db9d90887a2cc725c5897cdb78`. The explicitly versioned active editorial revision is `shared/data/biology-content-r4m1-v2.json`, with original provenance and **DRAFT_NOT_INDEPENDENTLY_APPROVED** retained. `shared/biology-content.ts` is its typed projection; legacy organism explanations and marker education are adapters to this same active registry, not independently authored alternatives.

- All 14 supported marker drafts expose function, directional contributors, importance and discussion context. Registry citations carry study design and scope. Existing source-value/range/assay/date and unknown-unit controls remain intact. Source-specific interval framing abstains when units, assay or bounds cannot support it.
- All 94 supplied organism labels can display their available draft, limited or unresolved text. This is **16 reviewed_draft + 61 limited + 17 unresolved_identity**, not 94 evidence-approved profiles. Additional pre-existing contextual entries remain separately identified and limited; they are not added to the original 94 denominator. There are zero independently approved cards.
- Original scientific/coverage status is never promoted by runtime access. Full citation-review status is visible in deeper disclosures. Four specialist-flagged evidence-applicability problems remain open in the supplied text; no assertion of claim-by-claim approval.
- Exact names and explicit historical aliases resolve in one lookup. A provided genus/family rank cannot inherit a species card. A historical Eubacterium hallii alias resolves to A. hallii with taxonomy/culture citations; A. soehngenii and arbitrary strains do not become aliases. Original source spelling remains in the title and source record.
- Preview/detail copy now shares a projection. Unknown future names have one identity-specific sentence and the original report, without four repeated research-placeholder disclosures. Existing functional research still requires its strict citation/pathway join and now rejects explicit rank mismatches.
- Dialog disclosure state resets when source, name or rank changes. Report/sample/owner/focus behavior stays in existing canonical workflow. Portraits fit narrow zoomed dialogs while retaining original dimensions at normal widths.

## Executed checks

- 19 focused content/rank/source/crosswalk tests PASS, including all 14+94 resolution, preview/detail parity, original-registry bytes, draft status preservation, invalid source ranges and citation withdrawal.
- Full unit run: **661/662 passed**; the sole failure was stale crosswalk fingerprints after integration. The crosswalk was refreshed after source review and both crosswalk tests plus the affected content tests passed. This is not mislabeled as an all-green full run; post-publication CI must execute the final suite.
- New actual-App journey PASS: all 94 profiles display the exact canonical three sections; alias/citation, rank mismatch, unknown state, source facts, absent amount, zero, sample/account isolation, Escape/focus, four widths × Everyday/Athlete light/dark × 100/200% text zoom; no writes or screenshots.
- Existing actual-App functional journey PASS: research filtering, cited pathways, true zero, search, source withdrawal/switch, strain abstention, source citations, Back/Escape/focus, 320/390 light/dark, no writes.
- Existing actual-App organism journey PASS: 20 quantified + 20 functional-parser observations, original precision/raw assay/QC/method/taxonomy data, unknown amount, comparison scrolling, report search/selection, paused-source withdrawal, keyboard trap/return, five widths, light/dark, original art bytes/dimensions, offline art fallback and 200% text zoom.
- Supported-marker browser journey and TypeScript/build results are recorded in `R4_M1_BIOLOGY_LAB_CONTENT_20261108.md`; canonical registry migration also passed focused tests. Final publication CI/Render status must be checked separately.

## Still open

Complete developer-only inventory across all public fixtures/source-only analytes, quality lint and coverage report; remaining organism specificity/citation remediation; final integrated RC regression and immutable deployed preview verification. Independent scientific, novice and physical-device acceptance NOT RUN. No final RC or main approval checkpoint is opened by this increment. No v0.6 work.
