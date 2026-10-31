# What's Changed in Science — Bloom UX delivery
Source: User Testing `Bloom_User_Testing_Evidence_Change_Explanations_Addendum_2026-10-31.md`.
Status: **interactive design prototype**, not deployed app or approved science claims.

## Files
- `prototype.html`: self-contained editable, responsive, accessible-oriented HTML/CSS/JS prototype with update-category, personal-measurement and availability-state switchers. No packages or external media required. Open in browser.
- `UI_CONTRACT.json`: developer-facing typed boundaries and state expectations.
- `ACCEPTANCE.md`: task-level test script, including negative inference checks.
- `ASSET_MANIFEST.json`: asset inventory, brand tokens, route and status.

## UX flow
Biology → Science Explorer → What's changed → four-field explanation → study details / history → personal assay provenance. Use one claim-level cluster for meaningful reviewed changes only, not per-paper notifications.
All five update categories appear in scenario selector. Only receptor mechanism is grounded in cited science; other update categories are **explicit synthetic fixtures** and must not appear as actual science news.
Open browser at 320px, 200% zoom, light/dark, keyboard. Source order is logical. Other work remains required: actual screen reader auditing, real-device testing and production application logic.

## Developer
Wire to *existing* versioned evidence and claim lifecycle. Never build duplicate knowledge graph, ingest pipeline, recommendation pipeline or notification engine. Actual claim revisions must come from reviewed records. Allow source link and history one action from update. Personal relevance requires assay, analyte, date, rank, and provenance. Unreviewed research never activates interventions. Do not claim the mock observation is the user's own.
